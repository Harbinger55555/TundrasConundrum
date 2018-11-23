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

    // Creates a div for the room size.
    let roomSizeDiv = document.createElement('div');
    roomSizeDiv.setAttribute("class", "roomSizeDiv");

    // Identify room size according to its puzzleCount.
    var roomSizeText = roomSize(puzzleCount);
    roomSizeDiv.appendChild(roomSizeText);

    // Wrap description and room size divs into their own div for formatting purposes.
    let roomDescAndRoomSizeDiv = document.createElement('div');
    roomDescAndRoomSizeDiv.appendChild(roomDescDiv);
    roomDescAndRoomSizeDiv.appendChild(roomSizeDiv);
    roomDescAndRoomSizeDiv.setAttribute("class", "roomDescAndRoomSizeDiv");

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

    // Create the div for expand description icon for small screens.
    let expandDescDiv = document.createElement('div');
    expandDescDiv.setAttribute("class", "expandDescDiv");
    expandDescDiv.onclick = function() {
        // expandDescDiv.style.display = "none";
        expandDescDiv.style.display = "none";
        roomDescAndRoomSizeDiv.style.display = "block";
        newRoomDiv.scroll(200, 0);
    }
    let expandDescIcon = document.createElement('img');
    expandDescIcon.setAttribute("class", "expandDescIcon");
    expandDescIcon.setAttribute("src", "./images/expand_desc_icon.jp2");
    expandDescDiv.appendChild(expandDescIcon);

    // Append all three content divs into the newRoomDiv.
    newRoomDiv.appendChild(roomNameAndImgDiv);
    newRoomDiv.appendChild(roomDescAndRoomSizeDiv);
    newRoomDiv.appendChild(expandDescDiv);

    let roomDivList = document.getElementById('roomDivList');
    roomDivList.appendChild(newRoomDiv);
}

function playUnity(room) {
    sessionStorage.setItem("playRoomKey", room);
    window.location.href = "play.html";
}

function loadAllRooms() {
    // Get all rooms from the RTDB.
    let allRooms = firebase.database().ref().child('rooms');
    var allRoomsArr = [];

    allRooms.once('value', function(snapshot){
        snapshot.forEach(function(roomSnapshot) {
            allRoomsArr.push(roomSnapshot);
        })
    }).then(function() {
        // Sort rooms in descending order of finishCount.
        allRoomsArr.sort(function(room1, room2) {
            var room1FinishCount = room1.val().finishCount;
            var room2FinishCount = room2.val().finishCount;
            var val1 = room1FinishCount ? room1FinishCount : 0;
            var val2 = room2FinishCount ? room2FinishCount : 0;
            return val2 - val1;
        });
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

function roomSize(puzzleCount) {
    if (puzzleCount <= 5) {
        return document.createTextNode("Room Size: Small");
    } else if (puzzleCount <= 15) {
        return document.createTextNode("Room Size: Moderate");
    } else if (puzzleCount <= 30) {
        return document.createTextNode("Room Size: Large");
    } else {
        return document.createTextNode("Room Size: Enormous");
    }
}
