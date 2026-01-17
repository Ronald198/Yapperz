$(function () {
    const api = window.YapperzAPI;
    const DEFAULT_AVATAR = "boy1.png";

    if (api.getSession()) {
        window.location.href = "../../index.html";
        return;
    }

    const $form = $("#form");
    const $username = $("#username-input-field");
    const $displayname = $("#displayname-input-field");
    const $email = $("#email-input-field");
    const $password = $("#password-input-field");
    const $confpassword = $("#confpassword-input-field");
    const $checkbox = $(".form-checkbox");

    const $usernameErr = $("#usernameErr");
    const $displaynameErr = $("#displaynameErr");
    const $emailErr = $("#emailErr");
    const $passErr = $("#passErr");
    const $confpassErr = $("#confpassErr");
    const $checkboxErr = $("#checkboxErr");
    const $submitBtn = $("#login-signup-button");

    function setLoading(isLoading) {
        $submitBtn.prop("disabled", isLoading);
        $submitBtn.val(isLoading ? "Creating account..." : "Sign Up");
    }

    function validateEmail(value) {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(value);
    }

    $form.on("submit", function (e) {
        e.preventDefault();

        // clear previous errors
        $username.text("");
        $displaynameErr.text("");
        $emailErr.text("");
        $passErr.text("");
        $confpassErr.text("");
        $checkboxErr.text("");

        let hasError = false;
        const usernameVal = $username.val().trim();
        const displayNameVal = $displayname.val().trim();
        const emailVal = $email.val().trim();
        const passVal = $password.val().trim();
        const confVal = $confpassword.val().trim();

        if (usernameVal.length < 2) {
            $usernameErr.text("Please enter your username (min 2 characters).");
            hasError = true;
        }

        if (displayNameVal.length < 2) {
            $displaynameErr.text("Please enter your display name (min 2 characters).");
            hasError = true;
        }

        if (!emailVal) {
            $emailErr.text("Please enter your email.");
            hasError = true;
        } else if (!validateEmail(emailVal)) {
            $emailErr.text("Please enter a valid email address.");
            hasError = true;
        }

        if (passVal.length < 8) {
            $passErr.text("Password must be at least 8 characters.");
            hasError = true;
        }

        if (confVal !== passVal) {
            $confpassErr.text("Passwords do not match.");
            hasError = true;
        }

        if (!$checkbox.is(":checked")) {
            $checkboxErr.text("Please accept the Terms and Conditions.");
            hasError = true;
        }

        if (hasError) {
            return; // stay on page, errors are shown
        }

        setLoading(true);
        const payload = {
            username: usernameVal,
            email: emailVal,
            password: passVal,
            displayName: displayNameVal,
            avatarPath: DEFAULT_AVATAR
        };

        // var a = {
        //     username: "TestFromWeb",
        //     email: "mail@mail.com",
        //     password: "123",
        //     displayName: "TesterWebber",
        //     avatarPath: "boy1.png"
        // };

        const registerRequest = window.YapperzAPI.register(payload);

        registerRequest.done(() => {
            const loginRequest = window.YapperzAPI.login({ usernameOrEmail: emailVal, password: passVal});

            loginRequest.done(() => {
                window.location.href = "../../index.html";
            });

            loginRequest.fail(err => {
                console.log(err);
                $confpassErr.text(JSON.parse(err.message).title || "Registered but could not log in. Please try logging in manually.");
            });

            loginRequest.always(() => {
                setLoading(false);
            });
        });

        registerRequest.fail(err => {
            const msg = err.message || "Unable to create account. Please try again.";
            const msgLower = msg.toLowerCase();
            console.log(msgLower);

            if (msgLower.includes("username")) {
                $usernameErr.text(msg);
            } else if (msgLower.includes("email")) {
                $emailErr.text(msg);
            } else {
                alert(msg);
            }

            setLoading(false);
        });
    });
});
