(function (window, $) {
    if (!$) {
        console.error("YapperzAPI requires jQuery to be loaded beforehand");
        return;
    }

    const DEFAULT_CONFIG = {
        apiBaseUrl: "https://localhost:7246/api",
        loginPage: "/pages/login/login.html"
    };

    const config = Object.assign({}, DEFAULT_CONFIG, window.APP_CONFIG || {});
    window.APP_CONFIG = config;

    const STORAGE_KEYS = {
        session: "yapperz_session",
        activeRoom: "active_room"
    };

    function formatError(xhr) {
        try {
            return JSON.parse(xhr.responseText);
        } catch (e) {
            return { message: xhr.statusText || "Unknown error" };
        }
    }

    // function getAuthHeaders() {
    //     const session = getSession();
    //     if (session && session.token) {
    //         return { "Authorization": `Bearer ${session.token}` };
    //     }
    //     return {};
    // }

    function buildUrl(endpoint, query) {
        const base = config.apiBaseUrl.replace(/\/$/, "");
        let path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
        if (query && typeof query === "object") {
            const params = Object.entries(query)
                .filter(([_, v]) => v !== undefined && v !== null && v !== "")
                .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
                .join("&");
            if (params) {
                path += (path.includes("?") ? "&" : "?") + params;
            }
        }
        return base + path;
    }

    function ensureAuthenticated({ redirectToLogin = true } = {}) {
        const session = getSession();
        if (!session) {
            const currentPath = window.location.pathname.toLowerCase();
            // Prevent redirect loop if already on login page
            if (redirectToLogin && !currentPath.includes("/login.html")) {
                // Dynamic path resolution:
                // If in a sub-page (contains '/pages/'), go up one level (../login/login.html)
                // If at root (index.html), go down (pages/login/login.html)
                const loginPath = currentPath.includes("/pages/")
                    ? "../login/login.html"
                    : "pages/login/login.html";

                window.location.href = loginPath;
            }
            return false;
        }
        return true;
    }

    function getSession() {
        const json = localStorage.getItem(STORAGE_KEYS.session);
        if (!json) return null;
        try {
            return JSON.parse(json);
        } catch (e) {
            console.error("Failed to parse session", e);
            return null;
        }
    }

    function setSession(session) {
        localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    }

    // For Log-Out
    function clearSession() {
        localStorage.removeItem(STORAGE_KEYS.session);
    }

    function request(endpoint, options = {}) {
        const {
            method = "GET",
            data = null,
            headers = {},
            // requiresAuth = true,
            query
        } = options;

        const finalHeaders = Object.assign(
            { "Content-Type": "application/json" },
            // requiresAuth ? getAuthHeaders() : {},
            headers
        );

        const deferred = $.Deferred();

        $.ajax({
            url: buildUrl(endpoint, query),
            method,
            data: data ? JSON.stringify(data) : undefined,
            headers: finalHeaders
        }).done(response => {
            deferred.resolve(response);
        }).fail(xhr => {
            deferred.reject(formatError(xhr));
        });

        return deferred.promise();
    }

    function login(credentials) {
        return request("/Users/login", { method: "POST", data: credentials, requiresAuth: false })
            .then(response => {
                setSession(response);
                return response;
            });
    }

    function register(payload) {
        return request("/Users/signup", { method: "POST", data: payload, requiresAuth: false });
    }

    function getUserById(userId) {
        return request(`/Users/${encodeURIComponent(userId)}`);
    }

    function joinRoom(roomCode) {
        userId = getSession().id;

        return request(`/Chatroom/join`, {
            method: "POST",
            data: { roomCode, userId }
        }).then(response => {
            const summarySource = response && typeof response === "object" ? response : {};
            const roomSummary = {
                code: roomCode,
            };

            
            setActiveRoom(roomSummary);

            // Redirect the user to the chatroom page after joining.
            try {
                const currentPath = window.location.pathname.toLowerCase();
                const chatroomPath = currentPath.includes("/pages/")
                    ? "../chatroom/chatroom.html"
                    : "pages/chatroom/chatroom.html";
                window.location.href = chatroomPath;
            } catch (e) {
                console.warn("Failed to redirect to chatroom", e);
            }

            return summarySource;
        });
    }

    function leaveRoom(roomCode) {
        userId = getSession().id;

        return request(`/Chatroom/leave`, {
            method: "POST",
            data: { roomCode, userId }
        }).then(response => {
            const summarySource = response && typeof response === "object" ? response : {};
            setActiveRoom(null);
            return summarySource;
        });
    }

    function setActiveRoom(room) {
        if (!room) {
            localStorage.removeItem(STORAGE_KEYS.activeRoom);
            return;
        }
        localStorage.setItem(STORAGE_KEYS.activeRoom, JSON.stringify(room));
    }

    function getActiveRoom() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.activeRoom);
            return raw ? JSON.parse(raw) : null;
        } catch (err) {
            console.warn("Failed to parse active room cache", err);
            return null;
        }
    }

    function getRoomByCode(roomCode) {
        if (!roomCode) {
            return $.Deferred().reject({ message: "Missing room code" }).promise();
        }
        return request(`/Chatroom/${encodeURIComponent(roomCode)}`);
    }

    function getRoomUsersByRoomCode(roomCode) {
        if (!roomCode) {
            return $.Deferred().reject({ message: "Missing room code" }).promise();
        }
        
        return request(`/Chatroom/${encodeURIComponent(roomCode)}/Users`);
    }

    window.YapperzAPI = {
        // config,
        request,
        login,
        register,
        getUserById,
        getRoomUsersByRoomCode,
        getRoomByCode,
        // createRoom,
        joinRoom,
        leaveRoom,
        // getMessages,
        // sendMessage,
        ensureAuthenticated,
        getSession,
        setSession,
        clearSession,
        getActiveRoom,
        setActiveRoom
    };
})(window, window.jQuery);