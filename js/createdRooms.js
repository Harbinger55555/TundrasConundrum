firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
        // No user is signed in.
        window.location.href = "../html/home.html";
    } else {
        // User still signed in.
        if (user) {
            // User id can only be obtained after authenticating the currently logged in user.
            loadCreatedRooms(user.uid);
        }
    }
});

// Appends the room as a roomDiv into roomDivList.
function appendRoom(roomName) {
    let newRoomDiv = document.createElement('div');
    newRoomDiv.setAttribute("class", "createdRoomDiv");
    newRoomDiv.setAttribute("onclick", "createdRoomDivOnClick()");
    let roomDivText = document.createTextNode(roomName);
    newRoomDiv.appendChild(roomDivText);

    let createdRoomDivList = document.getElementById('createdRoomDivList');
    createdRoomDivList.appendChild(newRoomDiv);
}

// TODO: Delete this function along with related stuff in html and css.
function tempAppendRoom() {
    appendRoom("Blank");
}

// TODO: Implement dynamic data load of 10 per overflow scroll.
function loadCreatedRooms(userId) {
    // Get the currently logged in user.
    let allCreatedRooms = firebase.database().ref().child('users/' + userId + '/rooms');

    // TODO: Dynamically keep roomDivList up to date with firebase RTDB changes (Could use .on() then remove and refill roomDivList).
    allCreatedRooms.once('value', function (snapshot) {
        snapshot.forEach(function (roomSnapshot) {
            let roomId = roomSnapshot.key;
            let roomName = firebase.database().ref().child('rooms/' + roomId + '/name');
            roomName.once('value', function (snapshot) {
                appendRoom(snapshot.val());

                // The first roomDiv creation appends two children to the createdRoomDivList.
                let currRoomDivIndex = document.getElementById('createdRoomDivList').childElementCount - 2;

                // A map of createdRoomDivs to their respective room names and keys.
                localStorage.setItem('roomDiv' + currRoomDivIndex, snapshot.val());
                localStorage.setItem('roomKey' + currRoomDivIndex, roomId);
            });
        })
        // Hide the loader.
        document.getElementById('loader').style.display = 'none';
    });
}

function createdRoomDivOnClick() {
    let currDiv = event.target;

    // At the end of the loop, createdRoomDivIndex will contain the index.
    // The first roomDiv has index of 3 thus the -3 to make it zero-based.
    for (var createdRoomDivIndex=0; (currDiv=currDiv.previousSibling); createdRoomDivIndex++);
    createdRoomDivIndex -= 3;

    // TODO: can roomName be obtained with this.innerHTML or this.textContent?
    // Prepare data of room to send to room.html
    let roomName = localStorage['roomDiv' + createdRoomDivIndex];
    let roomKey = localStorage['roomKey' + createdRoomDivIndex];

    // Clear all temporary roomDiv and roomKey data from localStorage before passing room data to room.html.
    // localStorage.clear();

    // Prepare data of room to send to room.html
    localStorage.setItem('roomName', roomName);
    localStorage.setItem('roomKey', roomKey);

    window.location.href = "../html/room.html";
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
    var roomKey = newRoom.key;

    // Prepare data of room to send to room.html
    localStorage.setItem('roomName', roomName);
    localStorage.setItem('roomKey', roomKey);

    // Set roomName for roomId in 'users' database.
    newRoom.set({
        name: roomName
    });

    // Set roomName for roomId in 'rooms' database.
    firebase.database().ref().child('rooms/' + roomKey).set({
        name: roomName
    }).then(
        user => {
            window.location.href = "../html/room.html"
        });

    return true;
}

// When the user clicks anywhere outside of the createRoomWindow, close it
window.onclick = function(event) {
    var createRoomWindow = document.getElementById('createRoomWindow');
    if (event.target == createRoomWindow) {
        createRoomWindow.style.display = "none";
    }
}

