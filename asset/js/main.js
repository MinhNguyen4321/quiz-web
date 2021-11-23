// Wrapper
$(window).on("load", function () {
    $('body').addClass('loaded');
});

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

// Send email method
function sendEmail(receiver, subject, content) {
    Email.send({
        SecureToken: "6a5ad7d3-98a6-401b-8d9e-9a4eb34adebe",
        To: receiver,
        From: "onlinetrainingfpoly@fpt.edu.vn",
        Subject: subject,
        Body: content
    }).then(
        message => alert(message)
    ).catch(
        err => alert(err)
    );
}

// Generate random password
function generatePassword(length) {
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    var result = '';
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Fisher-Yates algorith to shuffle an array
const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
        // [array[i], array[j]] = [array[j], array[i]];
    }
}

// Get number items in random array
const getRandomArray = (array, number) => {
    let result = [];
    let temp = array;
    shuffleArray(temp);
    for (let i = 0; i < number; i++) {
        result.push(temp[i]);
    }
    return result;
}