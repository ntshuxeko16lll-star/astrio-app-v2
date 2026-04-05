// js/chat.js
// Handles 1:1 and group chat using Supabase Realtime

// Initialize Supabase (reuse credentials)
const supabaseUrl = "https://llooewepqlkcpqzmiuzo.supabase.co";
const supabaseKey = "sb_publishable_vYhWHzf0GkDxch6hp9QmAA_kXkJEu6C";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Chat container
const chatContainer = document.getElementById("chat-container");
if (!chatContainer) {
  console.error("Chat container not found!");
}

// Local messages array
let messages = [];

// ----------------------
// Render messages
// ----------------------
function renderMessages() {
  if (!chatContainer) return;
  chatContainer.innerHTML = ""; // Clear previous

  messages.forEach((msg) => {
    const msgEl = document.createElement("div");
    msgEl.className = `px-4 py-2 mb-2 rounded ${
      msg.sender_id === currentUserId
        ? "bg-cyan-500 text-black ml-auto w-max"
        : "bg-gray-800 text-white w-max"
    }`;
    msgEl.innerText = msg.content;
    chatContainer.appendChild(msgEl);
  });

  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ----------------------
// Add message locally & send to Supabase
// ----------------------
async function sendMessage(content, chatRoomId) {
  if (!content) return;

  const { data, error } = await supabase.from("messages").insert([
    {
      chat_room_id: chatRoomId,
      sender_id: currentUserId,
      content: content,
      created_at: new Date(),
    },
  ]);

  if (error) console.error("Error sending message:", error);
  else {
    console.log("Message sent:", data);
  }
}

// ----------------------
// Subscribe to messages
// ----------------------
async function subscribeChat(chatRoomId) {
  const { data: channel, error } = supabase
    .channel(`public:messages_chat_${chatRoomId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `chat_room_id=eq.${chatRoomId}`,
      },
      (payload) => {
        console.log("New chat message:", payload.new);
        messages.push(payload.new);
        renderMessages();
      }
    )
    .subscribe();

  if (error) console.error("Error subscribing to chat:", error);
}

// ----------------------
// Example usage
// ----------------------
const currentUserId = "123"; // Replace with real logged-in user ID
const currentChatRoomId = "1"; // Replace with selected chat room ID

subscribeChat(currentChatRoomId);

// Example: sending a message via input
const chatInput = document.getElementById("chat-input");
const chatSendBtn = document.getElementById("chat-send-btn");

if (chatSendBtn && chatInput) {
  chatSendBtn.addEventListener("click", () => {
    sendMessage(chatInput.value, currentChatRoomId);
    chatInput.value = "";
  });

  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage(chatInput.value, currentChatRoomId);
      chatInput.value = "";
    }
  });
}

// ----------------------
// Future: WebRTC voice/video calls
// ----------------------
// We can integrate WebRTC for live calls here in a later step
