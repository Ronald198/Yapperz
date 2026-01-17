$(function () {
    const api = window.YapperzAPI;

    if (api.ensureAuthenticated()) {
        window.location.href = "../../index.html";
        return;
    }

    const $form = $("#form");
    const $emailInput = $("#email-input-field");
    const $passwordInput = $("#password-input-field");
    const $emailError = $("#email-error");
    const $passwordError = $("#password-error");
    const $submitBtn = $("#login-signup-button");

    // function validateEmail(value) {
    //     const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //     return pattern.test(value);
    // }
    
    function setLoading(isLoading) {
        $submitBtn.prop("disabled", isLoading);
        $submitBtn.val(isLoading ? "Logging in..." : "Log in");
    }

    $form.on("submit", function (e) {
        e.preventDefault();
        let hasError = false;
        $emailError.text("");
        $passwordError.text("");

        const usernamerOrEmailVal = $emailInput.val().trim();
        const passwordVal = $passwordInput.val().trim();

        // usernamerOrEmailVal = "a@a.a";
        // passwordVal = "123";

        if (!usernamerOrEmailVal) {
            $emailError.text("Please enter your username or email.");
            hasError = true;
        }
        // else if (!validateEmail(usernamerOrEmailVal)) {
        //     $emailError.text("Please enter a valid email address.");
        //     hasError = true;
        // }

        if (!passwordVal) {
            $passwordError.text("Please enter your password.");
            hasError = true;
        }

        if (hasError) {
            return; // stay on the page with errors shown
        }

        setLoading(true);

        const request = api.login({
            usernameOrEmail: usernamerOrEmailVal,
            password: passwordVal
        });
        
        // success navigate to lobby
        request.done(() => {
            window.location.href = "../../index.html";
        });

        request.fail(err => {
            setLoading(false);
            $passwordError.text(JSON.parse(err.message).title || "Unable to log in. Please try again.");
        });

        request.always(() => {
            setLoading(false);
        });
    });
});

