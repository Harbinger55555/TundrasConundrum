firebase.auth().onAuthStateChanged(function(user) {
	if (!user) {
		// No user is signed in.
		window.location.href = "../html/home.html";
	} else {
		// User still signed in.
		if (user) {
			document.getElementById("greeting").innerHTML = "Welcome " + user.email;
		}
	}
});

function logout() {
	firebase.auth().signOut().then(function() {
		// Sign-out successful.
		
	}).catch(function(error) {
		// An error happened.
	});
}