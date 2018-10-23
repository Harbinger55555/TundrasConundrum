firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
        // No user is signed in.
        window.location.href = "../html/home.html";
    } else {
        // User still signed in.
        if (user) {
            // Only load rooms if a user is logged in.
            loadAllRooms();
        }
    }
});

// Appends the room as a roomDiv into roomDivList.
function appendRoom(roomImgUrl, roomDesc, roomName) {
    // Creates a new div for the room (which will consists of a roomImgDiv, roomDescDiv, and roomNameDiv).
    let newRoomDiv = document.createElement('div');
    newRoomDiv.setAttribute("class", "roomDiv");

    // Creates a div for the room image.
    let roomImgDiv = document.createElement('div');
    roomImgDiv.setAttribute("class", "roomImgDiv");
    let roomImg = document.createElement('img');
    roomImg.setAttribute("class", "roomImg");
    roomImg.setAttribute("src", (roomImgUrl || "./images/huh.png"));
    roomImgDiv.appendChild(roomImg);

    // Creates a div for the room description.
    let roomDescDiv = document.createElement('div');
    roomDescDiv.setAttribute("class", "roomDescDiv");
    let roomDescText = document.createTextNode(roomDesc || "No Description... Bask in the mystery!");
    roomDescDiv.appendChild(roomDescText);

    // Creates a div for the room name.
    let roomNameDiv = document.createElement('div');
    roomNameDiv.setAttribute("class", "roomNameDiv");
    let roomNameText = document.createTextNode(roomName);
    roomNameDiv.appendChild(roomNameText);

    // Append all three content divs into the newRoomDiv.
    newRoomDiv.appendChild(roomImgDiv);
    newRoomDiv.appendChild(roomDescDiv);
    newRoomDiv.appendChild(roomNameDiv);

    let roomDivList = document.getElementById('roomDivList');
    roomDivList.appendChild(newRoomDiv);
}

// TODO: Delete this function along with related stuff in html and css.
function tempAppendRoom() {
    appendRoom("./images/huh.png", "This is a room. What more does ye need to know?", "Blank Name");
}

function playUnity() {
    window.location.href = "../html/play.html";
}

// TODO: Implement dynamic data load of 10 per overflow scroll.
function loadAllRooms() {
    let allRooms = firebase.database().ref().child('rooms');

    // TODO: Dynamically keep roomDivList up to date with firebase RTDB changes (Could use .on() then remove and refill roomDivList).
    allRooms.once('value', function(snapshot){
        snapshot.forEach(function(roomSnapshot) {
            let roomImgUrl = roomSnapshot.child('imgUrl').val();
            let roomDesc = roomSnapshot.child('description').val();
            let roomName = roomSnapshot.child('name').val();
            appendRoom(roomImgUrl, roomDesc, roomName);
        })
        // Hide the loader.
        document.getElementById('loader').style.display = 'none';
    });
}