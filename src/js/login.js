import { getAuth, createUserWithEmailAndPassword,
   signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

const signUpForm = document.getElementById('auth-form');
let signupOption = document.getElementById("sign-up");

let passwordLabel = document.getElementById("password-label");
let emailLabel = document.getElementById("email-label");
const emailField = document.getElementById('email-field');
const passwordField = document.getElementById('password-field');
const submitButton = document.getElementById("submit");

function makeLabelInvisible(label) {
  label.style.color = "transparent";
}

function makeLabelVisible(label) {
  label.style.color = "white"
}

function validityCheck() {
  let isValid = emailField.checkValidity() && passwordField.checkValidity();
  
  if ( isValid ) {
    submitButton.disabled = false;
  } else {
    submitButton.disabled = true;
  }
}

emailField.addEventListener('keyup', validityCheck);
passwordField.addEventListener('keyup', validityCheck);

passwordField.addEventListener('focusout', function(event) {
  if (passwordField.value == "") {
    makeLabelVisible(passwordLabel);
  }
});

emailField.addEventListener('focusout', function(event) {
  if (emailField.value == "") {
    makeLabelVisible(emailLabel);
  }
});

passwordField.addEventListener('focus', function(event) { makeLabelInvisible(passwordLabel); });
emailField.addEventListener('focus', function(event) { makeLabelInvisible(emailLabel); });


// authentication stuff //

const auth = getAuth();

signUpForm.onsubmit = function() {
  let isSigningUp = signupOption.checked;
  let email = emailField.value;
  let password = passwordField.value;
  if (isSigningUp) {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        window.location.replace("projects.html");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
      });
  } else {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        window.location.replace("projects.html");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
      });
  }

  return false;
}
