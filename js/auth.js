/* ==========================
   ASTRIO AUTH.JS
   Handles Sign-up / Log-in / Redirect
========================== */

// Grab form elements
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

// 1️⃣ LOGIN FUNCTION
async function loginUser(event) {
  event.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Login failed: " + error.message);
    console.error(error);
  } else {
    console.log("Logged in:", data);
    loadPage("feed");
  }
}

// 2️⃣ SIGNUP FUNCTION
async function signupUser(event) {
  event.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const username = document.getElementById("signup-username").value;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username
      }
    }
  });

  if (error) {
    alert("Sign-up failed: " + error.message);
    console.error(error);
  } else {
    alert("Sign-up successful! Please verify your email.");
    console.log("Signed up:", data);
    loadPage("auth"); // Redirect to login
  }
}

// 3️⃣ Attach Event Listeners if forms exist
if (loginForm) loginForm.addEventListener("submit", loginUser);
if (signupForm) signupForm.addEventListener("submit", signupUser);
