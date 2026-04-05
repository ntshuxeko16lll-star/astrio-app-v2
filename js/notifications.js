/* ==========================
   ASTRIO NOTIFICATIONS.JS
   Handles real-time notifications
========================== */

async function initNotifications() {
  const notificationPanel = document.getElementById("notification-panel");
  if (!notificationPanel) return;

  notificationPanel.innerHTML = "<p class='neon-text'>Loading notifications...</p>";

  // 1️⃣ Fetch existing notifications from Supabase
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", supabase.auth.user()?.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notifications:", error);
    notificationPanel.innerHTML = "<p class='neon-text'>Failed to load notifications</p>";
    return;
  }

  renderNotifications(notifications);

  // 2️⃣ Subscribe to realtime notifications
  supabase
    .channel(`public:notifications:user_id=eq.${supabase.auth.user()?.id}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications" },
      payload => {
        renderNotifications([payload.new], true);
      }
    )
    .subscribe();
}

// Render notifications
function renderNotifications(items, prepend = false) {
  const panel = document.getElementById("notification-panel");
  if (!panel) return;

  items.forEach(item => {
    const notif = document.createElement("div");
    notif.className = "notification-item neon-glow";

    notif.innerHTML = `
      <span class="notif-type">${item.type === "like" ? "❤️" : item.type === "comment" ? "💬" : "🔔"}</span>
      <span class="notif-message">${item.message}</span>
      <span class="notif-time">${new Date(item.created_at).toLocaleTimeString()}</span>
    `;

    if (prepend) panel.prepend(notif);
    else panel.appendChild(notif);
  });
}

// Example: manually trigger notification (for testing)
function triggerNotification(type, message) {
  supabase
    .from("notifications")
    .insert([
      {
        user_id: supabase.auth.user()?.id,
        type,
        message
      }
    ])
    .then(({ error }) => {
      if (error) console.error("Error triggering notification:", error);
    });
}

// Initialize notifications when DOM is ready
document.addEventListener("DOMContentLoaded", initNotifications);
