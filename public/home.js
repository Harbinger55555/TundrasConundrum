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
    // Get the 3 most popular rooms from the RTDB.
    // limitToLast(3) because orderByChild orders in ascending order.
    var mostPopularRooms = firebase.database().ref('rooms').orderByChild('finishCount').limitToLast(3);
    var mostPopularRoomsArr = [];

    // ROOM_NUM is used to reference the respective roomImg DOM elements.
    var ROOM_NUM = 0;
    mostPopularRooms.once('value', function(snapshot) {
        snapshot.forEach(function(room) {
            mostPopularRoomsArr.push(room);
        });
    }).then(
        () => {
            // reverse() because roomImg DOM elements need to be filled in descending order.
            mostPopularRoomsArr.reverse();
            for (var room of mostPopularRoomsArr) {
                ROOM_NUM += 1;
                let roomVal = room.val();
                let roomID = room.key;
                let roomName = roomVal.name;
                let roomFinishCount = roomVal.finishCount;
                let roomImgUrl = roomVal.themeURL;
                // TODO: create a roomName div and fill in the roomName.
                let roomImgElement = document.getElementById('room' + ROOM_NUM);
                roomImgElement.setAttribute("src", (roomImgUrl || "./images/huh.png"));
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