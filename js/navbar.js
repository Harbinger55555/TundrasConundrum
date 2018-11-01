function logout() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.

    }).catch(function(error) {
        // An error happened.
    });
}

window.onscroll = function() {stickyNavbar()};

function stickyNavbar() {
    var navbar = document.getElementById("navbar");
    var navWrapper = document.getElementById("navWrapper");
    var sticky = navWrapper.offsetTop;
    if (window.pageYOffset >= sticky) {
        navbar.classList.add("sticky")
    } else {
        navbar.classList.remove("sticky");
    }
}