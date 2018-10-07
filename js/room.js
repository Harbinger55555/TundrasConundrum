firebase.auth().onAuthStateChanged(function(user) {
	if (!user) {
		// No user is signed in.
		window.location.href = "../html/home.html";
	} else {
		// User still signed in.
		if (user) {
			// Get the room data from menu room creation or room selection.
			var roomName = localStorage['roomName'];
			localStorage.removeItem('roomName'); // Clear roomName from localStorage
			document.getElementById("roomName").innerHTML = "Room " + roomName;
		}
	}
});

function requiredFieldsFilled() {
	// Prevent empty name field. Using attribute "required" requires a form, 
	// which somehow does not update the firebase database. Also, a form immediately submits
	// if the submit button is clicked without the regex check.
	if (document.getElementById('question').value == "" ||
		document.getElementById('correctAnswer').value == "" ||
		document.getElementById('wrongAnswer1').value == "") {
		alert('Non-optional fields cannot be empty!');
		return false;
	}
	return true;
}

function createPuzzle() {
	if (requiredFieldsFilled()) {
		// To prevent multiple submissions to firebase.
		document.getElementById("createPuzzleButton").disabled = true;
		
		// Get the currently logged in user.
		var currUser = firebase.auth().currentUser.uid;
		var roomKey = localStorage['roomKey'];
		localStorage.removeItem('roomKey'); // Clear roomKey from localStorage
		// Checks if room belongs to the current User.
		var currRoomInUser = firebase.database().ref().child('users/' + currUser + '/rooms/' + roomKey);
		currRoomInUser.once('value', function(snapshot) {
			if (snapshot.exists()){
				currRoomInUser.child('puzzles').push().set({
					question: document.getElementById('question').value,
					correctAnswer: document.getElementById('correctAnswer').value,
					wrongAnswer1: document.getElementById('wrongAnswer1').value
				});
			}
			else {
				alert("Room does not belong to current User.");
			}
		});
	}
}

// Get the createPuzzleWindow
var createPuzzleWindow = document.getElementById('createPuzzleWindow');

// When the user clicks anywhere outside of the createRoomWindow, close it
window.onclick = function(event) {
    if (event.target == createPuzzleWindow) {
        createPuzzleWindow.style.display = "none";
    }
}