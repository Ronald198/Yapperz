$(function () {
    const $form = $("#form");
    const $emailInput = $("#email-input-field");
    const $passwordInput = $("#password-input-field");
    const $emailError = $("#email-error");
    const $passwordError = $("#password-error");

    function validateEmail(value) {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(value);
    }

    $form.on("submit", function (e) {
        e.preventDefault();
        let hasError = false;
        $emailError.text("");
        $passwordError.text("");

        const emailVal = $emailInput.val().trim();
        const passwordVal = $passwordInput.val().trim();

        if (!emailVal) {
            $emailError.text("Please enter your email.");
            hasError = true;
        } else if (!validateEmail(emailVal)) {
            $emailError.text("Please enter a valid email address.");
            hasError = true;
        }

        if (!passwordVal) {
            $passwordError.text("Please enter your password.");
            hasError = true;
        }

        if (hasError) {
            return; // stay on the page with errors shown
        }

        // success navigate to lobby
        window.location.href = "../../pages/lobby/lobby.html";
    });
});

