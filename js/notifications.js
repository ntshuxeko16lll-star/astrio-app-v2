window.Astrio = window.Astrio || {};

Astrio.registerPage("notifications", async () => {
  const list = document.getElementById("notifications-list");
  const markReadBtn = document.getElementById("mark-read");

  const loadNotifications = async () => {
    if (!Astrio.state.user) return;

    const { data, error } = await Astrio.sb
      .from("notifications")
      .select("*")
      .eq("user_id", Astrio.state.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      list.innerHTML = `<div class="card">Could not load notifications.</div>`;
      return;
    }

    const items = data || [];
    if (!items.length) {
      list.innerHTML = `<div class="card">No notifications yet.</div>`;
      return;
    }

    list.innerHTML = items
      .map(
        (item) => `
          <li class="card">
            <div class="row" style="justify-content:space-between;align-items:flex-start;">
              <div class="column" style="gap:4px;">
                <strong>${item.type || "update"}</strong>
                <span class="small-note">${item.message || item.content || ""}</span>
              </div>
              <span class="small-note">${new Date(item.created_at).toLocaleString()}</span>
            </div>
          </li>
        `
      )
      .join("");
  };

  if (markReadBtn) {
    markReadBtn.addEventListener("click", async () => {
      if (!Astrio.state.user) return;

      await Astrio.sb
        .from("notifications")
        .update({ read: true })
        .eq("user_id", Astrio.state.user.id);

      await loadNotifications();
    });
  }

  if (Astrio.channels.notifications) {
    Astrio.channels.notifications.unsubscribe();
  }

  Astrio.channels.notifications = Astrio.sb
    .channel("astrio-notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: Astrio.state.user ? `user_id=eq.${Astrio.state.user.id}` : undefined
      },
      () => loadNotifications()
    )
    .subscribe();

  await loadNotifications();
});
