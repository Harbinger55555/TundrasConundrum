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
    // could simply use newRoomDiv.setAttribute("onclick", "createdRoomDivOnClick()"); but event variable is not
    // auto defined in browsers like firefox.
    newRoomDiv.onclick = function(event) {
        createdRoomDivOnClick(event);
    };

    //put the room text in a p element so that css could be added
    //to insure long text wouldn't push the delete icon out of the view
    // let  roomDivText = document.createElement('p');
    // roomDivText.innerHTML = roomName;
    let roomDivText = document.createTextNode(roomName);
    // roomDivText.setAttribute("class", "roomNameText");
    newRoomDiv.appendChild(roomDivText);

    // TODO: Add alt.
    let roomDivDelIcon = document.createElement('img');
    roomDivDelIcon.setAttribute("class", "delIcon");
    roomDivDelIcon.setAttribute("src", "./images/trash.png");
    roomDivDelIcon.onclick = function(event) {
        openDelConfirmWindow(event);
    }
    newRoomDiv.appendChild(roomDivDelIcon);

    let createdRoomDivList = document.getElementById('createdRoomDivList');
    createdRoomDivList.appendChild(newRoomDiv);
}

// TODO: Delete this function along with related stuff in html and css.
function tempAppendRoom() {
    appendRoom("Blank");
}

// TODO: Implement dynamic data load of 10 per overflow scroll.
function loadCreatedRooms(userId) {
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
                sessionStorage.setItem('roomDiv' + currRoomDivIndex, snapshot.val());
                sessionStorage.setItem('roomKey' + currRoomDivIndex, roomId);
            });
        })
        // Hide the loader.
        document.getElementById('loader').style.display = 'none';
    });
}

// TODO: switch storing roomDiv and roomKey from sessionStorage to global variables in a namespace.
function createdRoomDivOnClick(event) {
    let currDiv = event.target;

    // At the end of the loop, createdRoomDivIndex will contain the index.
    // The first roomDiv has index of 3 thus the -3 to make it zero-based.
    for (var createdRoomDivIndex=0; (currDiv=currDiv.previousSibling); createdRoomDivIndex++);
    createdRoomDivIndex -= 3;

    // TODO: can roomName be obtained with this.innerHTML or this.textContent?
    // Prepare data of room to send to room.html
    let roomName = sessionStorage['roomDiv' + createdRoomDivIndex];
    let roomKey = sessionStorage['roomKey' + createdRoomDivIndex];

    // Clear all temporary roomDiv and roomKey data from sessionStorage before passing room data to room.html.
    // sessionStorage.clear();

    // Prepare data of room to send to room.html
    localStorage.setItem('roomName', roomName);
    localStorage.setItem('roomKey', roomKey);

    window.location.href = "../html/room.html";
}

function openDelConfirmWindow(event) {
    // To prevent click event from bubbling to parent and triggering its onclick as well.
    event.stopPropagation();

    document.getElementById('delConfirmWindow').style.display = 'block';
    let delIconOfCurrDiv  = event.target;
    let currDiv = delIconOfCurrDiv.parentElement;

    // At the end of the loop, createdRoomDivIndex will contain the index.
    // The first roomDiv has index of 3 thus the -3 to make it zero-based.
    for (var createdRoomDivIndex=0; (currDiv=currDiv.previousSibling); createdRoomDivIndex++);
    createdRoomDivIndex -= 3;

    sessionStorage.setItem('delClickRoom', createdRoomDivIndex);
}

// Delete all puzzles under the room, and all instances of the room in rooms and users.
function delYesClicked() {
    // No need to remove delClickRoom from storage since it will be overwritten with new del clicks. Also, user won't
    // be able to access the 'overflowed' indexes anyways so no need for extra processing to just remove the other keys.
    let delClickRoom = sessionStorage['delClickRoom'];
    let roomKey = sessionStorage['roomKey' + delClickRoom];

    var updates = {};

    // Get the currently logged in user.
    var currUser = firebase.auth().currentUser.uid;

    // Delete room data under user database.
    updates['/users/' + currUser + '/rooms/' + roomKey] = null;

    // Delete all puzzles relating to the room from the firebase RTDB.
    let delClickRoomPuzzleData = firebase.database().ref().child('rooms/' + roomKey + '/puzzles');
    delClickRoomPuzzleData.once('value', function(snapshot) {
        snapshot.forEach(function (puzzleSnapshot) {
            let puzzleId = puzzleSnapshot.key;
            updates['/puzzles/' + puzzleId] = null;
        })
    }).then(
        () => {
            // Delete the room under room database.
            updates['/rooms/' + roomKey] = null

            // Update the firebase RTDB and refresh the page to update the changes in the sessionStorage as well.
            firebase.database().ref().update(updates).then(
                () => {document.location.reload(true)
                });
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
    let createRoomWindow = document.getElementById('createRoomWindow');
    let delConfirmWindow = document.getElementById('delConfirmWindow');
    if (event.target == createRoomWindow || event.target == delConfirmWindow) {
        createRoomWindow.style.display = "none";
        delConfirmWindow.style.display = "none";
    }
}
