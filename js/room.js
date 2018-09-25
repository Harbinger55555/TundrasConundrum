firebase.auth().onAuthStateChanged(function(user) {
	if (!user) {
		// No user is signed in.
		window.location.href = "../html/home.html";
	} else {
		// User still signed in.
		if (user) {
			// const database = firebase.database();
			// database.ref('users/test').push({rooms: 'asdf'})
			// document.getElementById("roomName").innerHTML = "Room " + user.email;
		}
	}
});