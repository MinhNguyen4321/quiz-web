// Toastr custom
toastr.options.showMethod = 'slideDown';

// Remove Cookies Login
function removeCookies(...cookieNames) {
    cookieNames.forEach(cookieName => {
        Cookies.remove(cookieName);
    });
}

// Show alert Bootstrap 5
function showAlert(message, type) {
    $('.alert').removeClass('alert-success alert-danger');
    $('.alert').addClass('alert-' + type);
    $('.alert').text(message);
    $('.alert').show();
    setTimeout(function () {
        $('.alert').hide();
    }, 5000);
}
