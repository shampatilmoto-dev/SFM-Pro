// ==========================================
// SFM PRO
// Login Controller
// Release 2.1.1
// ==========================================

function login() {

    const username =
        document.getElementById("username")
        .value.trim().toLowerCase();

    const password =
        document.getElementById("password")
        .value;

    if (username === "sham" && password === "1234") {

        // Save Login Session
        sessionStorage.setItem("sfmLoggedIn", "true");

        // Save Username
        sessionStorage.setItem("sfmUser", "Sham");

        // Redirect
        window.location.href = "dashboard.html";

    }

    else {

        alert("Invalid Username or Password");

    }

}