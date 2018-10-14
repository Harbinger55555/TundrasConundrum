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
    // Not alphanumeric characters.
    var regex = /[^a-z0-9]/gi;
    if (regex.test(inputString)) {
        return false;
    }
    if (inputString == '') {
        return false;
    }
    return true;
}

function createRoom() {
    var roomNameEle = document.getElementById('roomName');
    var roomName = roomNameEle.value;

    if (!validInput(roomName)) {
        alert('Room name cannot be empty nor have special characters!');
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

// Get the createRoomWindow
var createRoomWindow = document.getElementById('createRoomWindow');

// When the user clicks anywhere outside of the createRoomWindow, close it
window.onclick = function(event) {
    if (event.target == createRoomWindow) {
        createRoomWindow.style.display = "none";
    }
}