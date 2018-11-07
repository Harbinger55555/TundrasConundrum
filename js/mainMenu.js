firebase.auth().onAuthStateChanged(function(user) {
	if (!user) {
		// No user is signed in.
		window.location.href = "../html/home.html";
	} else {
		// User still signed in.
		if (user) {
		    greetUser(user.uid);
		}
	}
});

function greetUser(userId) {
    let userName = firebase.database().ref().child('users/' + userId + '/name');
    userName.once('value', function (snapshot) {
        document.getElementById("greeting").innerHTML = "Welcome" + "<br />" + (snapshot.val() || "Anonymous User");
    })
}