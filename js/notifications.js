// js/notifications.js
// Handles real-time notifications using Supabase Realtime

// Initialize Supabase client (reuse same credentials)
const supabaseUrl = "https://llooewepqlkcpqzmiuzo.supabase.co";
const supabaseKey = "sb_publishable_vYhWHzf0GkDxch6hp9QmAA_kXkJEu6C";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Notification container
let notifContainer = document.getElementById("notif-btn-container");
if (!notifContainer) {
  notifContainer = document.createElement("div");
  notifContainer.id = "notif-btn-container";
  notifContainer.className = "fixed top-4 right-4 z-50";
  document.body.appendChild(notifContainer);
}

// Local array to store notifications
let notifications = [];

// ----------------------
// Display Notifications
// ----------------------
function renderNotifications() {
  notifContainer.innerHTML = ""; // Clear previous notifications

  notifications.slice(-5).reverse().forEach((notif) => {
    const notifEl = document.createElement("div");
    notifEl.className = "bg-gray-800 text-white px-4 py-2 rounded mb-2 shadow-lg neon-border";
    notifEl.innerText = notif.message;
    notifContainer.appendChild(notifEl);
    // Auto-remove after 5s
    setTimeout(() => {
      notifEl.remove();
    }, 5000);
  });
}

// ----------------------
// Add Notification
// ----------------------
function addNotification(message) {
  notifications.push({ message, time: new Date() });
  renderNotifications();
}

// ----------------------
// Supabase Realtime Subscription
// ----------------------
async function subscribeNotifications(userId) {
  // Subscribe to 'notifications' table
  const { data: channel, error } = supabase
    .channel(`public:notifications_user_${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log("New notification:", payload.new);
        addNotification(payload.new.message);
      }
    )
    .subscribe();

  if (error) {
    console.error("Error subscribing to notifications:", error);
  }
}

// ----------------------
// Example usage
// ----------------------
const currentUserId = "123"; // Replace with real logged-in user ID from auth.js
subscribeNotifications(currentUserId);

// Optional: click on notif button to see last notifications
const notifBtn = document.getElementById("notif-btn");
notifBtn.addEventListener("click", () => {
  renderNotifications();
});
