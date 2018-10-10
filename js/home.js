firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		// User is signed in.
		window.location.href = "../html/mainMenu.html";
	} else {
		// No user signed in.
		
	}
});

function login() {
	var userEmail = document.getElementById("emailField").value;
	var userPass = document.getElementById("pwdField").value;
	
	firebase.auth().signInWithEmailAndPassword(userEmail, userPass).then(function() {
		// Sign-in successful.
		window.location.href = "../html/mainMenu.html";
	}).catch(function(error) {
	  // An error happened.
	  window.alert(error);
	});
}

function signUp() {
	var email = document.getElementById("newEmailField").value;
	var password = document.getElementById("newPwdField").value;
	// Prevent multiple submissions to firebase.
	document.getElementById("signUpButton").disabled = true;
	
	firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
	  // Handle Errors here.
		window.alert(error);
	  // If an error occurred, allow user to sign up again.
		document.getElementById("signUpButton").disabled = false;
	});
}

// When the user clicks anywhere outside of the signUpWindow, close it
window.onclick = function(event) {
	// Get the signUpWindow
	let signUpWindow = document.getElementById('signUpWindow');
    if (event.target == signUpWindow) {
        signUpWindow.style.display = "none";
    }
}