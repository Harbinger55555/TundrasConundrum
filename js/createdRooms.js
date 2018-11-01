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

    let roomDivText = document.createTextNode(roomName);
    newRoomDiv.appendChild(roomDivText);

    // Create a div to hold the icons.
    let roomIconsDiv = document.createElement('div');
    roomIconsDiv.setAttribute("class", "roomIconsDiv");
    newRoomDiv.appendChild(roomIconsDiv);

    // TODO: Add alt.
    // An icon to enter edit mode for a room.
    let roomDivEditIcon = document.createElement('img');
    roomDivEditIcon.setAttribute("class", "roomDivIcons");
    roomDivEditIcon.setAttribute("src", "./images/edit_default.png");
    roomDivEditIcon.onclick = function(event) {
        // toggleEditMode(event);
    }
    roomIconsDiv.appendChild(roomDivEditIcon);

    // TODO: Add alt.
    let roomDivDelIcon = document.createElement('img');
    roomDivDelIcon.setAttribute("class", "roomDivIcons");
    roomDivDelIcon.setAttribute("src", "./images/trash.png");
    roomDivDelIcon.onclick = function(event) {
        openDelConfirmWindow(event);
    }
    roomIconsDiv.appendChild(roomDivDelIcon);

    let createdRoomDivList = document.getElementById('createdRoomDivList');
    createdRoomDivList.appendChild(newRoomDiv);
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

// Opens edit window if edit mode is on, else enters the room to view its puzzles.
// TODO: switch storing roomDiv and roomKey from sessionStorage to global variables in a namespace.
function createdRoomDivOnClick(event) {
    let currDiv = event.target;

    // At the end of the loop, createdRoomDivIndex will contain the index.
    // The first roomDiv has index of 3 thus the -3 to make it zero-based.
    for (var createdRoomDivIndex=0; (currDiv=currDiv.previousSibling); createdRoomDivIndex++);
    createdRoomDivIndex -= 3;

    if (editModeToggled) {
        openEditWindow(createdRoomDivIndex);
    } else {
        // Prepare data of room to send to room.html
        let roomName = sessionStorage['roomDiv' + createdRoomDivIndex];
        let roomKey = sessionStorage['roomKey' + createdRoomDivIndex];

        // Prepare data of room to send to room.html
        localStorage.setItem('roomName', roomName);
        localStorage.setItem('roomKey', roomKey);

        window.location.href = "../html/room.html";
    }
}

function openDelConfirmWindow(event) {
    // To prevent click event from bubbling to parent and triggering its onclick as well.
    event.stopPropagation();

    if (editModeToggled) {
        window.alert("Edit Mode is toggled on.");
        return false;
    }

    document.getElementById('delConfirmWindow').style.display = 'block';
    let delIconOfCurrDiv  = event.target;
    let roomIconsDiv = delIconOfCurrDiv.parentElement;
    let currDiv = roomIconsDiv.parentElement;

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
    delClickRoomPuzzleData.once('value', function (snapshot) {
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
                () => {
                    // Create a reference to the room theme.
                    var themeRef = firebase.storage().ref().child(roomKey + '/theme');

                    // Delete the room theme from storage.
                    themeRef.delete().then(
                        () => {
                            document.location.reload(true)
                        }).catch(function(error){
                            // If the theme does not exist, simply reload the page.
                            if (error.code == "storage/object-not-found") {
                                document.location.reload(true);
                            } else {
                                // If it is any other error, throw it again.
                                throw(error);
                            }
                    });
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

function createRoom(event) {
    // To prevent click event from bubbling to parent and triggering its onclick as well.
    event.stopPropagation();

    var roomNameEle = document.getElementById('roomName');
    var roomName = roomNameEle.value;

    if (!validInput(roomName)) {
        alert('Room name must have at least a letter or a number, and have at most 50 characters!');
        roomNameEle.value = '';
        roomNameEle.focus();
        return false;
    }

    if (uploadedTheme && !validSize(uploadedTheme)) {
        return false;
    }

    var roomDesc = document.getElementById('roomDesc').value;

    // To prevent multiple submissions to firebase.
    document.getElementById("roomWindowButton").disabled = true;

    // Get the currently logged in user.
    var currUser = firebase.auth().currentUser.uid;

    // Push a new Room to firebase.
    var newRoom = firebase.database().ref().child('users/' + currUser + '/rooms').push();
    var roomKey = newRoom.key;

    updateStorageAndRTDB(roomKey, roomName, roomDesc);
}

// Main firebase update function.
function updateStorageAndRTDB(roomKey, roomName, roomDesc) {
    if (uploadedTheme) {
        // Tries to upload selected room theme to firebase storage.
        var storageRef = firebase.storage().ref().child(roomKey + '/theme');
        var uploadTask = storageRef.put(uploadedTheme);

        // Register three observers:
        // 1. 'state_changed' observer, called any time the state changes
        // 2. Error observer, called on failure
        // 3. Completion observer, called on successful completion
        uploadTask.on('state_changed', function (snapshot) {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
        }, function (error) {
            // Handle unsuccessful uploads
            document.getElementById('roomWindow').style.display = 'none';
            resetInputs();
            window.alert("Room Theme upload failed! Please open edit mode and upload again.");
        }, function () {
            // Handle successful uploads on complete
            uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                uploadRoomToRTDB(roomKey, roomName, roomDesc, downloadURL);
            });
        });
    } else {
        // Just update firebase RTDB without a theme upload to Storage.
        uploadRoomToRTDB(roomKey, roomName, roomDesc);
    }
}

// Upload room info to firebase RTDB.
function uploadRoomToRTDB(roomKey, roomName, roomDesc, themeURL) {
    // Get the currently logged in user.
    var currUser = firebase.auth().currentUser.uid;

    // Prepare data of room to send to room.html
    localStorage.setItem('roomName', roomName);
    localStorage.setItem('roomKey', roomKey);

    var updates = {};

    // Set roomName for roomId in 'users' database.
    updates['/users/' + currUser + '/rooms/' + roomKey] = roomName;

    // Set roomName for roomId in 'rooms' database.
    updates['/rooms/' + roomKey + '/name'] = roomName;

    // Set roomDesc for roomId in 'rooms' database if user had written a description.
    if (roomDesc == "") {
        updates['/rooms/' + roomKey + '/description'] = null;
    } else {
        updates['/rooms/' + roomKey + '/description'] = roomDesc;
    }

    // Set themeURL for roomId in 'rooms' database if user had uploaded a new theme.
    if (themeURL) updates['/rooms/' + roomKey + '/themeURL'] = themeURL;

    firebase.database().ref().update(updates).then(
        user => {
            // If edit mode is on, simply refresh the page to update the changes in the sessionStorage as well.
            if (editModeToggled) {
                document.location.reload(true);
            } else {
                window.location.href = "../html/room.html";
            }
        });
}

function resetInputs() {
    document.getElementById("roomWindowButton").disabled = false;
    document.getElementById('roomThemeInput').value = '';
    document.getElementById('roomTheme').src = "./images/huh.png";
    document.getElementById('roomName').value = '';
    document.getElementById('roomDesc').value = '';
    uploadedTheme = null;
}

function openCreateWindow() {
    resetInputs();
    let roomWindowButton = document.getElementById('roomWindowButton');
    roomWindowButton.innerHTML = 'Create Room';
    roomWindowButton.onclick = function(event) {
        createRoom(event);
    }
    document.getElementById('roomWindow').style.display = 'block';
}

function openEditWindow(createdRoomDivIndex) {
    let roomWindowButton = document.getElementById('roomWindowButton');
    roomWindowButton.innerHTML = 'Save Changes';
    roomWindowButton.onclick = function(event) {
        saveRoomChanges(event);
    }

    // Fill in the room window fields with existing data for the room.
    let roomKey = sessionStorage['roomKey' + createdRoomDivIndex];
    sessionStorage.setItem('editClickedRoom', createdRoomDivIndex);
    let roomData = firebase.database().ref().child('rooms/' + roomKey);
    roomData.once('value', function(snapshot){
        let dataValues = snapshot.val();
        document.getElementById('roomTheme').src = snapshot.hasChild('themeURL') ? dataValues.themeURL : "./images/huh.png";
        document.getElementById('roomName').value = dataValues.name;
        document.getElementById('roomDesc').value = snapshot.hasChild('description') ? dataValues.description : '';
    }).then(
        () => {
            // Reset all other inputs and the uploadedTheme variable.
            roomWindowButton.disabled = false;
            document.getElementById('roomThemeInput').value = '';
            uploadedTheme = null;
            document.getElementById('roomWindow').style.display = 'block';
        });
}

function saveRoomChanges(event) {
    // To prevent click event from bubbling to parent and triggering its onclick as well.
    event.stopPropagation();

    var roomNameEle = document.getElementById('roomName');
    var roomName = roomNameEle.value;

    if (!validInput(roomName)) {
        alert('Room name must have at least a letter or a number, and have at most 50 characters!');
        roomNameEle.value = '';
        roomNameEle.focus();
        return false;
    }

    if (uploadedTheme && !validSize(uploadedTheme)) {
        return false;
    }

    // To prevent multiple submissions to firebase.
    document.getElementById("roomWindowButton").disabled = true;

    let editClickedRoom = sessionStorage['editClickedRoom'];
    let roomKey = sessionStorage['roomKey' + editClickedRoom];
    let roomDesc = document.getElementById('roomDesc').value;

    // No additional work needed to check for when a user clicks on cancel on upload window, since the img will still be
    // shown and the firebase storage will not be touched as long as the uploadedTheme var is null.
    // Update the firebase RTDB/Storage and refresh the page to update the changes in the sessionStorage as well.
    updateStorageAndRTDB(roomKey, roomName, roomDesc);
}

function toggleEditMode() {
    editModeToggled = !editModeToggled;
    let editModeButton = document.getElementById('editButton');

    // Change the button to toggled mode and update editToggledRoom.
    if (editModeToggled) {
        editModeButton.setAttribute("class", "toggledOn");
        editModeButton.innerHTML = "Edit Mode: ON";
    } else {
        editModeButton.setAttribute("class", "toggledOff");
        editModeButton.innerHTML = "Edit Mode: OFF";
    }
}

// Default edit mode set to false
var editModeToggled = false;

// Remove editToggledRoom from sessionStorage on page load (to take care of page refreshes).
sessionStorage.removeItem('editToggledRoom');

// When the user clicks anywhere outside of the pop up windows, close it.
window.onclick = function(event) {
    let roomWindow = document.getElementById('roomWindow');
    let delConfirmWindow = document.getElementById('delConfirmWindow');
    if (event.target == roomWindow || event.target == delConfirmWindow) {
        roomWindow.style.display = "none";
        delConfirmWindow.style.display = "none";
    }
}

// To check the size of the theme uploads.
function validSize(file) {
    var fileSize = file.size / 1024 / 1024; // in MB
    if (fileSize > 5) {
        alert('File size exceeds 5 MB');
        return false;
    } else {
        return true;
    }
}

// Set the uploadTheme to null by default.
var uploadedTheme = null;

// When a user uploads a room theme while creating a room.
document.getElementById('roomThemeInput').onchange = function(event) {
    uploadedTheme = this.files[0];
    let roomTheme = document.getElementById('roomTheme');

    // If user uploads a theme.
    if (uploadedTheme) {
        roomTheme.src = window.URL.createObjectURL(uploadedTheme);
    } else {
        // If user clicks on cancel on the upload window.
        roomTheme.src = "./images/huh.png";
    }
}

window.onscroll = function() {stickyNavbar()};

function stickyNavbar() {
    var navbar = document.getElementById("navbar");
    var navWrapper = document.getElementById("navWrapper");
    var sticky = navWrapper.offsetTop;
    if (window.pageYOffset >= sticky) {
        navbar.classList.add("sticky")
    } else {
        navbar.classList.remove("sticky");
    }
}