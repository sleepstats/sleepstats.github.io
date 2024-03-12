// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7g7c4PH_jNPzB7U60B4XsLPJp2wZugpY",
  authDomain: "sleepstats-2cf66.firebaseapp.com",
  projectId: "sleepstats-2cf66",
  storageBucket: "sleepstats-2cf66.appspot.com",
  messagingSenderId: "439404168878",
  appId: "1:439404168878:web:ee4a9cec62ee7c8dd20f3f",
  measurementId: "G-NL1JZWTM1B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
window.auth = auth;
window.SignIn = signInWithEmailAndPassword;


function signIn(event) {
  event.preventDefault(); // Prevent form submission

  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  window.SignIn(window.auth, email, password)

    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      console.log(user);
      alert("signed in!");
      window.location.href = "./assets/succ/succ.html";
      // ...
})
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    });
  }