window.Astrio = window.Astrio || {};
const feed = document.getElementById("feed");

if (feed) {
    feed.innerHTML = `
        <div class="post-card fade-in">
            <h2>Welcome to Astrio</h2>
            <p>Your app is now working.</p>
        </div>

        <div class="post-card fade-in">
            <h2>Test Post</h2>
            <p>This is your first feed item.</p>
        </div>
    `;
}
Astrio.registerPage("feed", async () => {
  const list = document.getElementById("feed-list");
  if (!list) return;

  const render = (posts) => {
    list.innerHTML = "";

    if (!posts.length) {
      list.innerHTML = `<div class="card"><div class="small-note">No posts yet.</div></div>`;
      return;
    }

    posts.forEach((post) => {
      const card = document.createElement("article");
      card.className = "card post-card fade-in";

      const avatar = post.author_avatar
        ? `<img class="avatar" src="${post.author_avatar}" alt="">`
        : `<div class="avatar"></div>`;

      const media =
        post.media_url && post.type !== "text"
          ? (post.type === "video"
              ? `<div class="media-frame"><video src="${post.media_url}" controls playsinline></video></div>`
              : `<div class="media-frame"><img src="${post.media_url}" alt=""></div>`)
          : "";

      card.innerHTML = `
        <div class="post-head">
          <div class="post-author">
            ${avatar}
            <div>
              <div class="post-name">${post.author_name || "astrio"}</div>
              <div class="post-meta">${new Date(post.created_at).toLocaleString()}</div>
            </div>
          </div>
          <button class="icon-btn" data-share="${post.id}" aria-label="Share">
            <svg viewBox="0 0 24 24"><path d="M14 9V5l7 7-7 7v-4.1c-4.4 0-7.5 1.4-10 4.1.9-5.1 3.7-10.1 10-10.1z"></path></svg>
          </button>
        </div>

        <div class="column">
          <div>${post.caption || ""}</div>
          ${media}
        </div>

        <div class="card-actions">
          <button class="pill action-chip" data-like="${post.id}" data-count="${post.likes || 0}">
            <span>♥</span>
            <span>${post.likes || 0}</span>
          </button>

          <button class="pill action-chip" data-comment="${post.id}">
            <span>◇</span>
            <span>Comment</span>
          </button>
        </div>
      `;

      list.appendChild(card);
    });
  };

  const loadPosts = async () => {
    const { data, error } = await Astrio.sb
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      list.innerHTML = `<div class="card">Could not load feed.</div>`;
      console.error(error);
      return;
    }

    render(data || []);
  };

  const handleAction = async (event) => {
    const likeBtn = event.target.closest("[data-like]");
    const commentBtn = event.target.closest("[data-comment]");
    const shareBtn = event.target.closest("[data-share]");

    if (likeBtn) {
      const postId = likeBtn.dataset.like;
      const currentCount = Number(likeBtn.dataset.count || 0) + 1;

      await Astrio.sb.from("posts").update({ likes: currentCount }).eq("id", postId);
      likeBtn.dataset.count = String(currentCount);
      likeBtn.querySelector("span:last-child").textContent = String(currentCount);
      return;
    }

    if (commentBtn) {
      const postId = commentBtn.dataset.comment;
      const text = prompt("Comment");
      if (!text) return;

      await Astrio.sb.from("comments").insert({
        post_id: postId,
        user_id: Astrio.state.user.id,
        author_name: Astrio.userName(),
        body: text
      });
      return;
    }

    if (shareBtn) {
      const postId = shareBtn.dataset.share;
      const link = `${location.origin}${location.pathname}#feed?post=${postId}`;
      try {
        await navigator.clipboard.writeText(link);
        alert("Link copied");
      } catch {
        alert(link);
      }
    }
  };

  if (Astrio.channels.feed) {
    Astrio.channels.feed.unsubscribe();
  }

  Astrio.channels.feed = Astrio.sb
    .channel("astrio-posts-feed")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "posts" },
      () => loadPosts()
    )
    .subscribe();

  list.addEventListener("click", handleAction);

  await loadPosts();
});
