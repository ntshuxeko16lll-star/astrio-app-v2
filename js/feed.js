// js/feed.js
// Handles fetching, displaying, and updating posts in the feed

// Reference to feed container
const feedContainer = document.getElementById("feed");

// Initialize Supabase client (reuse from app.js)
const supabaseUrl = "https://llooewepqlkcpqzmiuzo.supabase.co";
const supabaseKey = "sb_publishable_vYhWHzf0GkDxch6hp9QmAA_kXkJEu6C";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ----------------------
// Fetch Posts
// ----------------------
async function fetchPosts() {
    try {
        const { data, error } = await supabase
            .from("posts")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching posts:", error.message);
            return;
        }

        renderPosts(data);
    } catch (err) {
        console.error("Unexpected error fetching posts:", err);
    }
}

// ----------------------
// Render Posts
// ----------------------
function renderPosts(posts) {
    if (!feedContainer) return;

    feedContainer.innerHTML = ""; // Clear feed

    posts.forEach((post) => {
        const postEl = document.createElement("div");
        postEl.className = "post-card fade-in";

        let mediaContent = "";
        if (post.type === "video") {
            mediaContent = `<video src="${post.media_url}" controls></video>`;
        } else if (post.type === "image") {
            mediaContent = `<img src="${post.media_url}" alt="Post Image">`;
        }

        postEl.innerHTML = `
            <div class="post-header flex justify-between items-center mb-2">
                <div class="post-user font-bold neon-text">${post.username}</div>
                <div class="post-time text-sm text-gray-400">${new Date(post.created_at).toLocaleString()}</div>
            </div>
            <div class="post-caption mb-2">${post.caption || ""}</div>
            <div class="post-media">${mediaContent}</div>
        `;

        feedContainer.appendChild(postEl);
    });
}

// ----------------------
// Real-time Updates
// ----------------------
function subscribeToFeed() {
    supabase
        .channel("public:posts")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "posts" },
            (payload) => {
                console.log("Realtime change:", payload);
                fetchPosts(); // Re-fetch posts on any change
            }
        )
        .subscribe();
}

// ----------------------
// Initialize Feed
// ----------------------
async function initFeed() {
    await fetchPosts();
    subscribeToFeed();
}

// Run feed initialization
initFeed();          
