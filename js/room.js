firebase.auth().onAuthStateChanged(function(user) {
	if (!user) {
		// No user is signed in.
		window.location.href = "../html/home.html";

		// Clean up sessionStorage if user is no longer signed in.
        localStorage.removeItem('roomName'); // Clear roomName from sessionStorage
        localStorage.removeItem('roomKey'); // Clear roomKey from sessionStorage

	} else {
		// User still signed in.
		if (user) {
			// Get the room data from menu room creation or room selection.
			var roomName = localStorage['roomName'];
			document.getElementById("roomName").innerHTML = roomName;
			loadPuzzles();
		}
	}
});

function requiredFieldsFilled() {
	// Prevent empty name field. Using attribute "required" requires a form, 
	// which somehow does not update the firebase database. Also, a form immediately submits
	// if the submit button is clicked without the regex check.
	if (document.getElementById('question').value == "" ||
		document.getElementById('correctAnswer').value == "" ||
		document.getElementById('wrongAnswer1').value == "") {
		alert('Non-optional fields cannot be empty!');
		return false;
	}
	return true;
}

function createPuzzle(event) {
    // To prevent click event from bubbling to parent and triggering its onclick as well.
    event.stopPropagation();

    if (requiredFieldsFilled()) {
        // To prevent multiple submissions to firebase.
        document.getElementById("puzzleWindowButton").disabled = true;

        // Get the currently logged in user.
        var currUser = firebase.auth().currentUser.uid;

        // Checks if room belongs to the current User.
        var currRoomInUser = firebase.database().ref().child('users/' + currUser + '/rooms/' + roomKey);

        // If the unique roomKey exists as a child under the current user, the user is the owner.
        currRoomInUser.once('value', function(snapshot) {
            if (snapshot.exists()){
                let newPuzzleKey = currRoomInUser.child('puzzles').push().key;

                // Only continue with the operations when the RTDB is updated since a person could refresh the page
                // whilst the RTDB is being updated and could cause data inconsistencies.
                updateDatabase(newPuzzleKey).then(
                    () => {
                        document.getElementById('puzzleWindow').style.display = "none";

                        // Append the new Puzzle as a puzzleDiv into puzzleDivList.
                        appendPuzzle(document.getElementById('question').value);

                        // The first puzzleDiv creation appends two children to the puzzleDivList.
                        let currPuzzleDivIndex = document.getElementById('puzzleDivList').childElementCount - 2;

                        // A map of puzzleDivs to their respective puzzle keys.
                        sessionStorage.setItem('puzzleKey' + currPuzzleDivIndex, newPuzzleKey);

                        console.log("I am inside the then log for create puzzle!");
                    }
                );
            }
            else {
                alert("Room does not belong to current User.");
            }
        });
    }
}

function updateDatabase(newPuzzleKey) {
    return new Promise(function(resolve, reject) {
        let puzzleQuestion = document.getElementById('question').value;
        // updates['/puzzles/' + puzzleId]
        let updates = {};

        // Update question for puzzleId in 'rooms' database.
        updates['rooms/' + roomKey + '/puzzles/' + newPuzzleKey + '/question'] = puzzleQuestion;

        // Update question for puzzleId in 'puzzles' database.
        updates['puzzles/' + newPuzzleKey + '/question'] = puzzleQuestion;

        // Update answers for puzzleId in 'puzzles' database.
        updates['puzzles/' + newPuzzleKey + '/answers/correct'] = document.getElementById('correctAnswer').value;
        updates['puzzles/' + newPuzzleKey + '/answers/wrong1'] = document.getElementById('wrongAnswer1').value;

        // Check if the optional fields are filled and make necessary updates to the 'puzzles' database.
        // Remove the reference from the RTDB if an edit with a blank is made for the fields.
        let wrong2 = document.getElementById('wrongAnswer2').value;
        if (wrong2 == "") {
            updates['puzzles/' + newPuzzleKey + '/answers/wrong2'] = null;
        } else {
            updates['puzzles/' + newPuzzleKey + '/answers/wrong2'] = wrong2;
        }
        let wrong3 = document.getElementById('wrongAnswer3').value;
        if (wrong3 == "") {
            updates['puzzles/' + newPuzzleKey + '/answers/wrong3'] = null;
        } else {
            updates['puzzles/' + newPuzzleKey + '/answers/wrong3'] = wrong3;
        }
        let hint1 = document.getElementById('hint1').value;
        if (hint1 == "") {
            updates['puzzles/' + newPuzzleKey + '/hints/hint1'] = null;
        } else {
            updates['puzzles/' + newPuzzleKey + '/hints/hint1'] = hint1;
        }
        let hint2 = document.getElementById('hint2').value
        if (hint2 == "") {
            updates['puzzles/' + newPuzzleKey + '/hints/hint2'] = null;
        } else {
            updates['puzzles/' + newPuzzleKey + '/hints/hint2'] = hint2;
        }
        let hint3 = document.getElementById('hint3').value
        if (hint3 == "") {
            updates['puzzles/' + newPuzzleKey + '/hints/hint3'] = null;
        } else {
            updates['puzzles/' + newPuzzleKey + '/hints/hint3'] = hint3;
        }

        // Update the firebase RTDB and return the promise.
        firebase.database().ref().update(updates).then(
            () => {resolve('Update successful!')}
        );
    });
}

// Opens the puzzle window with create functionality.
function openPuzzleWindowCreateVer() {
    if (userInDiffRoom()) {
        return false;
    }

    uncollapseAllFields();
    resetInputs('puzzleContainer');
    let puzzleWindowButton = document.getElementById('puzzleWindowButton');
    puzzleWindowButton.innerHTML = 'Create Puzzle';
    // could simply use puzzleWindowButton.setAttribute("onclick", "createPuzzle()"); but event variable is not auto
    // defined in browsers like firefox.
    puzzleWindowButton.onclick = function(event) {
        createPuzzle(event);
    }
    document.getElementById('transitionFields').style.display = 'none';
	document.getElementById('puzzleWindow').style.display = 'block';
	
	// Button was disabled by previous puzzle creation, thus reenabling.
	document.getElementById("puzzleWindowButton").disabled = false;
}

function resetInputs(fieldId) {
    var container = document.getElementById(fieldId);
    var inputs = container.getElementsByTagName('input');
    for (var index = 0; index < inputs.length; ++index) {
        inputs[index].value = '';
    }
    document.getElementById("question").value = '';
}

// Opens the puzzle window with edit functionality.
function openPuzzleWindowEditVer(puzzleDivIndex) {
    if (userInDiffRoom()) {
        return false;
    }

    uncollapseAllFields();
    let puzzleWindowButton = document.getElementById('puzzleWindowButton');
    puzzleWindowButton.innerHTML = 'Save Changes';
    puzzleWindowButton.onclick = function(event) {
        savePuzzleChanges(event);
    }
    // Fill in the puzzle window fields with existing data for the puzzle.
    let puzzleKey = sessionStorage['puzzleKey' + puzzleDivIndex];
    sessionStorage.setItem('editClickedPuzzle', puzzleDivIndex);
    let puzzleData = firebase.database().ref().child('puzzles/' + puzzleKey);
    puzzleData.once('value', function(snapshot){
        let dataValues = snapshot.val();
        document.getElementById('question').value = dataValues.question;
        document.getElementById('correctAnswer').value = dataValues.answers.correct;
        document.getElementById('wrongAnswer1').value = dataValues.answers.wrong1;
        document.getElementById('wrongAnswer2').value = snapshot.hasChild('answers/wrong2') ? dataValues.answers.wrong2 : "";
        document.getElementById('wrongAnswer3').value = snapshot.hasChild('answers/wrong3') ? dataValues.answers.wrong3 : "";
        document.getElementById('hint1').value = snapshot.hasChild('hints/hint1') ? dataValues.hints.hint1 : "";
        document.getElementById('hint2').value = snapshot.hasChild('hints/hint2') ? dataValues.hints.hint2 : "";
        document.getElementById('hint3').value = snapshot.hasChild('hints/hint3') ? dataValues.hints.hint3 : "";

        // Fill in the respective transition fields.
        if (snapshot.hasChild('transitions/left')) {
            let leftPuzzleKey = dataValues.transitions.left;
            let leftPuzzleData = firebase.database().ref().child('puzzles/' + leftPuzzleKey);
            leftPuzzleData.once('value', function(snapshot) {
                document.getElementById('leftTransition').value = snapshot.val().question;
            })
        } else {
            document.getElementById('leftTransition').value = "";
        }
        if (snapshot.hasChild('transitions/right')) {
            let rightPuzzleKey = dataValues.transitions.right;
            let rightPuzzleData = firebase.database().ref().child('puzzles/' + rightPuzzleKey);
            rightPuzzleData.once('value', function(snapshot) {
                document.getElementById('rightTransition').value = snapshot.val().question;
            })
        } else {
            document.getElementById('rightTransition').value = "";
        }
    }).then(
        () => {
            // Button was disabled by previous puzzle creation, thus reenabling.
            puzzleWindowButton.disabled = false;
            document.getElementById('transitionFields').style.display = 'block';
            document.getElementById('puzzleWindow').style.display = 'block';
        });
}

function savePuzzleChanges() {
    if (userInDiffRoom()) {
        return false;
    }

    if (requiredFieldsFilled()) {
        // To prevent multiple submissions to firebase.
        document.getElementById("puzzleWindowButton").disabled = true;

        // Update the firebase RTDB and refresh the page to update the changes in the sessionStorage as well.
        let editClickedPuzzle = sessionStorage['editClickedPuzzle'];
        let puzzleKey = sessionStorage['puzzleKey' + editClickedPuzzle];
        updateDatabase(puzzleKey).then(
            () => {
                document.location.reload(true)
            }
        );
    }
}

// Appends the puzzle as a puzzleDiv into puzzleDivList.
function appendPuzzle(puzzleQuestion) {
    let newPuzzleDiv = document.createElement('div');
    newPuzzleDiv.setAttribute("class", "puzzleDiv");
    newPuzzleDiv.onclick = function(event) {
        puzzleDivOnCLick(event);
    }
    let puzzleDivText = document.createTextNode(puzzleQuestion);
    newPuzzleDiv.appendChild(puzzleDivText);

    // Create a div to hold the icons.
    let puzzleIconsDiv = document.createElement('div');
    puzzleIconsDiv.setAttribute("class", "puzzleIconsDiv");
    newPuzzleDiv.appendChild(puzzleIconsDiv);

    // TODO: Add alt.
    // Left transition is also used as the "wrong answer" transition.
    let puzzleDivLeftIcon = document.createElement('img');
    puzzleDivLeftIcon.setAttribute("class", "puzzleDivIcons");
    puzzleDivLeftIcon.setAttribute("src", "./images/arrow_left_default.png");
    puzzleDivLeftIcon.onclick = function(event) {
        toggleLeftTransitionMode(event);
    }
    puzzleIconsDiv.appendChild(puzzleDivLeftIcon);

    // TODO: Add alt.
    // Right transition is also used as the "right answer" transition.
    let puzzleDivRightIcon = document.createElement('img');
    puzzleDivRightIcon.setAttribute("class", "puzzleDivIcons");
    puzzleDivRightIcon.setAttribute("src", "./images/arrow_right_default.png");
    puzzleDivRightIcon.onclick = function(event) {
        toggleRightTransitionMode(event);
    }
    puzzleIconsDiv.appendChild(puzzleDivRightIcon);

    // TODO: Add alt.
    // An icon to clear all transition states of a puzzle.
    let puzzleDivClearTransIcon = document.createElement('img');
    puzzleDivClearTransIcon.setAttribute("class", "puzzleDivIcons");
    puzzleDivClearTransIcon.setAttribute("src", "./images/clear_trans.png");
    puzzleDivClearTransIcon.onclick = function(event) {
        openClearConfirmWindow(event);
    }
    puzzleIconsDiv.appendChild(puzzleDivClearTransIcon);

    // TODO: Add alt.
    let puzzleDivDelIcon = document.createElement('img');
    puzzleDivDelIcon.setAttribute("class", "puzzleDivIcons");
    puzzleDivDelIcon.setAttribute("src", "./images/trash.png");
    puzzleDivDelIcon.onclick = function(event) {
        openDelConfirmWindow(event);
    }
    puzzleIconsDiv.appendChild(puzzleDivDelIcon);

    let puzzleDivList = document.getElementById('puzzleDivList');
    puzzleDivList.appendChild(newPuzzleDiv);
}

function openDelConfirmWindow(event) {
    // To prevent click event from bubbling to parent and triggering its onclick as well.
    event.stopPropagation();

    if (userInDiffRoom()) {
        return false;
    }

    if (leftTransitionModeToggled || rightTransitionModeToggled) {
        window.alert("Transition Mode is toggled on.");
        return false;
    }

    document.getElementById('delConfirmWindow').style.display = 'block';
    let delIconOfCurrDiv  = event.target;
    let puzzleIconsDiv = delIconOfCurrDiv.parentElement;
    let currDiv = puzzleIconsDiv.parentElement;

    // At the end of the loop, puzzleDivIndex will contain the index.
    // The first puzzleDiv has index of 3 thus the -3 to make it zero-based.
    for (var puzzleDivIndex=0; (currDiv=currDiv.previousSibling); puzzleDivIndex++);
    puzzleDivIndex -= 3;

    // TODO: Change the delClickPuzzle from sessionStorage to global variable.
    sessionStorage.setItem('delClickPuzzle', puzzleDivIndex);
}

// Delete the puzzle from the room, and from puzzles.
function delYesClicked() {
    // No need to remove delClickPuzzle from storage since it will be overwritten with new del clicks. Also, user won't
    // be able to access the 'overflowed' indexes anyways so no need for extra processing to just remove the other keys.
    let delClickPuzzle = sessionStorage['delClickPuzzle'];
    let puzzleKey = sessionStorage['puzzleKey' + delClickPuzzle];

    var updates = {};

    // Delete the puzzle from the room.
    updates['/rooms/' + roomKey + '/puzzles/' + puzzleKey] = null;

    // Delete the puzzle from puzzles.
    updates['/puzzles/' + puzzleKey] = null;

    // Update the firebase RTDB and refresh the page to update the changes in the sessionStorage as well.
    firebase.database().ref().update(updates).then(
        () => {document.location.reload(true)}
    );
}

// Opens confirmation window for clearing the transition states of the puzzle.
function openClearConfirmWindow(event) {
    // To prevent click event from bubbling to parent and triggering its onclick as well.
    event.stopPropagation();

    if (userInDiffRoom()) {
        return false;
    }

    if (leftTransitionModeToggled || rightTransitionModeToggled) {
        window.alert("Transition Mode is toggled on.");
        return false;
    }

    document.getElementById('clearTransConfirmWindow').style.display = 'block';
    let clearTransIconOfCurrDiv  = event.target;
    let puzzleIconsDiv = clearTransIconOfCurrDiv.parentElement;
    let currDiv = puzzleIconsDiv.parentElement;

    // At the end of the loop, puzzleDivIndex will contain the index.
    // The first puzzleDiv has index of 3 thus the -3 to make it zero-based.
    for (var puzzleDivIndex=0; (currDiv=currDiv.previousSibling); puzzleDivIndex++);
    puzzleDivIndex -= 3;

    // TODO: Change the delClickPuzzle from sessionStorage to global variable.
    sessionStorage.setItem('clearTransClickPuzzle', puzzleDivIndex);
}

// Delete both left and right transition states from the puzzle.
function clearTransYesClicked() {
    let clearTransClickPuzzle = sessionStorage['clearTransClickPuzzle'];
    let puzzleKey = sessionStorage['puzzleKey' + clearTransClickPuzzle];

    // Delete the transition states from the puzzle in the firebase RTDB and refresh the page to update the changes
    // in the sessionStorage as well.
    firebase.database().ref().child('puzzles/' + puzzleKey + '/transitions').set({
        left: null,
        right: null
    }).then(
        () => {document.location.reload(true)}
    );
}

// TODO: (Can make it by checking if leftTransitionModeToggled and comparing current div id with the one in storage.)
// Left transition is taken when a user answers the puzzle incorrectly. So, if a user just explicitly wants a regular
// left transition, they can fill out the wrong answer field with 'left'.
function toggleLeftTransitionMode(event) {
    // To prevent click event from bubbling to parent and triggering its onclick as well.
    event.stopPropagation();

    // Check for following conditions:
    // 1). User is not in a different room.
    // 2). Other puzzleDiv objects are not toggled on.
    // 3). The counterpart button is not toggled on.
    if (userInDiffRoom()) return false;

    // Get the clicked leftIcon object and its parent puzzleDiv.
    let leftIconOfCurrDiv  = event.target;
    let puzzleIconsDiv = leftIconOfCurrDiv.parentElement;
    let currDiv = puzzleIconsDiv.parentElement;

    // At the end of the loop, puzzleDivIndex will contain the index.
    // The first puzzleDiv has index of 3 thus the -3 to make it zero-based.
    for (var puzzleDivIndex=0; (currDiv=currDiv.previousSibling); puzzleDivIndex++);
    puzzleDivIndex -= 3;

    // If transitionToggledPuzzle exists in the Storage, check if it's the same one as being clicked on currently.
    let toggledPuzzleInStorage = sessionStorage.getItem('transitionToggledPuzzle');
    if (toggledPuzzleInStorage && puzzleDivIndex != toggledPuzzleInStorage) {
        window.alert("Currently editing another puzzle's transition... Please turn it off first.");
        return false;
    }

    // Ask user to toggle off right transition mode if on.
    if (rightTransitionModeToggled) {
        window.alert("Please turn off the [right] transition mode first.");
        return false;
    }

    leftTransitionModeToggled = !leftTransitionModeToggled;

    // Change the icon to toggled img and update transitionToggledPuzzle.
    if (leftTransitionModeToggled) {
        leftIconOfCurrDiv.setAttribute("src", "./images/arrow_left_toggled.png");

        // As long as a transition mode is active, the icons div will be visible.
        puzzleIconsDiv.style.visibility = 'visible';
        // TODO: Change the transitionToggledPuzzle from sessionStorage to global variable.
        sessionStorage.setItem('transitionToggledPuzzle', puzzleDivIndex);
    } else {
        leftIconOfCurrDiv.setAttribute("src", "./images/arrow_left_default.png");

        // Turn icons div visibility off since transition mode is no longer active.
        puzzleIconsDiv.style.visibility = 'hidden';
        sessionStorage.removeItem('transitionToggledPuzzle');
    }
}

// Right transition is taken when a user answers the puzzle correctly. So, if a user just explicitly wants a regular
// right transition, they can fill out the correct answer field with 'right'.
function toggleRightTransitionMode(event) {
    // To prevent click event from bubbling to parent and triggering its onclick as well.
    event.stopPropagation();

    // Check for following conditions:
    // 1). User is not in a different room.
    // 2). Other puzzleDiv objects are not toggled on.
    // 3). The counterpart button is not toggled on.
    if (userInDiffRoom()) return false;

    // Get the clicked rightIcon object and its parent puzzleDiv.
    let rightIconOfCurrDiv  = event.target;
    let puzzleIconsDiv = rightIconOfCurrDiv.parentElement;
    let currDiv = puzzleIconsDiv.parentElement;

    // At the end of the loop, puzzleDivIndex will contain the index.
    // The first puzzleDiv has index of 3 thus the -3 to make it zero-based.
    for (var puzzleDivIndex=0; (currDiv=currDiv.previousSibling); puzzleDivIndex++);
    puzzleDivIndex -= 3;

    // If transitionToggledPuzzle exists in the Storage, check if it's the same one as being clicked on currently.
    let toggledPuzzleInStorage = sessionStorage.getItem('transitionToggledPuzzle');
    if (toggledPuzzleInStorage && puzzleDivIndex != toggledPuzzleInStorage) {
        window.alert("Currently editing another puzzle's transition... Please turn it off first.");
        return false;
    }

    // Ask user to toggle off left transition mode if on.
    if (leftTransitionModeToggled) {
        window.alert("Please turn off the [left] transition mode first.");
        return false;
    }

    rightTransitionModeToggled = !rightTransitionModeToggled;

    // Change the icon to toggled img and update transitionToggledPuzzle.
    if (rightTransitionModeToggled) {
        rightIconOfCurrDiv.setAttribute("src", "./images/arrow_right_toggled.png");

        // As long as a transition mode is active, the icons div will be visible.
        puzzleIconsDiv.style.visibility = 'visible';
        // TODO: Change the transitionToggledPuzzle from sessionStorage to global variable.
        sessionStorage.setItem('transitionToggledPuzzle', puzzleDivIndex);
    } else {
        rightIconOfCurrDiv.setAttribute("src", "./images/arrow_right_default.png");

        // Turn icons div visibility off since transition mode is no longer active.
        puzzleIconsDiv.style.visibility = 'hidden';
        sessionStorage.removeItem('transitionToggledPuzzle');
    }
}

// Opens confirmation box for respective transition if transition mode is on, else opens puzzle edit window.
function puzzleDivOnCLick(event) {
    // Get the clicked puzzleDiv object.
    let clickedPuzzleDiv = event.target;

    // At the end of the loop, puzzleDivIndex will contain the index.
    // The first puzzleDiv has index of 3 thus the -3 to make it zero-based.
    for (var puzzleDivIndex=0; (clickedPuzzleDiv=clickedPuzzleDiv.previousSibling); puzzleDivIndex++);
    puzzleDivIndex -= 3;

    if (leftTransitionModeToggled || rightTransitionModeToggled) {
        let transitionToggledPuzzle = sessionStorage.getItem('transitionToggledPuzzle');

        // Check if clicked puzzle is the same as the one whose transition mode is active.
        if (puzzleDivIndex == transitionToggledPuzzle) {
            window.alert('A puzzle cannot be a transition to itself');
            return false;
        } else {
            // Open up transConfirmWindow with text informing the user's transition choice.
            document.getElementById('transConfirmText').innerHTML = 'Are you sure you want to make this the ' +
                (rightTransitionModeToggled ? "[right]" : "[left]") + ' transition?';
            document.getElementById('transConfirmWindow').style.display = 'block';
            sessionStorage.setItem('transitionClickedPuzzle', puzzleDivIndex);
        }
    } else {
        // Open the create puzzle window but with fields filled with preexisting data as well as a 'Save Changes'
        // button instead of a 'Create Puzzle' one.
        openPuzzleWindowEditVer(puzzleDivIndex);
    }
}

function transYesClicked() {
    // Update the RTDB accordingly.
    // TODO: Create a tooltip that has the current transition state and is shown when arrows are hovered over.
    let transitionToggledPuzzleIndex = sessionStorage.getItem('transitionToggledPuzzle');
    let transitionToggledPuzzle = sessionStorage.getItem('puzzleKey' + transitionToggledPuzzleIndex);
    let transitionClickedPuzzleIndex = sessionStorage.getItem('transitionClickedPuzzle');
    let transitionClickedPuzzle = sessionStorage.getItem('puzzleKey' + transitionClickedPuzzleIndex);
    if (rightTransitionModeToggled) {
        firebase.database().ref().child('puzzles/' + transitionToggledPuzzle + '/transitions').update({
            right: transitionClickedPuzzle
        }).then(
            // Reload the page to update the puzzles with changes.
            () => {document.location.reload(true)}
        );
    } else {
        firebase.database().ref().child('puzzles/' + transitionToggledPuzzle + '/transitions').update({
            left: transitionClickedPuzzle
        }).then(
            // Reload the page to update the puzzles with changes.
            () => {document.location.reload(true)}
        );
    }
}

function userInDiffRoom() {
    // Case when the user is in another room in another tab. This is to prevent inconsistency of data between tabs.
    // sessionStorage supposedly takes care of that but in the case when a user directly opens the page, the room data
    // does not persist for the new session.
    if (roomKey != localStorage['roomKey']) {
        alert('Currently in room (' + localStorage['roomName'] + ')! Please refresh the page.');
        return true;
    }
    return false;
}

// Get the unique key of the current room
var roomKey = localStorage['roomKey'];

// Default transition modes set to false
var leftTransitionModeToggled = false;
var rightTransitionModeToggled = false;

// Remove transitionToggledPuzzle from sessionStorage on page load (to take care of page refreshes).
sessionStorage.removeItem('transitionToggledPuzzle');

// When the user clicks anywhere outside of any popup windows, close it
window.onclick = function(event) {
    let puzzleWindow = document.getElementById('puzzleWindow');
    let delConfirmWindow = document.getElementById('delConfirmWindow');
    let transConfirmWindow = document.getElementById('transConfirmWindow');
    let clearTransConfirmWindow = document.getElementById('clearTransConfirmWindow');
    if (event.target == puzzleWindow || event.target == delConfirmWindow ||
        event.target == transConfirmWindow || event.target == clearTransConfirmWindow) {
        puzzleWindow.style.display = "none";
        delConfirmWindow.style.display = "none";
        transConfirmWindow.style.display = "none";
        clearTransConfirmWindow.style.display = "none";
    }
}

// TODO: Implement dynamic data load of 10 per overflow scroll.
function loadPuzzles() {
    let currRoomPuzzles = firebase.database().ref().child('rooms/' + roomKey + '/puzzles');

    // TODO: Dynamically keep puzzleDivList up to date with firebase RTDB changes (Could use .on() then remove and refill puzzleDivList).
    currRoomPuzzles.once('value', function(snapshot){
        snapshot.forEach(function(puzzleSnapshot) {
            let puzzleId = puzzleSnapshot.key;
            let puzzleQuestion = puzzleSnapshot.child('question').val();
            appendPuzzle(puzzleQuestion);

            // The first puzzleDiv creation appends two children to the puzzleDivList.
            let currPuzzleDivIndex = document.getElementById('puzzleDivList').childElementCount - 2;

            // A map of puzzleDivs to their respective puzzle keys.
            sessionStorage.setItem('puzzleKey' + currPuzzleDivIndex, puzzleId);
        })
        // Hide the loader.
        document.getElementById('loader').style.display = 'none';
    });
}

function collapseQuestionField() {
    var questionField = document.getElementById("questionField");

    // getComputedStyle for modern browsers, currentStyle for IE
    var style = window.getComputedStyle ? getComputedStyle(questionField, null) : questionField.currentStyle;

    questionField.style.display = (style.display == "block") ? "none" : "block";
}

function collapseAnswerFields() {
    var answerFields = document.getElementById("answerFields");

    // getComputedStyle for modern browsers, currentStyle for IE
    var style = window.getComputedStyle ? getComputedStyle(answerFields, null) : answerFields.currentStyle;

    answerFields.style.display = (style.display == "block") ? "none" : "block";
}

function collapseHintFields() {
    var hintFields = document.getElementById("hintFields");

    // getComputedStyle for modern browsers, currentStyle for IE
    var style = window.getComputedStyle ? getComputedStyle(hintFields, null) : hintFields.currentStyle;

    hintFields.style.display = (style.display == "block") ? "none" : "block";
}

function collapseLeftTransitionField() {
    var leftTransitionField = document.getElementById("leftTransition");

    // getComputedStyle for modern browsers, currentStyle for IE
    var style = window.getComputedStyle ? getComputedStyle(leftTransitionField, null) : leftTransitionField.currentStyle;

    leftTransitionField.style.display = (style.display == "block") ? "none" : "block";
}

function collapseRightTransitionField() {
    var rightTransitionField = document.getElementById("rightTransition");

    // getComputedStyle for modern browsers, currentStyle for IE
    var style = window.getComputedStyle ? getComputedStyle(rightTransitionField, null) : rightTransitionField.currentStyle;

    rightTransitionField.style.display = (style.display == "block") ? "none" : "block";
}

function uncollapseAllFields() {
    document.getElementById("questionField").style.display = "block";
    document.getElementById("answerFields").style.display = "block";
    document.getElementById("hintFields").style.display = "block";
    document.getElementById("leftTransition").style.display = "block";
    document.getElementById("rightTransition").style.display = "block";
}