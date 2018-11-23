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

    allRooms.once('value', function(snapshot){
        snapshot.forEach(function(roomSnapshot) {
            allRoomsArr.push(roomSnapshot);
        })
    }).then(function() {
        // Sort rooms in descending order of finishCount.
        allRoomsArr.sort(sortByFinishCount);
        reloadAllRooms(allRoomsArr);

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

function sortByName(room1, room2) {
    // Ascending by default.
    var name1 = room1.val().name.toUpperCase(); // ignore upper and lowercase
    var name2 = room2.val().name.toUpperCase(); // ignore upper and lowercase

    // Flip the names if order is descending.
    if (sortOrder == "2") {
        var temp = name1;
        name1 = name2;
        name2 = temp;
    }
    if (name1 < name2) {
        return -1;
    }
    if (name1 > name2) {
        return 1;
    }

    // names must be equal
    return 0;
}

function sortByFinishCount(room1, room2) {
    // Ascending by default.
    var room1FinishCount = room1.val().finishCount;
    var room2FinishCount = room2.val().finishCount;
    var val1 = room1FinishCount ? room1FinishCount : 0;
    var val2 = room2FinishCount ? room2FinishCount : 0;
    var res = val1 - val2;

    // Flip the result if order is descending.
    if (sortOrder == "2") res = -res;

    // Break ties with name.
    return res !== 0 ? res : sortByName(room1, room2);
}

// Ascending.
function sortBySize(room1, room2) {
    let puzzleCount1 = room1.val().puzzleCount;
    let puzzleCount2 = room2.val().puzzleCount;

    // To take care of undefined puzzleCounts.
    puzzleCount1 = puzzleCount1 ? puzzleCount1 : 0;
    puzzleCount2 = puzzleCount2 ? puzzleCount2 : 0;

    var res = puzzleCount1 - puzzleCount2;

    // Flip the result if order is descending.
    if (sortOrder == "2") res = -res;

    // Break ties with name.
    return res !== 0 ? res : sortByName(room1, room2);
}

function sortBySelection() {
    // Sort allRoomsArr accordingly first, then clear roomDivList, and then append all roomDivs again.
    var sortSelection = document.getElementById("sortBySelect").value;
    sortOrder = document.getElementById("sortOrder").value;
    switch(sortSelection) {
        case '1':
            // Sort by Finish Count.
            allRoomsArr.sort(sortByFinishCount);
            break;
        case '2':
            // Sort by Name.
            allRoomsArr.sort(sortByName);
            break;
        case '3':
            // Sort by Size.
            allRoomsArr.sort(sortBySize);
            break;
        default:
            // By default, sort by Finish Count.
            allRoomsArr.sort(sortByFinishCount);
            break;
    }

    let roomDivList = document.getElementById('roomDivList');
    clearChildren(roomDivList);

    reloadAllRooms(allRoomsArr);
}

function reloadAllRooms(allRoomsArr) {
    for (var roomSnapshot of allRoomsArr) {
        let roomImgUrl = roomSnapshot.child('themeURL').val();
        let roomDesc = roomSnapshot.child('description').val();
        let roomName = roomSnapshot.child('name').val();
        let roomID = roomSnapshot.key;
        let puzzleCount = roomSnapshot.child('puzzleCount').val();

        // To take care of undefined value.
        puzzleCount = puzzleCount ? puzzleCount : 0;

        appendRoom(roomImgUrl, roomDesc, roomName, roomID, puzzleCount);
    }
}

function clearChildren(container) {
    // Clears all children of the given container.
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

// Used for rendering all rooms from the RTDB according to sort selection.
var allRoomsArr = [];
var sortOrder = document.getElementById('sortOrder').value;
