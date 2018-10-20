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
            });
        })
        // Hide the loader.
        document.getElementById('loader').style.display = 'none';
    });
    console.log();
}

