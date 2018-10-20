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

function validInput(inputString) {
    // Range one to fifty characters, at least one uppercase letter, one lowercase letter or one number.
    var regex = /^(?=.*[a-zA-Z\d])[a-zA-Z\d\s!$%@#£^€*?&()]{1,50}$/;
    if (regex.test(inputString)) {
        return true;
    }
    return false;
}

function createRoom() {
    var roomNameEle = document.getElementById('roomName');
    var roomName = roomNameEle.value;

    if (!validInput(roomName)) {
        alert('Room name must have at least a letter or a number, and have at most 50 characters!');
        roomNameEle.value = '';
        roomNameEle.focus();
        return false;
    }
    // To prevent multiple submissions to firebase.
    document.getElementById("createRoomButton").disabled = true;


    // Get the currently logged in user.
    var currUser = firebase.auth().currentUser.uid;

    // Push a new Room to firebase.
    var newRoom = firebase.database().ref().child('users/' + currUser + '/rooms').push();

    // Prepare data of room to send to room.html
    localStorage.setItem('roomName', roomName);
    localStorage.setItem('roomKey', newRoom.key);

    // Set roomName for roomId in 'users' database.
    newRoom.set({
        name: roomName
    });

    // Set roomName for roomId in 'rooms' database.
    firebase.database().ref().child('rooms/' + newRoom.key).set({
        name: roomName
    }).then(
        user => {
            window.location.href = "../html/room.html"
    });
    return true;
}

function viewAllChallenges() {
    window.location.href = "../html/browse.html"
}

function viewCreatedChallenges() {
    window.location.href = "../html/createdRooms.html"
}

// When the user clicks anywhere outside of the createRoomWindow, close it
window.onclick = function(event) {
    var createRoomWindow = document.getElementById('createRoomWindow');
    if (event.target == createRoomWindow) {
        createRoomWindow.style.display = "none";
    }
}