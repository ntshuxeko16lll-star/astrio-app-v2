// js/auth.js
// Handles user authentication (Sign up, Log in, Logout)

// Get references to auth forms (if they exist)
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");

// ----------------------
// Sign Up Function
// ----------------------
async function signUp(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            console.error("Sign-up error:", error.message);
            alert("Sign-up failed: " + error.message);
            return;
        }

        alert(
            "Sign-up successful! Please check your email for confirmation."
        );
        console.log("Sign-up data:", data);
    } catch (err) {
        console.error("Unexpected error during sign-up:", err);
    }
}

// ----------------------
// Log In Function
// ----------------------
async function logIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            console.error("Log-in error:", error.message);
            alert("Log-in failed: " + error.message);
            return;
        }

        console.log("Logged in:", data.user.email);
        appState.currentUser = data.user;

        // Redirect to feed page
        window.location.href = "../index.html";
    } catch (err) {
        console.error("Unexpected error during login:", err);
    }
}

// ----------------------
// Log Out Function
// ----------------------
async function logOutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Logout error:", error.message);
            return;
        }
        appState.currentUser = null;
        window.location.href = "auth.html";
    } catch (err) {
        console.error("Unexpected logout error:", err);
    }
}

// ----------------------
// Form Event Listeners
// ----------------------
if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = signupForm["signup-email"].value;
        const password = signupForm["signup-password"].value;
        signUp(email, password);
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = loginForm["login-email"].value;
        const password = loginForm["login-password"].value;
        logIn(email, password);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        logOutUser();
    });
                  }
