firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
        // No user is signed in.
        localStorage.removeItem('playRoomKey');
        window.location.href = "index.html";
    } else {
        // User still signed in.
        if (user) {
            // Only load rooms if a user is logged in.
            loadAllRooms();
        }
    }
});

// Appends the room as a roomDiv into roomDivList.
function appendRoom(roomImgUrl, roomDesc, roomName, roomID, puzzleCount) {
    // Creates a new div for the room (which will consists of a roomImgDiv, roomDescDiv, and roomNameDiv).
    let newRoomDiv = document.createElement('div');
    newRoomDiv.setAttribute("class", "roomDiv");

    // Creates a div for the room description.
    let roomDescDiv = document.createElement('div');
    roomDescDiv.setAttribute("class", "roomDescDiv");
    let roomDescText = document.createTextNode(roomDesc || "No Description... Bask in the mystery!");
    roomDescDiv.appendChild(roomDescText);

    // Wrap description and puzzleCount divs into their own div for formatting purposes.
    let roomDescAndPuzzleCountDiv = document.createElement('div');
    roomDescAndPuzzleCountDiv.appendChild(roomDescDiv);

    // Identify room size according to its puzzleCount.
    var puzzleCountText;
    if (puzzleCount <= 5) {
        puzzleCountText = document.createTextNode("Room Size: Small");
    } else if (puzzleCount <= 15) {
        puzzleCountText = document.createTextNode("Room Size: Moderate");
    } else if (puzzleCount <= 30) {
        puzzleCountText = document.createTextNode("Room Size: Large");
    } else {
        puzzleCountText = document.createTextNode("Room Size: Enormous");
    }
    roomDescAndPuzzleCountDiv.appendChild(puzzleCountText);
    roomDescAndPuzzleCountDiv.setAttribute("class", "roomDescAndPuzzleCountDiv");

    // Creates a div for the room image.
    let roomImgDiv = document.createElement('div');
    roomImgDiv.setAttribute("class", "roomImgDiv");
    let roomImg = document.createElement('img');
    roomImg.setAttribute("class", "roomImg");
    roomImg.setAttribute("src", (roomImgUrl || "./images/huh.jp2"));
    roomImg.onclick = function() {
    playUnity(roomID);
    };
    roomImgDiv.appendChild(roomImg);

    // Creates a div for the room name.
    let roomNameDiv = document.createElement('div');
    roomNameDiv.setAttribute("class", "roomNameDiv");
    let roomNameText = document.createTextNode(roomName);
    roomNameDiv.appendChild(roomNameText);

    // Wrap name and image into their own div for formatting purposes.
    let roomNameAndImgDiv = document.createElement('div');
    roomNameAndImgDiv.appendChild(roomImgDiv);
    roomNameAndImgDiv.appendChild(roomNameDiv);
    roomNameAndImgDiv.setAttribute("class", "roomNameAndImg");

    // Append all three content divs into the newRoomDiv.
    newRoomDiv.appendChild(roomNameAndImgDiv);
    newRoomDiv.appendChild(roomDescAndPuzzleCountDiv);

    let roomDivList = document.getElementById('roomDivList');
    roomDivList.appendChild(newRoomDiv);
}

function playUnity(room) {
    sessionStorage.setItem("playRoomKey", room);
    window.location.href = "play.html";
}

function loadAllRooms() {
    // orderByChild orders in ascending order.
    let allRooms = firebase.database().ref().child('rooms').orderByChild('finishCount');
    var allRoomsArr = [];

    allRooms.once('value', function(snapshot){
        snapshot.forEach(function(roomSnapshot) {
            allRoomsArr.push(roomSnapshot);
        })
    }).then(function() {
        allRoomsArr.reverse();
        for (var roomSnapshot of allRoomsArr) {
            let roomImgUrl = roomSnapshot.child('themeURL').val();
            let roomDesc = roomSnapshot.child('description').val();
            let roomName = roomSnapshot.child('name').val();
            let roomID = roomSnapshot.key;
            let puzzleCount = 0;
            for (var _ in roomSnapshot.child('puzzles').val()) {
                puzzleCount++;
            }

            appendRoom(roomImgUrl, roomDesc, roomName, roomID, puzzleCount);
        }

        // Hide the loader.
        document.getElementById('loader').style.display = 'none';
    });
}
