
  function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    // Hide all tab content
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    // Deactivate all tab links
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace("active", "");
    }

    // Show the specific tab content and mark the button as active
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    if(tabName == "Tab3"){
      document.getElementById("logoutBtn").addEventListener("click", function () {
        // Add your logout functionality here
        // For example, if you're using Firebase, you can sign out the user:
        window.signOutAcc(window.auth)
          .then(function () {
            // Sign-out successful.
            console.log("User signed out");
            window.location.href = "../../";
          }).catch(function (error) {
            // An error happened.
            console.error("Error signing out: ", error);
          });
      });
    }

  }

  // Open the default tab on page load
  document.getElementById("defaultOpen").click();

