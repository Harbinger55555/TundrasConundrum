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
    document.getElementById('newUsernameWindow').style.display='flex';
}

function newUsernameSubmit() {
    firebase.auth().currentUser.reauthenticateAndRetrieveDataWithCredential(
        firebase.auth.EmailAuthProvider.credential(
            firebase.auth().currentUser.email,
            document.getElementById("newUsernamePwd").value
        )
    ).then(
        () => {
            // Update the username in the RTDB, then refresh the page.
            var updates = {};
            updates['/users/' + firebase.auth().currentUser.uid + '/name'] = document.getElementById('newUsernameField').value;
            firebase.database().ref().update(updates).then(
                () => {
                    document.location.reload(true)
                })
        }).catch(function(error){
        // If the user entered the wrong password, alert the user that new data is not updated.
        if (error.code == "auth/wrong-password") {
            window.alert("Wrong password entered, please retry...");
            return;
        } else {
            // If it is any other error, throw it again.
            throw(error);
        }});
}

function newEmail() {
    resetInputs('newEmailWindow');
    document.getElementById('newEmailWindow').style.display='flex';
}

function newEmailSubmit() {
    
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