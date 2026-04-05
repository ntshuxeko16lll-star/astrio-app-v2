// js/app.js
// Core initialization and Supabase setup

// ----------------------
// Supabase Configuration
// ----------------------
const SUPABASE_URL = "https://llooewepqlkcpqzmiuzo.supabase.co";
const SUPABASE_KEY = "sb_publishable_vYhWHzf0GkDxch6hp9QmAA_kXkJEu6C";

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ----------------------
// Global App State
// ----------------------
const appState = {
    currentUser: null,
    feedPosts: [],
    activeChatRoom: null,
    notifications: [],
};

// ----------------------
// Helper Functions
// ----------------------

// Check if user is logged in
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
        appState.currentUser = session.user;
        console.log("User logged in:", appState.currentUser.email);
        return true;
    }
    return false;
}

// Log out
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout error:", error.message);
    else {
        appState.currentUser = null;
        window.location.href = "pages/auth.html";
    }
}

// Fetch feed posts
async function fetchFeed() {
    const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(50);

    if (error) console.error("Error fetching posts:", error.message);
    else {
        appState.feedPosts = data;
        console.log("Feed posts loaded:", data.length);
    }
}

// Subscribe to real-time updates
function subscribeRealtime() {
    // Feed updates
    supabase
        .channel("public:posts")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "posts" },
            (payload) => {
                console.log("Realtime post update:", payload);
                fetchFeed(); // reload feed
            }
        )
        .subscribe();

    // Notifications updates
    supabase
        .channel("public:notifications")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "notifications" },
            (payload) => {
                console.log("Realtime notification:", payload);
                appState.notifications.push(payload.new);
            }
        )
        .subscribe();
}

// Initialize App
async function initApp() {
    const loggedIn = await checkAuth();
    if (!loggedIn) {
        window.location.href = "pages/auth.html";
        return;
    }

    // Load feed
    await fetchFeed();

    // Subscribe to real-time changes
    subscribeRealtime();
}

// Call initApp on page load
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});
