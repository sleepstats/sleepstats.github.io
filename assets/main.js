function Login(event) {
  event.preventDefault();

  var email = document.getElementById("login-email").value;
  var password = document.getElementById("login-pass").value;

  if (email == "Formget@email.com" && password == "12345678") {
    alert("Login successfully");
    window.location = "./assets/succ/succ.html"; // Redirecting to other page.
    return false;
  }else{
    alert("Login failed")
  }
}

