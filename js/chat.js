/* ==========================
   ASTRIO CHAT.JS
   Handles real-time chat, emojis, and media
========================== */

const chatPanel = document.getElementById("chat-panel");
const chatInput = document.getElementById("chat-input");
const chatSendBtn = document.getElementById("chat-send-btn");

// 1️⃣ Initialize chat
async function initChat() {
  if (!chatPanel) return;

  const user = supabase.auth.user();
  if (!user) return;

  chatPanel.innerHTML = "<p class='neon-text'>Loading messages...</p>";

  // Load existing messages
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error loading messages:", error);
    chatPanel.innerHTML = "<p class='neon-text'>Failed to load messages</p>";
    return;
  }

  renderMessages(messages);

  // Subscribe to new messages in real-time
  supabase
    .channel("public:messages")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, payload => {
      renderMessages([payload.new], true);
    })
    .subscribe();
}

// 2️⃣ Render messages
function renderMessages(messages, append = false) {
  if (!chatPanel) return;

  messages.forEach(msg => {
    const msgDiv = document.createElement("div");
    msgDiv.className = msg.user_id === supabase.auth.user()?.id ? "message-outgoing neon-glow" : "message-incoming neon-glow";

    msgDiv.innerHTML = `
      <span class="message-user">${msg.user_name || "Anon"}</span>
      <span class="message-text">${msg.text}</span>
      <span class="message-time">${new Date(msg.created_at).toLocaleTimeString()}</span>
    `;

    if (append) chatPanel.appendChild(msgDiv);
    else chatPanel.prepend(msgDiv);
  });

  chatPanel.scrollTop = chatPanel.scrollHeight;
}

// 3️⃣ Send message
async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  const user = supabase.auth.user();
  const userName = user?.email.split("@")[0] || "Anon";

  const { error } = await supabase
    .from("messages")
    .insert([
      {
        user_id: user.id,
        user_name: userName,
        text
      }
    ]);

  if (error) console.error("Error sending message:", error);
  chatInput.value = "";
}

// 4️⃣ Event listeners
if (chatSendBtn) chatSendBtn.addEventListener("click", sendMessage);
if (chatInput) chatInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

// 5️⃣ Emoji support (using Twemoji/EmojiMart placeholders)
function addEmoji(emoji) {
  chatInput.value += emoji;
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", initChat);
