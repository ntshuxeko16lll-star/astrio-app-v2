window.Astrio = window.Astrio || {};

Astrio.registerPage("chat", async () => {
  const roomList = document.getElementById("chat-room-list");
  const messageList = document.getElementById("chat-messages");
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send-btn");
  const newRoomBtn = document.getElementById("chat-new-room");
  const roomNameInput = document.getElementById("chat-room-name");

  const state = {
    rooms: [],
    activeRoom: null
  };

  const renderRooms = () => {
    if (!roomList) return;

    roomList.innerHTML = state.rooms
      .map(
        (room) => `
          <button class="room-item ${state.activeRoom?.id === room.id ? "is-active" : ""}" data-room="${room.id}">
            <strong>${room.name}</strong>
            <div class="small-note">${room.is_public ? "Public room" : "Private room"}</div>
          </button>
        `
      )
      .join("");
  };

  const renderMessages = (messages) => {
    if (!messageList) return;

    messageList.innerHTML = messages
      .map(
        (msg) => `
          <div class="message ${msg.sender_id === Astrio.state.user.id ? "me" : ""}">
            <div>${msg.content || ""}</div>
            <span class="message-time">${new Date(msg.created_at).toLocaleTimeString()}</span>
          </div>
        `
      )
      .join("");

    messageList.scrollTop = messageList.scrollHeight;
  };

  const loadMessages = async (roomId) => {
    if (!roomId) return;

    const { data, error } = await Astrio.sb
      .from("messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    renderMessages(data || []);
  };

  const selectRoom = async (roomId) => {
    state.activeRoom = state.rooms.find((room) => room.id === roomId) || null;
    Astrio.state.roomId = roomId;
    renderRooms();
    await loadMessages(roomId);

    if (Astrio.channels.chat) {
      Astrio.channels.chat.unsubscribe();
    }

    Astrio.channels.chat = Astrio.sb
      .channel(`astrio-room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`
        },
        () => loadMessages(roomId)
      )
      .subscribe();
  };

  const ensureRoom = async () => {
    const { data: rooms, error } = await Astrio.sb
      .from("chat_rooms")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      roomList.innerHTML = `<div class="card">Could not load chat rooms.</div>`;
      return;
    }

    let list = rooms || [];

    if (!list.length) {
      const { data: created } = await Astrio.sb
        .from("chat_rooms")
        .insert([{ name: "General", is_public: true, created_by: Astrio.state.user.id }])
        .select("*");

      list = created || [];
    }

    state.rooms = list;

    if (!state.activeRoom) {
      state.activeRoom = state.rooms[0];
      Astrio.state.roomId = state.activeRoom?.id || null;
    }

    renderRooms();

    if (state.activeRoom) {
      await selectRoom(state.activeRoom.id);
    }
  };

  roomList?.addEventListener("click", async (e) => {
    const roomBtn = e.target.closest("[data-room]");
    if (!roomBtn) return;
    await selectRoom(roomBtn.dataset.room);
  });

  sendBtn?.addEventListener("click", async () => {
    const text = input?.value?.trim();
    if (!text || !state.activeRoom) return;

    await Astrio.sb.from("messages").insert({
      room_id: state.activeRoom.id,
      sender_id: Astrio.state.user.id,
      sender_name: Astrio.userName(),
      content: text
    });

    if (input) input.value = "";
  });

  input?.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendBtn?.click();
    }
  });

  newRoomBtn?.addEventListener("click", async () => {
    const name = (roomNameInput?.value || "").trim();
    if (!name) return;

    const { data, error } = await Astrio.sb.from("chat_rooms").insert([{
      name,
      is_public: true,
      created_by: Astrio.state.user.id
    }]).select("*");

    if (error) {
      console.error(error);
      return;
    }

    if (roomNameInput) roomNameInput.value = "";
    state.rooms = [...state.rooms, ...(data || [])];
    renderRooms();
  });

  await ensureRoom();
});
