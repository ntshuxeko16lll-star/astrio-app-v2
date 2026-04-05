// ==========================
// ASTRIO APP.JS
// Handles Supabase, Page Navigation, Realtime Updates
// ==========================

// 1️⃣ Supabase Setup
const SUPABASE_URL = "https://llooewepqlkcpqzmiuzo.supabase.co";
const SUPABASE_KEY = "sb_publishable_vYhWHzf0GkDxch6hp9QmAA_kXkJEu6C";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2️⃣ Page Loader
const appContainer = document.getElementById("app");

function loadPage(page) {
  fetch(`pages/${page}.html`)
    .then((res) => res.text())
    .then((html) => {
      appContainer.innerHTML = html;
      if (page === "feed") initFeed();
      if (page === "ai") initAI();
      if (page === "chat") initChat();
      if (page === "profile") initProfile();
      if (page === "notifications") initNotifications();
    })
    .catch((err) => {
      console.error("Error loading page:", err);
      appContainer.innerHTML = `<p class="neon-text">Page not found!</p>`;
    });
}

// 3️⃣ Auth State
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) loadPage("auth");
  else loadPage("feed");
}

// 4️⃣ Initialize App
window.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();
});

// 5️⃣ Logout Function
async function logout() {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    loadPage("auth");
  }
}

// 6️⃣ Real-time Feed Listener
function initFeed() {
  const feedContainer = document.getElementById("feed-container");
  if (!feedContainer) return;

  // Listen for new posts
  supabase
    .channel("public:posts")
    .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, payload => {
      const post = payload.new;
      feedContainer.innerHTML = `<div class="post-card neon-glow">
        <p>${post.user}: ${post.caption}</p>
      </div>` + feedContainer.innerHTML;
    })
    .subscribe();
}

// 7️⃣ AI Page Init
function initAI() {
  // Placeholder for AI integration: RunwayML, Stable Diffusion, Tone.js
  console.log("AI Page Loaded - integrate AI tools here!");
}

// 8️⃣ Chat Init
function initChat() {
  const chatContainer = document.getElementById("chat-container");
  if (!chatContainer) return;

  supabase
    .channel("public:messages")
    .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, payload => {
      const msg = payload.new;
      const msgEl = document.createElement("div");
      msgEl.className = "post-card neon-glow";
      msgEl.textContent = `${msg.user}: ${msg.message}`;
      chatContainer.prepend(msgEl);
    })
    .subscribe();
}

// 9️⃣ Profile Init
function initProfile() {
  console.log("Profile Page Loaded - load user info, stats, posts");
}

// 🔔 Notifications Init
function initNotifications() {
  console.log("Notifications Page Loaded - listen to realtime alerts");
          }
