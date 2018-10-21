firebase.auth().onAuthStateChanged(function(user) {
	if (!user) {
		// No user is signed in.
		window.location.href = "../html/home.html";

		// Clean up localStorage if user is no longer signed in.
        // TODO: May have to deal with this for other users who are not owners.
        localStorage.removeItem('roomName'); // Clear roomName from localStorage
        localStorage.removeItem('roomKey'); // Clear roomKey from localStorage

	} else {
		// User still signed in.
		if (user) {
			// Get the room data from menu room creation or room selection.
			var roomName = localStorage['roomName'];
			document.getElementById("roomName").innerHTML = roomName;
			loadPuzzles();
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

		// If the unique roomKey exists as a child under the current user, the user is the owner.
		currRoomInUser.once('value', function(snapshot) {
			if (snapshot.exists()){
				let newPuzzleKey = currRoomInUser.child('puzzles').push().key;
				let puzzleQuestion = document.getElementById('question').value;

                // Set question for puzzleId in 'rooms' database.
                firebase.database().ref().child('rooms/' + roomKey + '/puzzles/' + newPuzzleKey).set({
					question: puzzleQuestion
				});

				// Set question for puzzleId in 'puzzles' database.
                firebase.database().ref().child('puzzles/' + newPuzzleKey).set({
                    question: document.getElementById('question').value
                });

				let puzzleAnswers = firebase.database().ref().child('puzzles/' + newPuzzleKey + '/answers');
				puzzleAnswers.set({
					correct: document.getElementById('correctAnswer').value,
					wrong1: document.getElementById('wrongAnswer1').value
				});
				// If optional fields are filled, update firebase RTDB.
				let wrong2 = document.getElementById('wrongAnswer2').value;
				if (wrong2 != "") puzzleAnswers.update({wrong2: wrong2});
				let wrong3 = document.getElementById('wrongAnswer3').value
				if (wrong3 != "") puzzleAnswers.update({wrong3: wrong3});
				var puzzleHints = firebase.database().ref().child('puzzles/' + newPuzzleKey + '/hints');
				let hint1 = document.getElementById('hint1').value
				if (hint1 != "") puzzleHints.update({hint1: hint1});
				let hint2 = document.getElementById('hint2').value
				if (hint2 != "") puzzleHints.update({hint2: hint2});
				let hint3 = document.getElementById('hint3').value
				if (hint3 != "") puzzleHints.update({hint3: hint3});

				document.getElementById('createPuzzleWindow').style.display = "none";

				// Append the new Puzzle as a puzzleDiv into puzzleDivList.
                appendPuzzle(puzzleQuestion);
			}
			else {
				alert("Room does not belong to current User.");
			}
		});
	}
}

function openPuzzleWindow() {
    resetInputs('puzzleContainer');
	document.getElementById('createPuzzleWindow').style.display = 'block';
	
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

// Appends the puzzle as a puzzleDiv into puzzleDivList.
function appendPuzzle(puzzleQuestion) {
    let newPuzzleDiv = document.createElement('div');
    newPuzzleDiv.setAttribute("class", "puzzleDiv");
    let puzzleDivText = document.createTextNode(puzzleQuestion);
    newPuzzleDiv.appendChild(puzzleDivText);

    let puzzleDivList = document.getElementById('puzzleDivList');
    puzzleDivList.appendChild(newPuzzleDiv);
}

// TODO: Delete this function along with related stuff in html and css.
function tempAppendPuzzle() {
    appendPuzzle("Blank");
}

// Get the unique key of the current room
var roomKey = localStorage['roomKey'];

// When the user clicks anywhere outside of the createRoomWindow, close it
window.onclick = function(event) {
    var createPuzzleWindow = document.getElementById('createPuzzleWindow');
    if (event.target == createPuzzleWindow) {
        createPuzzleWindow.style.display = "none";
    }
}

// TODO: Implement dynamic data load of 10 per overflow scroll.
function loadPuzzles() {
    let currRoomPuzzles = firebase.database().ref().child('rooms/' + roomKey + '/puzzles');

    // TODO: Dynamically keep puzzleDivList up to date with firebase RTDB changes (Could use .on() then remove and refill puzzleDivList).
    currRoomPuzzles.once('value', function(snapshot){
        snapshot.forEach(function(puzzleSnapshot) {
            let puzzleQuestion = puzzleSnapshot.child('question').val();
            appendPuzzle(puzzleQuestion);
        })
        // Hide the loader.
        document.getElementById('loader').style.display = 'none';
    });
}