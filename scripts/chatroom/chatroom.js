$(function () {
    // === SignalR setup === 
    const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7246/chatroomHub")
        .configureLogging(signalR.LogLevel.Information)
        .withAutomaticReconnect()
        .build();

    async function start() {
        try {
            await connection.start();
            console.log("SignalR Connected.");
            try { hideReconnectingOverlay(); } catch (e) { /* ignore if overlay not present */ }
            // After a manual start, ensure we rejoin the room group so server broadcasts reach us
            try {
                if (typeof activeRoomCode !== 'undefined' && activeRoomCode) await joinSignalRGroup(activeRoomCode);
            } catch (e) {
                console.warn('Could not rejoin room group after start', e);
            }
        } catch (err) {
            console.log(err);
            setTimeout(start, 5000);
        }
    };

    connection.onreconnecting(error => {
        console.assert(connection.state === signalR.HubConnectionState.Reconnecting);
        // show a full-screen reconnect overlay while SignalR tries to reconnect
        try { showReconnectingOverlay(); } catch (e) { console.warn('Could not show reconnect overlay', e); }
    });

    connection.onreconnected(async connectionId => {
        try {
            hideReconnectingOverlay();
            // rejoin the room group so we're listening in the correct group
            try {
                if (typeof activeRoomCode !== 'undefined' && activeRoomCode) await joinSignalRGroup(activeRoomCode);
            } catch (e) {
                console.warn('Failed to rejoin room group on reconnected', e);
            }
            showToast({ text: 'Reconnected', bgColor: "#5C4297", hideAfter: 2000 });
        } catch (e) {
            console.warn('Error handling reconnected', e);
        }
    });

    connection.onclose(async () => {
        await start();
    });

    // Start the connection.
    start();

    async function joinSignalRGroup(roomCode) {
        try {
            await connection.invoke("JoinRoomGroup", roomCode, YapperzAPI.getSession().id);
        } catch (err) {
            console.error(err);
        }
    }
    
    async function leaveSignalRGroup(roomCode) {
        try {
            await connection.invoke("LeaveRoomGroup", roomCode);
            console.log("Successfully left room group!");
        } catch (err) {
            console.error(err);
        }
    }

    async function sendMessage(message) {
        try {
            await connection.invoke("SendMessage", activeRoomCode, me.id, message);
        } catch (err) {
            console.error(err);
        }
    }

    connection.on("ReceiveMessage", (userId, message) => {
        console.log(`${userId}: ${message}`);

        for (const id in avatars) {
            const a = avatars[id];
            if (a.id == userId) {
                // console.log("BBB");
                showBubble(a, message);
            }
        }
    });

    // Server will send the full user DTO when a new player joins.
    connection.on("NewPlayerJoined", (user) => {
        try {
            console.log("NewPlayerJoined:", user);
            if (!user || !user.id) return;

            // If the joined user is the current session user, ensure `me` is set/updated
            if (session && user.id === session.id) {
                // create or update local avatar
                const spawned = getSpawnPosition();
                me = createAvatar(user, canvas.width / 2, canvas.height / 2);
                avatars[user.id] = me;
                showToast({ text: `${getDisplayName(user)} rejoined`, bgColor: "#5C4297", hideAfter: 2000 });
                return;
            }

            // Avoid duplicates
            if (avatars[user.id]) {
                // update display name/avatar if needed
                avatars[user.id].displayName = user.displayName || avatars[user.id].displayName;
                avatars[user.id].avatarPath = user.avatarPath;
                return;
            }

            const spawn = getSpawnPosition();
            const a = createAvatar(user, spawn.x, spawn.y);
            // store full avatarPath on created avatar
            a.avatarPath = user.avatarPath;
            showToast({ text: `${getDisplayName(user)} joined the room`, bgColor: "#5C4297", hideAfter: 2500 });
        } catch (err) {
            console.error("Error handling NewPlayerJoined", err);
        }
    });

    connection.on("PlayerLeft", (userId, displayName) => {
        delete avatars[userId];
        showToast({ text: `${displayName} left`, bgColor: "#5C4297", hideAfter: 2000 });
    });

    // === DOM elements setup ===
    const chatTextfield = $("#chat-textfield");
    const canvas = document.getElementById("world");
    const ctx = canvas.getContext("2d");
    function resize() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
    $(window).on("resize", resize);
    resize();

    // === game settings ===
    var showNames = true;
    var showTextBubbles = true;
    var mute = false;

    const session = YapperzAPI.getSession();
    if (!session) {
        YapperzAPI.ensureAuthenticated({ redirectToLogin: true });
        return;
    }

    const activeRoomData = YapperzAPI.getActiveRoom();
    const activeRoomCode = (() => {
        if (!activeRoomData) return null;
        if (typeof activeRoomData === "string") return activeRoomData.trim();
        if (typeof activeRoomData === "object") {
            // Prefer .code but fall back to alternate casing when possible
            return activeRoomData.code || activeRoomData.roomCode || activeRoomData.RoomCode || null;
        }
        return null;
    })();
    if (!activeRoomCode) {
        window.location.href = "../../index.html";
        return;
    }

    // Create/update a small overlay showing the current room code (top-left)
    function setRoomCodeOverlay(code) {
        if (!code) return;
        let el = document.getElementById('room-code-overlay');
        if (!el) {
            el = document.createElement('div');
            el.id = 'room-code-overlay';
            document.body.appendChild(el);
        }
        el.textContent = `Room code: ${code}`;
    }

    // Reconnect overlay helpers - whole-screen transparent overlay with spinner/text
    function showReconnectingOverlay() {
        let el = document.getElementById('reconnecting-overlay');
        if (!el) {
            el = document.createElement('div');
            el.id = 'reconnecting-overlay';
            el.innerHTML = '<div class="reconnect-spinner" aria-hidden="true"></div><div class="reconnect-text">Reconnecting...</div>';
            document.body.appendChild(el);
        }
    }

    function hideReconnectingOverlay() {
        const el = document.getElementById('reconnecting-overlay');
        if (el) el.remove();
    }

    setRoomCodeOverlay(activeRoomCode);

    var me;
    loadRoomUsers(activeRoomCode);

    // Ensure the SignalR connection is in the room group for this chatroom.
    // If connection isn't started yet, start() will resolve automatically; call start() then join.
    (async () => {
        try {
            // Ensure the connection is established without trying to start it when
            // it's already in a non-disconnected state (connecting/reconnecting).
            async function ensureConnected(timeoutMs = 5000) {
                const State = signalR.HubConnectionState;
                if (connection.state === State.Connected) return;
                if (connection.state === State.Disconnected) {
                    await connection.start();
                    return;
                }

                // If connecting/reconnecting, wait until Connected or timeout
                const startWait = Date.now();
                while (connection.state !== State.Connected) {
                    if (Date.now() - startWait > timeoutMs) throw new Error('Timed out waiting for SignalR connection');
                    await new Promise(r => setTimeout(r, 100));
                }
            }

            await ensureConnected();
            await joinSignalRGroup(activeRoomCode);
            console.log('Joined SignalR group for room', activeRoomCode);
        } catch (err) {
            console.warn('Could not join SignalR group automatically', err);
        }
    })();
    
    const bgImg = new Image();
    YapperzAPI.getRoomByCode(activeRoomCode).done((room) => {
        bgImg.src = '../../assets/images/backgrounds/' + room.theme;
    });

    let bgImgLoaded = false;
    bgImg.addEventListener("load", () => { bgImgLoaded = true; });
    const avatars = {};

    // keyboard input state for local player
    const input = { left: false, right: false, up: false, down: false };
    // map keys: arrows and WASD
    window.addEventListener('keydown', (e) => {
        if (chatTextfield.is(":focus")) return; // ignore when typing in chat
        switch (e.key) {
            case 'ArrowLeft': case 'a': case 'A': input.left = true; e.preventDefault(); break;
            case 'ArrowRight': case 'd': case 'D': input.right = true; e.preventDefault(); break;
            case 'ArrowUp': case 'w': case 'W': input.up = true; e.preventDefault(); break;
            case 'ArrowDown': case 's': case 'S': input.down = true; e.preventDefault(); break;
        }
    });
    window.addEventListener('keyup', (e) => {
        if (chatTextfield.is(":focus")) return; // ignore when typing in chat

        switch (e.key) {
            case 'ArrowLeft': case 'a': case 'A': input.left = false; break;
            case 'ArrowRight': case 'd': case 'D': input.right = false; break;
            case 'ArrowUp': case 'w': case 'W': input.up = false; break;
            case 'ArrowDown': case 's': case 'S': input.down = false; break;
        }
    });

    $("#leave-btn").on("click", () => {
        // best-effort: notify hub to leave group, then call API and go back
        leaveSignalRGroup(activeRoomCode)
            .finally(() => YapperzAPI.leaveRoom(activeRoomCode))
            .finally(() => {
                const el = document.getElementById('room-code-overlay');
                if (el) el.remove();
                window.location.href = '../../index.html';
            });
    });

    // click to move local player
    $("#game-wrap").on("click", function (e) {
        const rect = canvas.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
        const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

        // set target for local player (me)
        me.targetX = clickX;
        me.targetY = clickY;
        me.speed = 180; // px/sec
    });

    $("#toggle-mute-btn").on("click", function (e) {
        // maybe later after midterm when we have sound effects
        mute = !mute;
        $(this).attr("title", mute ? "Unmute" : "Mute");
        $(this).children("i").first().toggleClass("hide-slash", !mute);
        $("#audio-theme").prop("muted", mute);
    });

    $("#toggle-names-btn").on("click", function (e) {
        showNames = !showNames;
        $(this).attr("title", showNames ? "Hide names" : "Show names");
        $(this).children("i").first().toggleClass("hide-slash", showNames);
    });

    $("#invite-btn").on("click", async function (e) {
        try {
            await navigator.clipboard.writeText(activeRoomCode);
            showToast({ text: "Room code copied", bgColor: "#5C4297", hideAfter: 3000 });
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    });

    $("#toggle-chat-btn").on("click", function (e) {
        showTextBubbles = !showTextBubbles;
        $(this).attr("title", showTextBubbles ? "Hide chat" : "Show chat");
        $(this).children("i").first().toggleClass("hide-slash", showTextBubbles);
    });

    $("#fullscreen-btn").on("click", function (e) {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            $(this).children("i").first().addClass("hide-slash");
        }
        else {
            document.exitFullscreen();
            $(this).children("i").first().removeClass("hide-slash");
        }
    });

    // simulating other players moving randomly (demo)
    setInterval(() => {
        Object.values(avatars).forEach(a => {
            if (a === me) return;
            if (Math.random() < 0.2) {
                a.targetX = Math.random() * (canvas.width - 40) + 20;
                a.targetY = Math.random() * (canvas.height - 40) + 20;
                a.speed = 80 + Math.random() * 80;
            }
        });
    }, 1800);

    window.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !chatTextfield.is(":focus")) {
            input.right = 0;
            input.left = 0;
            input.down = 0;
            input.up = 0;
            chatTextfield.focus();
            e.preventDefault();
        }
    });

    chatTextfield.on("keydown", function (e) {
        if (e.key === "Escape") { $(this).blur(); e.preventDefault(); return; }
        if (e.key === "Enter") {
            const text = chatTextfield.val().trim();
            if (text.length > 0) {
                // showBubble(me, text);
                sendMessage(text);
                chatTextfield.val("");
            }
        }
    });

    // animation loop
    let last = performance.now();
    function loop(now) {
        const dt = (now - last) / 1000; // seconds
        update(dt);
        render();
        last = now;
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // === functions for game ===
    function loadRoomUsers(roomCode) { // already joined players
        YapperzAPI.getRoomUsersByRoomCode(roomCode)
            .done(users => {
                if (!Array.isArray(users)) {
                    console.warn("Unexpected room users response", users);
                    return;
                }

                users.forEach((user, index) => {
                    if (!user) return;
                    if (user.id === session.id) {
                        me = createAvatar(user, canvas.width / 2, canvas.height / 2);
                        return;
                    }

                    const spawn = getSpawnPosition();
                    createAvatar(user, spawn.x, spawn.y);
                });
            })
            .fail(err => {
                console.error("Failed to load room users", err);
            });
    }

    function getSpawnPosition() {
        return {
            x: Math.random() * (canvas.width - 40) + 20,
            y: Math.random() * (canvas.height - 40) + 20
        };
    }

    function createAvatar(user, x, y) {
        const a = {
            id: user.id,
            displayName: user.displayName,
            x,
            y,
            vx: 0,
            vy: 0,
            targetX: x,
            targetY: y,
            speed: 0,
            bubble: null,
            bubbleTime: 0,
            size: 28,
            avatarPath: user.avatarPath
        };
        // console.log(a);
        avatars[user.id] = a;
        return a;
    }

    function showBubble(avatar, text, duration = 3000) {
        avatar.bubble = text;
        avatar.bubbleTime = duration;
    }

    function update(dt) {
        // update all avatars toward their targets (simple linear movement)
        for (const id in avatars) {
            const a = avatars[id];
            // keyboard control for local player: WASD / arrows
            if (a === me) {
                const mx = (input.right ? 1 : 0) - (input.left ? 1 : 0); // 1 when pressing right, -1 when pressing left
                const my = (input.down ? 1 : 0) - (input.up ? 1 : 0); // 1 when pressing down, -1 when pressing up
                if (mx !== 0 || my !== 0) {
                    const len = Math.hypot(mx, my) || 1;
                    const speed = a.speed || 180; // px/sec when using keyboard
                    const vx = (mx / len) * speed;
                    const vy = (my / len) * speed;

                    // update position with boundary checks
                    if ((vx > 0 || a.x > 20) && (vx < 0 || a.x < canvas.width - 20)) {
                        a.x += vx * dt;
                    }
                    if ((vy > 0 || a.y > 20) && (vy < 0 || a.y < canvas.height - 20)) {
                        a.y += vy * dt;
                    }

                    a.vx = vx; a.vy = vy;
                    // keep target in sync so other logic doesn't fight keyboard
                    a.targetX = a.x;
                    a.targetY = a.y;
                }
                else { // fall back to target-based movement when no keys pressed
                    if (a.targetX == null || a.targetY == null) {
                        a.vx = a.vy = 0;
                    }
                    else {
                        const dx = a.targetX - a.x;
                        const dy = a.targetY - a.y;
                        const dist = Math.hypot(dx, dy);
                        if (dist > 2) {
                            const speed = a.speed || 120; // px/sec
                            const vx = (dx / dist) * speed;
                            const vy = (dy / dist) * speed;
                            a.x += vx * dt;
                            a.y += vy * dt;
                            a.vx = vx; a.vy = vy;
                        }
                        else {
                            a.vx = a.vy = 0;
                        }
                    }
                }
            }
            else {
                if (a.targetX == null || a.targetY == null)
                    continue;

                const dx = a.targetX - a.x;
                const dy = a.targetY - a.y;
                const dist = Math.hypot(dx, dy);

                if (dist > 2) {
                    const speed = a.speed || 120; // px/sec
                    const vx = (dx / dist) * speed;
                    const vy = (dy / dist) * speed;
                    a.x += vx * dt;
                    a.y += vy * dt;
                    a.vx = vx; a.vy = vy;
                }
                else {
                    a.vx = a.vy = 0;
                }
            }

            // bubble timer
            if (a.bubbleTime > 0) {
                a.bubbleTime -= dt * 1000;
                if (a.bubbleTime <= 0) a.bubble = null;
            }
        }
    }

    function getDisplayName(user) {
        return user.displayName;
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // background (grid/grass)
        ctx.fillStyle = "#7cc26b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // background image (fill set to cover to preserve aspect ratio and crop to fill)
        if (bgImgLoaded) {
            const iw = bgImg.width;
            const ih = bgImg.height;
            const cw = canvas.width;
            const ch = canvas.height;
            const scale = Math.max(cw / iw, ch / ih);
            const sw = iw * scale;
            var sh = ih * scale;
            const dx = (cw - sw) / 2;
            const dy = (ch - sh) / 2;
            ctx.drawImage(bgImg, dx, dy, sw, sh);
        }
        else { // simple ellipse ground if no bg image
            ctx.fillStyle = "#e6d0a4";
            ctx.beginPath();
            ctx.ellipse(canvas.width * 0.4, canvas.height * 0.6, canvas.width * 0.45, canvas.height * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // sort by y for depth (avatars lower on screen appear above)
        const list = Object.values(avatars).sort((A, B) => A.y - B.y);

        list.forEach(a => {
            drawAvatar(a);
        });
    }

    function drawAvatar(a) {
        const s = a.size;

        // draw shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(a.x, a.y + s * 0.8, s * 0.6, s * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        const img = new Image();
        img.src = a.avatarPath;

        // draw avatar image (if loaded) centered at avatar position
        // if (typeof a.imgIndex === 'number') {
            var drawW = s * 3;
            var drawH = s * 2.6;
            const dx = a.x - drawW / 2;
            const dy = a.y - drawH + s * 0.9;
            ctx.drawImage(img, dx, dy, drawW, drawH);
        // }

        // name label
        if (showNames) {
            ctx.font = "14px pixelFontMain";
            ctx.textAlign = "center";
            ctx.fillStyle = "#000";
            ctx.fillText(a.displayName, a.x, a.y + s * 1.1);
        }

        // bubble
        if (a.bubble && showTextBubbles) {
            drawBubble(a.x, a.y - s * 0.9, a.bubble);
        }
    }

    function drawBubble(x, y, text) {
        ctx.font = "16px pixelFontMain";
        const padding = 8;
        const metrics = ctx.measureText(text);
        const w = metrics.width + padding * 2;
        const h = 22;
        // bubble bg
        ctx.fillStyle = "white";
        roundRect(ctx, x - w / 2, y - h - 8, w, h, 6, true, false);
        // border
        ctx.strokeStyle = "#222";
        ctx.lineWidth = 2;
        roundRect(ctx, x - w / 2, y - h - 8, w, h, 6, false, true);
        // text
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.fillText(text, x, y - h / 2 + 6 - 10);
    }

    function roundRect(ctx, x, y, w, h, r, fill, stroke) {
        if (typeof r === "undefined") r = 5;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
    }

    function showToast(opts) {
        // remove any existing toast elements created by the plugin
        $(".jq-toast-wrap").find(".jq-toast-single, .jq-toast").remove();

        const defaults = {
            text: opts.text || "",
            showHideTransition: opts.showHideTransition || "fade",
            bgColor: opts.bgColor || "#333",
            textColor: "#ffffff",
            allowToastClose: false,
            hideAfter: typeof opts.hideAfter === "number" ? opts.hideAfter : 4000,
            stack: 1, // ensure plugin-level stack is 1
            textAlign: opts.textAlign || "left",
            position: opts.position || "bottom-center",
            loader: opts.loader !== undefined ? opts.loader : false
        };

        $.toast(defaults);

        setTimeout(() => {
            $(".jq-toast-wrap").remove();
        }, defaults.hideAfter + 300);
    }
});