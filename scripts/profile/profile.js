
$(document).ready(function() {
    $('#edit-btn').click(function() {
        // Enable inputs
        $('.form-input').prop('disabled', false);
        $('.form-input').first().focus(); // Focus on first input
        
        // Toggle buttons
        $(this).hide();
        $('#save-btn').show();
    });

    $('#profile-form').submit(function(e) {
        e.preventDefault();
        
        // For now we just simulate saving
        
        const newName = $('#username').val();
        $('.user-name').text(newName); // Update the header name

        // Disable inputs
        $('.form-input').prop('disabled', true);
        
        // Toggle buttons back
        $('#save-btn').hide();
        $('#edit-btn').show();

        alert("Profile updated successfully!");
    });
});