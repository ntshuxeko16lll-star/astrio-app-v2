/* ==========================
   ASTRIO FEED.JS
   Handles vertical scrolling feed, Reels, likes/comments, AI content
========================== */

async function initFeed() {
  const feedContainer = document.getElementById("feed-container");
  if (!feedContainer) return;

  feedContainer.innerHTML = "<p class='neon-text'>Loading feed...</p>";

  // 1️⃣ Fetch initial posts from Supabase
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    feedContainer.innerHTML = "<p class='neon-text'>Failed to load feed</p>";
    return;
  }

  // 2️⃣ Render posts
  posts.forEach(post => {
    const postCard = document.createElement("div");
    postCard.className = "post-card neon-glow";

    postCard.innerHTML = `
      <div class="post-header">
        <span class="username">${post.user}</span>
        <span class="time">${new Date(post.created_at).toLocaleString()}</span>
      </div>
      <div class="post-media">
        ${post.type === "video" ? `<video src="${post.url}" controls></video>` : `<img src="${post.url}" alt="post"/>`}
      </div>
      <div class="post-caption">
        <p>${post.caption}</p>
      </div>
      <div class="post-actions">
        <button onclick="likePost('${post.id}')">❤️ ${post.likes || 0}</button>
        <button onclick="commentPost('${post.id}')">💬</button>
        <button onclick="sharePost('${post.id}')">🔗</button>
      </div>
    `;
    feedContainer.appendChild(postCard);
  });

  // 3️⃣ Listen for new posts in realtime
  supabase
    .channel("public:posts")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "posts" },
      payload => {
        const post = payload.new;
        const postCard = document.createElement("div");
        postCard.className = "post-card neon-glow";

        postCard.innerHTML = `
          <div class="post-header">
            <span class="username">${post.user}</span>
            <span class="time">${new Date(post.created_at).toLocaleString()}</span>
          </div>
          <div class="post-media">
            ${post.type === "video" ? `<video src="${post.url}" controls></video>` : `<img src="${post.url}" alt="post"/>`}
          </div>
          <div class="post-caption">
            <p>${post.caption}</p>
          </div>
          <div class="post-actions">
            <button onclick="likePost('${post.id}')">❤️ ${post.likes || 0}</button>
            <button onclick="commentPost('${post.id}')">💬</button>
            <button onclick="sharePost('${post.id}')">🔗</button>
          </div>
        `;
        feedContainer.prepend(postCard);
      }
    )
    .subscribe();
}

// 4️⃣ Post Actions
async function likePost(postId) {
  const { data, error } = await supabase.rpc("like_post", { pid: postId });
  if (error) console.error("Like error:", error);
}

function commentPost(postId) {
  const comment = prompt("Add a comment:");
  if (!comment) return;

  supabase
    .from("comments")
    .insert([{ post_id: postId, comment, user: supabase.auth.user()?.email }])
    .then(({ error }) => {
      if (error) console.error("Comment error:", error);
    });
}

function sharePost(postId) {
  alert(`Post ${postId} shared!`);
                  }
