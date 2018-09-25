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
	// which somehow does not update the firebase database. Also, a form immediately submits
	// if the submit button is clicked without the regex check.
	if (roomName == "") {
		alert('Room name cannot be empty!');
		return false;
	}
	return true;
}

function createRoom() {
	if (validInput()) {
		// To prevent multiple submissions to firebase.
		document.getElementById("createRoomButton").disabled = true;
		
		var roomName = document.getElementById('roomName').value;
		// Get the currently logged in user.
		var currUser = firebase.auth().currentUser.uid;
		
		// Get a key for a new Room.
		var newRoomKey = firebase.database().ref().child('users/' + currUser + "/rooms").push().key;
		var updates = {};
		updates['users/' + currUser + "/" + "rooms/" + newRoomKey] = roomName;
		updates['rooms/' + newRoomKey] = "Empty Room";
		firebase.database().ref().update(updates).then(
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