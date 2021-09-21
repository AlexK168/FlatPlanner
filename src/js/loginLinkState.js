import { getAuth, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

const auth = getAuth();

let loginLink = document.getElementById("login-link");

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginLink.innerHTML = "Log out";
    loginLink.onclick = function(event) {
        signOut(auth).then(() => {
        }).catch((error) => {
            alert("error");
        });
        return true;
    }
  } else {
      loginLink.innerHTML = "Log in";
      loginLink.onclick = function(event) { return true; };
  }
});