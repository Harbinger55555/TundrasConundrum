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

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

var uiConfig = {
	callbacks: {
	signInSuccessWithAuthResult: function(authResult, redirectUrl) {
	  // User successfully signed in.
	  // Return type determines whether we continue the redirect automatically
	  // or whether we leave that to developer to handle.
	  return true;
	},
	uiShown: function() {
	  // The widget is rendered.
	  // Hide the loader.
	  document.getElementById('loader').style.display = 'none';
	}
	},
	// Will use popup for IDP Providers sign-in flow instead of the default, redirect.
	signInFlow: 'popup',
	signInSuccessUrl: '<url-to-redirect-to-on-success>',
	signInOptions: [
	// Leave the lines as is for the providers you want to offer your users.
	firebase.auth.GoogleAuthProvider.PROVIDER_ID,
	firebase.auth.FacebookAuthProvider.PROVIDER_ID,
	],
	// Terms of service url.
	tosUrl: '<your-tos-url>',
	// Privacy policy url.
	privacyPolicyUrl: '<your-privacy-policy-url>'
};

// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);

