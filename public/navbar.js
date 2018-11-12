function logout() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        window.location.href = "index.html";
    }).catch(function(error) {
        // An error happened.
    });
}

window.onscroll = function() {stickyNavbar()};

function stickyNavbar() {
    var topnav = document.getElementById("topnav");
    var navWrapper = document.getElementById("navWrapper");
    var sticky = navWrapper.offsetTop;
    if (window.pageYOffset >= sticky) {
        topnav.classList.add("sticky");
    } else {
        topnav.classList.remove("sticky");
    }
}

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