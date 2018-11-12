firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
        // No user is signed in.
        window.location.href = "index.html";
    } else {
        // User still signed in.
    }
});