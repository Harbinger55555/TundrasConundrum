function logout() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.

    }).catch(function(error) {
        // An error happened.
    });
}

function viewAllChallenges() {
    window.location.href = "../html/browse.html"
}

function viewCreatedChallenges() {
    window.location.href = "../html/createdRooms.html"
}