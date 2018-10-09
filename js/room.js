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
			document.getElementById("roomName").innerHTML = roomName;
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

		// Checks if room belongs to the current User.
		var currRoomInUser = firebase.database().ref().child('users/' + currUser + '/rooms/' + roomKey);
		currRoomInUser.once('value', function(snapshot) {
			if (snapshot.exists()){
				let newPuzzleKey = currRoomInUser.child('puzzles').push().key;
				currRoomInUser.child('puzzles/' + newPuzzleKey).set({
					question: document.getElementById('question').value
				});
				let puzzleAnswers = currRoomInUser.child('puzzles/' + newPuzzleKey + '/answers');
				puzzleAnswers.set({
					correct: document.getElementById('correctAnswer').value,
					wrong1: document.getElementById('wrongAnswer1').value
				});
				// If optional fields are filled, update firebase RTDB.
				let wrong2 = document.getElementById('wrongAnswer2').value;
				if (wrong2 != "") puzzleAnswers.update({wrong2: wrong2});
				let wrong3 = document.getElementById('wrongAnswer3').value
				if (wrong3 != "") puzzleAnswers.update({wrong3: wrong3});
				var puzzleHints = currRoomInUser.child('puzzles/' + newPuzzleKey + '/hints');
				let hint1 = document.getElementById('hint1').value
				if (hint1 != "") puzzleHints.update({hint1: hint1});
				let hint2 = document.getElementById('hint2').value
				if (hint2 != "") puzzleHints.update({hint2: hint2});
				let hint3 = document.getElementById('hint3').value
				if (hint3 != "") puzzleHints.update({hint3: hint3});

				document.getElementById('createPuzzleWindow').style.display = "none";
			}
			else {
				alert("Room does not belong to current User.");
			}
		});
	}
}

function openPuzzleWindow() {
	document.getElementById('createPuzzleWindow').style.display = 'block';
	
	resetInputs('puzzleContainer');
	
	// Button was disabled by previous puzzle creation, thus reenabling.
	document.getElementById("createPuzzleButton").disabled = false;
}

function resetInputs(fieldid) {
    var container = document.getElementById(fieldid);
    var inputs = container.getElementsByTagName('input');
    for (var index = 0; index < inputs.length; ++index) {
        inputs[index].value = '';
    }
}

// Get the unique key of the current room
var roomKey = localStorage['roomKey'];
// TODO: should relocate removing the key to a later action, since currently when a room is refreshed, the key is lost.
localStorage.removeItem('roomKey'); // Clear roomKey from localStorage

// Get the createPuzzleWindow
var createPuzzleWindow = document.getElementById('createPuzzleWindow');

// When the user clicks anywhere outside of the createRoomWindow, close it
window.onclick = function(event) {
    if (event.target == createPuzzleWindow) {
        createPuzzleWindow.style.display = "none";
    }
}