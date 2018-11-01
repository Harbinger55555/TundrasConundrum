function logout() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.

    }).catch(function(error) {
        // An error happened.
    });
}

// window.onscroll = function() {stickyNavbar()};
//
// function stickyNavbar() {
//     var navbar = document.getElementById("navbar");
//     var navWrapper = document.getElementById("navWrapper");
//     var sticky = navWrapper.offsetTop;
//     if (window.pageYOffset >= sticky) {
//         navbar.classList.add("sticky")
//     } else {
//         navbar.classList.remove("sticky");
//     }
// }


function myFunction() {
    navbar_collapsed = !navbar_collapsed;
    var topnav = document.getElementById("topnav");
    if (!navbar_collapsed) {
        topnav.classList.add("responsive");
    } else {
        topnav.classList.remove("responsive");
    }
}

// Default value is true since when the collapse icon appears, the navbar items will be collapsed.
var navbar_collapsed = true;