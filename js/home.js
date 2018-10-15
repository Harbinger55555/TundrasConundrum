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

function resetInputs(fieldid) {
    var container = document.getElementById(fieldid);
    var inputs = container.getElementsByTagName('input');
    for (var index = 0; index < inputs.length; ++index) {
        inputs[index].value = '';
    }
}

function signUp() {
    resetInputs('signUpWindow');
    document.getElementById('signUpWindow').style.display='block';
}

function signUpSubmit() {
	var email = document.getElementById("newEmailField").value;
	var password = document.getElementById("newPwdField").value;
	var signUpButton = document.getElementById("signUpButton");
	// Prevent multiple submissions to firebase.
	signUpButton.disabled = true;

	if (!validInput(password)) {
        alert('Password must have at least one uppercase, one lowercase, one number, and be between 6 to 20 characters!');
        signUpButton.disabled = false;
        return false;
    }
	
	firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
	  // Handle Errors here.
		window.alert(error);
	  // If an error occurred, allow user to sign up again.
        signUpButton.disabled = false;
	});
}

function validInput(inputString) {
    // Range six to twenty characters, at least one uppercase letter, one lowercase letter and one number.
    var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!$%@#£^€*?&()]{6,20}$/;
    if (regex.test(inputString)) {
        return true;
    }
    return false;
}

function forgetPwd() {
    resetInputs('forgetPwdWindow');
    document.getElementById('forgetPwdWindow').style.display='block';
}

function forgetPwdSubmit() {
    var currUserEmail = document.getElementById('forgetPwdEmailField').value;
    // Prevent multiple submissions to firebase.
    var forgetPwdSubmitButton = document.getElementById("forgetPwdSubmitButton");
    forgetPwdSubmitButton.disabled = true;

    firebase.auth().sendPasswordResetEmail(currUserEmail).then(function() {
        // Email sent.
        window.alert('Password reset link sent!');
        document.getElementById('forgetPwdWindow').style.display = "none";
        // Reenable forgetPwdSubmitButton for next time the window is opened.
        forgetPwdSubmitButton.disabled = false;

    }).catch(function(error) {
        // An error happened.
        window.alert('Reset email sending error! Please enter a valid email or try again later');
        forgetPwdSubmitButton.disabled = false;
    });
}

// When the user clicks anywhere outside of the signUpWindow or forgetPwdWindow, close it
window.onclick = function(event) {
	// Get the signUpWindow
	let signUpWindow = document.getElementById('signUpWindow');
	// Get the forgetPwdWindow
	let forgetPwdWindow = document.getElementById('forgetPwdWindow');
    if (event.target == signUpWindow || event.target == forgetPwdWindow) {
        signUpWindow.style.display = "none";
        forgetPwdWindow.style.display = "none";
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

