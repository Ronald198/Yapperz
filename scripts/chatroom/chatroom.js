$(function () {
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
    var mute = true;

    // === game state ===
    // preload avatar images once and reuse (temp derisa t behet backendi)
    const avatarImgPaths = [
        "../../assets/images/avatars/batmanAvatar.png",
        "../../assets/images/avatars/boyAvatar1.png",
        "../../assets/images/avatars/girlAvatar1.png",
        "../../assets/images/avatars/girlAvatar2.png",
        "../../assets/images/avatars/girlAvatar3.png",
        "../../assets/images/avatars/pixelCat1.png",
        "../../assets/images/avatars/pixelCat2.png",
        "../../assets/images/avatars/bri.png",
        "../../assets/images/avatars/gezi.png",
        "../../assets/images/avatars/roni.png",
    ];
    const avatarImgs = [];
    const avatarImgsLoaded = [];
    avatarImgPaths.forEach((p, i) => {
        const im = new Image();
        im.src = p;
        avatarImgs[i] = im;
        avatarImgsLoaded[i] = false;
        im.addEventListener("load", () => { avatarImgsLoaded[i] = true; });
    });
    // preload background image and track loaded state (temp derisa t behet backendi)
    const bgImg = new Image();
    bgImg.src = "../../assets/images/backgrounds/simplePark.jpg";
    let bgImgLoaded = false;
    bgImg.addEventListener("load", () => { bgImgLoaded = true; });
    // Avatar model: { id, x, y, vx, vy, color, name, targetX, targetY, bubble, bubbleTime, isChibi, imgIndex }
    const avatars = {};
    let lastId = 0;

    // Create local player (and some for fun)
    const me = createAvatar("me", canvas.width / 2, canvas.height / 2);
    const bri = createAvatar("bri", canvas.width / 2 + 40, canvas.height / 2);
    const gezi = createAvatar("gezi", canvas.width / 2 + 80, canvas.height / 2);
    const roni = createAvatar("roni", canvas.width / 2 + 120, canvas.height / 2);
    $("#me-id").text(me.id);

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

    // add random avatars (simulating joins)
    $("#new-btn").on("click", () => {
        const a = createAvatar("guest" + (++lastId),
            Math.random() * (canvas.width - 40) + 20,
            Math.random() * (canvas.height - 40) + 20,
        );
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
        $(this).attr("title", mute ? "Mute" : "Unmute");
        $(this).children("i").first().toggleClass("hide-slash", mute);
    });

    $("#toggle-names-btn").on("click", function (e) {
        showNames = !showNames;
        $(this).attr("title", showNames ? "Hide names" : "Show names");
        $(this).children("i").first().toggleClass("hide-slash", showNames);
    });

    $("#invite-btn").on("click", function (e) {
        showToast({ text: "Room code copied", bgColor: "#F9C972", hideAfter: 3000 });
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
                showBubble(me, text);
                chatTextfield.val("");
            }
        }
    });

    // create chat bubble for demonstration RANDOMLY BECAUSE WE HAVE NO BACK END YET
    setInterval(() => {
        const arr = Object.values(avatars);
        if (!arr.length) return;
        const pickAvatar = arr[Math.floor(Math.random() * arr.length)];
        if (pickAvatar === me) return; // skip local player
        phrases = [
            "Hello!",
            "Yo Yo!",
            "How's it going?",
            "This place is cool!",
            "What's your favorite game?",
            "I love Yapperz!",
            "How are you guys",
            "mwhahahaha",
            "Nice to meet you all!",
            "Have a great day!",
            "ca bot si kalut?",
            "Imma touch you!",
            "i need a job",
            "whats up?",
            "i love Yapperz!",
            ":3",
            "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧",
            "!!!",
            "AFK getting snacks",
            "brb petting my cat",
            "Pixel party anyone?",
            "Type /dance for moves!",
            "need coffee asap",
            "drop your favorite emoji",
            "this place needs music",
            "new quest soon?",
            "best chatroom ever!",
        ];
        const pickPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        showBubble(pickAvatar, pickPhrase);
    }, 500);

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
    function createAvatar(name, x, y) {
        const id = "id_" + Math.random().toString(36).slice(2, 9);
        var imgIndex = Math.floor(Math.random() * (avatarImgs.length - 3));

        // do hiqen pas midtermi </3
        var isChibi = false;
        if (name == 'bri') {
            imgIndex = 7;
            isChibi = true;
        }
        else if (name == 'gezi') {
            imgIndex = 8;
            isChibi = true;
        }
        else if (name == 'roni') {
            imgIndex = 9;
            isChibi = true;
        }

        const a = {
            id, name, x, y, vx: 0, vy: 0,
            targetX: x, targetY: y, speed: 0,
            bubble: null, bubbleTime: 0, size: 28,
            // assign a random avatar image index (0 or 1)
            imgIndex: imgIndex, isChibi: isChibi
        };
        avatars[id] = a;
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

        // draw avatar image (if loaded) centered at avatar position
        if (typeof a.imgIndex === 'number' && avatarImgs[a.imgIndex] && avatarImgsLoaded[a.imgIndex]) {
            const img = avatarImgs[a.imgIndex];
            var drawW = s * 2;
            var drawH = s * 2.2;
            if (a.isChibi) {
                drawW = s * 1.6;
                drawH = s * 1.8;
            }
            const dx = a.x - drawW / 2;
            const dy = a.y - drawH + s * 0.9;
            ctx.drawImage(img, dx, dy, drawW, drawH);
        }

        // name label
        if (showNames) {
            ctx.font = "14px pixelFontMain";
            ctx.textAlign = "center";
            ctx.fillStyle = "#000";
            ctx.fillText(a.name, a.x, a.y + s * 1.1);
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
            textColor: opts.textColor || "#4E362F",
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