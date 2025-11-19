$(function () {
    const $form = $("#form");
    const $name = $("#name-input-field");
    const $surname = $("#surname-input-field");
    const $email = $("#email-input-field");
    const $password = $("#password-input-field");
    const $confpassword = $("#confpassword-input-field");
    const $checkbox = $(".form-checkbox");

    const $nameErr = $("#nameErr");
    const $surnameErr = $("#surnameErr");
    const $emailErr = $("#emailErr");
    const $passErr = $("#passErr");
    const $confpassErr = $("#confpassErr");
    const $checkboxErr = $("#checkboxErr");

    function validateEmail(value) {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(value);
    }

    $form.on("submit", function (e) {
        e.preventDefault();

        // clear previous errors
        $nameErr.text("");
        $surnameErr.text("");
        $emailErr.text("");
        $passErr.text("");
        $confpassErr.text("");
        $checkboxErr.text("");

        let hasError = false;
        const nameVal = $name.val().trim();
        const surnameVal = $surname.val().trim();
        const emailVal = $email.val().trim();
        const passVal = $password.val().trim();
        const confVal = $confpassword.val().trim();

        if (nameVal.length < 2) {
            $nameErr.text("Please enter your name (min 2 characters).");
            hasError = true;
        }

        if (surnameVal.length < 2) {
            $surnameErr.text("Please enter your surname (min 2 characters).");
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

        // On successful signup, navigate to login so the user can sign in
        window.location.href = "../../pages/lobby/lobby.html";
    });
});
