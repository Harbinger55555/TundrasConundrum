firebase.auth().onAuthStateChanged(function(user) {
	if (!user) {
		// No user is signed in.
		window.location.href = "index.html";
	} else {
		// User still signed in.
		if (user) {
		    greetUser(user.uid);
            loadPopularRooms();
		}
	}
});

function greetUser(userId) {
    let userName = firebase.database().ref().child('users/' + userId + '/name');
    userName.once('value', function (snapshot) {
        document.getElementById("greeting").innerHTML = "Welcome " + (snapshot.val() || "Anonymous User");
    })
}

function loadPopularRooms() {
    // Get all rooms from the RTDB.
    var mostPopularRooms = firebase.database().ref('rooms');
    var mostPopularRoomsArr = [];

    // ROOM_NUM is used to reference the respective roomImg DOM elements.
    var ROOM_NUM = 0;
    mostPopularRooms.once('value', function(snapshot) {
        snapshot.forEach(function(room) {
            mostPopularRoomsArr.push(room);
        });
    }).then(
        () => {
            // Sort rooms in descending order of finishCount.
            mostPopularRoomsArr.sort(function(room1, room2) {
                var room1FinishCount = room1.val().finishCount;
                var room2FinishCount = room2.val().finishCount;
                var val1 = room1FinishCount ? room1FinishCount : 0;
                var val2 = room2FinishCount ? room2FinishCount : 0;
                return val2 - val1;
            });
            for (var i = 0; i < 3; ++i) {
                let room = mostPopularRoomsArr[i];
                ROOM_NUM += 1;
                let roomVal = room.val();
                let roomID = room.key;
                let roomName = roomVal.name;
                let roomFinishCount = roomVal.finishCount;
                let roomImgUrl = roomVal.themeURL;
                let roomImgElement = document.getElementById('room' + ROOM_NUM);
                roomImgElement.setAttribute("src", (roomImgUrl || "./images/huh.jp2"));
                roomImgElement.onclick = function() {
                    playUnity(roomID);
                };
                roomImgElement.style.cursor = "pointer";
                document.getElementById('roomName' + ROOM_NUM).innerHTML = roomName;
                document.getElementById('roomCount' + ROOM_NUM).innerHTML = "Finished Count: " + roomFinishCount;
            }
        }
    );
}

function playUnity(room) {
    sessionStorage.setItem("playRoomKey", room);
    window.location.href = "play.html";
}