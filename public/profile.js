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
        document.getElementById("currentUsername").innerHTML = (snapshot.val() || "Anonymous User");
    })

    document.getElementById("currentEmail").innerHTML = user.email;
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
            updates['/users/' + currUser.uid + '/name'] = document.getElementById('newUsernameField').value;
            firebase.database().ref().update(updates).then(
                () => {
                    document.location.reload(true)
                })
        }).catch(function(error){
            // Reenable the submit button if any error occurred.
            usernameSubmitButton.disabled = false;
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
    resetInputs('signUpWindow');
    document.getElementById('signUpWindow').style.display='flex';
}

// When the user clicks anywhere outside of the pop up windows, close it.
window.onclick = function(event) {
    let newUsernameWindow = document.getElementById('newUsernameWindow');
    let newEmailWindow = document.getElementById('newEmailWindow');
    let newPwdWindow = document.getElementById('newPwdWindow');
    if (event.target == newUsernameWindow || event.target == newEmailWindow || event.target == newPwdWindow) {
        newUsernameWindow.style.display = "none";
        newEmailWindow.style.display = "none";
        newPwdWindow.style.display = "none";
    }
}