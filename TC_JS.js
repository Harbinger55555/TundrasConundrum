firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		// User is signed in.
		document.getElementById("loggedInDiv").style.display = "initial";
		document.getElementById("loginDiv").style.display = "none";
		
		var user = firebase.auth().currentUser;
		
		if (user != null) {
			var email_id = user.email;
			document.getElementById("greeting").innerHTML = "Welcome " + email_id;
		}
	} else {
		// No user is signed in.
		document.getElementById("loggedInDiv").style.display = "none";
		document.getElementById("loginDiv").style.display = "initial";
	}
});

function login() {
	var userEmail = document.getElementById("emailField").value;
	var userPass = document.getElementById("pwdField").value;
	
	firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function(error) {
	  // Handle Errors here.
	  
	  window.alert(error);
	  // ...
	});
}

function logout() {
	firebase.auth().signOut().then(function() {
		// Sign-out successful.
	}).catch(function(error) {
		// An error happened.
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