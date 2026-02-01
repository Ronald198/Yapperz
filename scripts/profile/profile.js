$(document).ready(function() {
    // 1. Check if user is logged in
    let session = YapperzAPI.getSession();
    if (!session) {
        window.location.href = "../login/login.html";
        return;
    }

    // --- HELPER: Fixes Avatar Path ---
    function getAvatarPath(path) {
        if (!path) return "../../assets/images/avatars/default.png";
        if (path.startsWith("http") || path.startsWith("..")) return path;
        return `../../assets/images/avatars/${path}`;
    }

    // --- FUNCTION: Render the Page ---
    function renderProfile(userData) {
        // Identity Card
        $(".user-name").text(userData.displayName || userData.username);
        $(".user-email").text(userData.email);
        
        if (userData.avatarPath) {
            $(".avatar-img").attr("src", getAvatarPath(userData.avatarPath));
        }

        // Form Fields
        if ($("#username").length) $("#username").val(userData.username);
        $("#display-name").val(userData.displayName);
        $("#bio").val(userData.bio || "");
    }

    // 2. FETCH FRESH DATA (The Fix)
    // We ask the backend for the latest version of the user to make sure
    // we have the new avatar if it was just changed.
    YapperzAPI.getUserById(session.id)
        .then(freshUser => {
            console.log("Loaded fresh data:", freshUser);
            
            // Update the local session with the fresh data
            session = { ...session, ...freshUser };
            YapperzAPI.setSession(session);

            // Render the page with this fresh data
            renderProfile(session);
        })
        .catch(err => {
            console.error("Could not sync profile:", err);
            // If fetch fails, fall back to what we have in cache
            renderProfile(session);
        });

    // 3. EDIT BUTTON
    $("#edit-btn").on("click", function() {
        $("#display-name").prop("disabled", false);
        $("#bio").prop("disabled", false);
        $(this).hide();
        $("#save-btn").show();
    });

    // 4. SAVE BUTTON
    $("#save-btn").on("click", function(e) {
        e.preventDefault();

        const updatedData = {
            id: session.id,
            username: session.username,
            email: session.email,
            displayName: $("#display-name").val(),
            bio: $("#bio").val(),
            // CRITICAL: We use the session.avatarPath which we just refreshed above
            avatarPath: session.avatarPath 
        };

        YapperzAPI.updateProfile(session.id, updatedData)
            .then(updatedUser => {
                alert("Profile saved successfully!");

                // Update Session again
                session = { ...session, ...updatedUser };
                YapperzAPI.setSession(session);

                // Update UI elements immediately
                renderProfile(session);

                // Lock inputs
                $("#display-name").prop("disabled", true);
                $("#bio").prop("disabled", true);
                $("#save-btn").hide();
                $("#edit-btn").show();
            })
            .catch(error => {
                console.error(error);
                alert("Failed to save: " + (error.message || "Unknown error"));
            });
    });

    // 5. LOGOUT
    $(".btn-danger").on("click", function() {
        YapperzAPI.clearSession();
        window.location.href = "../login/login.html";
    });
});