firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
        // No user is signed in.
        window.location.href = "index.html";
    } else {
        // User still signed in.
        if (user) {
            loadUserDetails(user);
        }
    }
});

function loadUserDetails(user) {
    var userId = user.uid;
    let userName = firebase.database().ref().child('users/' + userId + '/name');
    userName.once('value', function (snapshot) {
        document.getElementById("currentUsername").value = (snapshot.val() || "Anonymous User");
    })

    document.getElementById("currentEmail").value = user.email;
}

function resetInputs(fieldid) {
    var container = document.getElementById(fieldid);
    var inputs = container.getElementsByTagName('input');
    for (var index = 0; index < inputs.length; ++index) {
        inputs[index].value = '';
    }
}

function newUsername() {
    resetInputs('newUsernameWindow');
    document.getElementById('usernameSubmitButton').disabled = false;
    document.getElementById('newUsernameWindow').style.display='flex';
}

function newUsernameSubmit() {
    var usernameSubmitButton = document.getElementById('usernameSubmitButton');
    // Prevent multiple submissions to firebase.
    usernameSubmitButton.disabled = true;
    var username = document.getElementById("newUsernameField").value;

    // Check if newUsername is valid first.
    if (!validUsername(username)) {
        alert('Username must have max 20 characters, at least one uppercase letter, one lowercase letter or one number');
        usernameSubmitButton.disabled = false;
        return false;
    }

    var currUser = firebase.auth().currentUser;
    currUser.reauthenticateAndRetrieveDataWithCredential(
        firebase.auth.EmailAuthProvider.credential(
            currUser.email,
            document.getElementById("newUsernamePwd").value
        )
    ).then(
        () => {
            // Update the username in the RTDB, then refresh the page.
            var updates = {};
            updates['/users/' + currUser.uid + '/name'] = username;
            firebase.database().ref().update(updates).then(
                () => {
                    document.location.reload(true)
                })
        }).catch(function(error){
            // Reenable the submit button if any error occurred.
            usernameSubmitButton.disabled = false;
            if (error.code == "auth/wrong-password") {
                // If the user entered the wrong password, alert the user.
                alert("Wrong password entered, please retry...");
                return;
            } else {
                // If it is any other error, throw it again.
                throw(error);
            }
        });
}

function newEmail() {
    resetInputs('newEmailWindow');
    document.getElementById('emailSubmitButton').disabled = false;
    document.getElementById('newEmailWindow').style.display='flex';
}

function newEmailSubmit() {
    var emailSubmitButton = document.getElementById('emailSubmitButton');
    // Prevent multiple submissions to firebase.
    emailSubmitButton.disabled = true;
    var currUser = firebase.auth().currentUser;
    currUser.reauthenticateAndRetrieveDataWithCredential(
        firebase.auth.EmailAuthProvider.credential(
            currUser.email,
            document.getElementById("newEmailPwd").value
        )
    ).then(
        () => {
            // Update the user email, then refresh the page.
            currUser.updateEmail(document.getElementById("newEmailField").value).then(
                () => {
                    // Update successful.
                    document.location.reload(true)
                }).catch(function(error){
                    // Reenable the submit button if any error occurred.
                    emailSubmitButton.disabled = false;
                    if (error.code = "auth/invalid-email") {
                        // If the user entered an invalid-email, alert the user.
                        window.alert("Invalid email format, please retry...");
                        return;
                    } else {
                        // If it is any other error, throw it again.
                        throw(error);
                    }
                })
        }).catch(function(error){
            // Reenable the submit button if any error occurred.
            emailSubmitButton.disabled = false;
            if (error.code == "auth/wrong-password") {
                // If the user entered the wrong password, alert the user.
                window.alert("Wrong password entered, please retry...");
                return;
            } else {
                // If it is any other error, throw it again.
                throw(error);
            }
        });
}

function newPwd() {
    resetInputs('newPwdWindow');
    document.getElementById('pwdSubmitButton').disabled = false;
    document.getElementById('newPwdWindow').style.display='flex';
}

function validInput(inputString) {
    // Range six to twenty characters, at least one uppercase letter, one lowercase letter and one number.
    var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!$%@#£^€*?&()]{6,20}$/;
    if (regex.test(inputString)) {
        return true;
    }
    return false;
}

function validUsername(userName) {
    // Username can be empty.
    // If not empty, max 20 characters, at least one uppercase letter, one lowercase letter or one number.
    if (userName == "") return true;
    var regex = /^(?=.*[a-zA-Z\d])[a-zA-Z\d\s!$%@#'£^€*?&()]{0,20}$/;
    if (regex.test(userName)) {
        return true;
    }
    return false;
}

function newPwdSubmit() {
    var newPwd = document.getElementById("newPwdField").value;
    var newPwdReenter = document.getElementById("newPwdFieldReenter").value;
    var currPwd = document.getElementById('newPwdCurrPwd').value;
    var pwdSubmitButton = document.getElementById('pwdSubmitButton');
    // Prevent multiple submissions to firebase.
    pwdSubmitButton.disabled = true;

    if (!validInput(newPwd)) {
        alert('Password must have at least one uppercase, one lowercase, one number, and be between 6 to 20 characters!');
        pwdSubmitButton.disabled = false;
        return false;
    }

    if (newPwd != newPwdReenter) {
        alert('Passwords do not match!');
        pwdSubmitButton.disabled = false;
        return false;
    }

    var currUser = firebase.auth().currentUser;
    currUser.reauthenticateAndRetrieveDataWithCredential(
        firebase.auth.EmailAuthProvider.credential(
            currUser.email,
            currPwd
        )
    ).then(
        () => {
            // Alert the user that same password cannot be reused.
            if (newPwd == currPwd) {
                alert('New password cannot be same as the current password!');
                pwdSubmitButton.disabled = false;
                return false;
            }

            // Update the user password, then refresh the page.
            currUser.updatePassword(newPwd).then(
                () => {
                    document.location.reload(true)
                })
        }).catch(function(error){
            // Reenable the submit button if any error occurred.
            pwdSubmitButton.disabled = false;
            if (error.code == "auth/wrong-password") {
                // If the user entered the wrong password, alert the user.
                alert("Wrong password entered, please retry...");
                return;
            } else {
                // If it is any other error, throw it again.
                throw(error);
            }
        });
}

function delYesClicked() {
    // Delete all rooms/puzzles related to the user then delete the user from Auth Db.
    // The delete order should be as follows:
    // 1). Delete the rooms under the user and the puzzles under each room.
    // 2). Delete the user info from the RTDB.
    // 3). Delete the user from Auth Db.
    // After making the necessary deletions, logout the user.

    alert("Please wait until all data related is being deleted.");
    // Get the currently logged in user.
    var currUser = firebase.auth().currentUser;
    var userId = firebase.auth().currentUser.uid;

    let ownedRooms = firebase.database().ref().child('users/' + userId + '/rooms');
    ownedRooms.once('value', function (snapshot) {
        snapshot.forEach(function (room) {
            delRoomAndItsPuzzles(room.key);
        })
    }).then(function() {
            var updates = {};
            updates['/users/' + userId] = null;
            firebase.database().ref().update(updates).then(function() {
                    currUser.delete().then(function() {
                        // User deleted.
                        firebase.auth().signOut().then(function() {
                            // Sign-out successful.
                            window.location.href = "index.html";
                        }).catch(function(error) {
                            // An error happened.
                        });
                    }).catch(function(error) {
                        // An error happened.
                    });
                }
            );
        }
    )
}

function delRoomAndItsPuzzles(roomKey) {
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

            // Update the firebase RTDB.
            firebase.database().ref().update(updates).then(
                () => {
                    // Create a reference to the room theme.
                    var themeRef = firebase.storage().ref().child(roomKey + '/theme');

                    // Delete the room theme from storage.
                    themeRef.delete().then(
                        () => {
                            return;
                        }).catch(function (error) {
                        // If the theme does not exist, simply return the function call.
                        if (error.code == "storage/object-not-found") {
                            return;
                        } else {
                            // If it is any other error, throw it again.
                            throw(error);
                        }
                    });
                });
        });
}



// When the user clicks anywhere outside of the pop up windows, close it.
window.onclick = function(event) {
    let newUsernameWindow = document.getElementById('newUsernameWindow');
    let newEmailWindow = document.getElementById('newEmailWindow');
    let newPwdWindow = document.getElementById('newPwdWindow');
    let delConfirmWindow = document.getElementById('delConfirmWindow');
    if (event.target == newUsernameWindow || event.target == newEmailWindow ||
        event.target == newPwdWindow || event.target == delConfirmWindow) {
        newUsernameWindow.style.display = "none";
        newEmailWindow.style.display = "none";
        newPwdWindow.style.display = "none";
        delConfirmWindow.style.display = "none";
    }
}