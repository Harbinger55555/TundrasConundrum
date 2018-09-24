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
	
	firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
	  // Handle Errors here.
		window.alert(error);
	  // ...
	});
}

// Get the signUpWindow
var signUpWindow = document.getElementById('signUpWindow');

// When the user clicks anywhere outside of the signUpWindow, close it
window.onclick = function(event) {
    if (event.target == signUpWindow) {
        signUpWindow.style.display = "none";
    }
}