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

function validInput() {
	var regex = /[^a-z0-9]/gi;
	var roomName = document.getElementById('roomName').value;
	if (regex.test(roomName)) {
		alert('Room name cannot have special characters!');
		document.getElementById('roomName').value = null;
		return false;
	}
	// Prevent empty name field. Using attribute "required" requires a form, 
	// which somehow does not update the firebase database.
	if (roomName == "") {
		alert('Room name cannot be empty!');
		return false;
	}
	return true;
}

function createRoom() {
	if (validInput()) {
		const database = firebase.database();
		var currUser = firebase.auth().currentUser;
		database.ref('users/test').push({rooms: 'asdf'}).then(
			user => {window.location.href = "../html/room.html"
		});
	}
}

// Get the createRoomWindow
var createRoomWindow = document.getElementById('createRoomWindow');

// When the user clicks anywhere outside of the createRoomWindow, close it
window.onclick = function(event) {
    if (event.target == createRoomWindow) {
        createRoomWindow.style.display = "none";
    }
}