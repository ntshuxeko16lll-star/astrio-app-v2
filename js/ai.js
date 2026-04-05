// js/ai.js
// Handles AI-powered suggestions, caption/hashtag recommendations, and media generation

// Initialize Supabase client (reuse from app.js)
const supabaseUrl = "https://llooewepqlkcpqzmiuzo.supabase.co";
const supabaseKey = "sb_publishable_vYhWHzf0GkDxch6hp9QmAA_kXkJEu6C";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ----------------------
// Elements
// ----------------------
const aiBtn = document.getElementById("ai-btn");
const aiOverlay = document.createElement("div");
aiOverlay.className = "ai-overlay fixed top-0 left-0 w-full h-full bg-black/80 backdrop-blur-md hidden z-50 p-4 overflow-y-auto";
document.body.appendChild(aiOverlay);

// Close button
const closeBtn = document.createElement("button");
closeBtn.innerText = "Close AI";
closeBtn.className = "bg-primary-color text-black px-4 py-2 rounded mb-4";
aiOverlay.appendChild(closeBtn);

closeBtn.addEventListener("click", () => {
  aiOverlay.classList.add("hidden");
});

// ----------------------
// AI Button click
// ----------------------
aiBtn.addEventListener("click", () => {
  aiOverlay.classList.remove("hidden");
  loadAISuggestions();
});

// ----------------------
// Load AI Suggestions
// ----------------------
async function loadAISuggestions() {
  aiOverlay.innerHTML = "<p class='text-white'>Generating AI suggestions...</p>";

  try {
    // Example: Caption & hashtag suggestions (can integrate OpenAI / local model later)
    const captions = [
      "Feeling cosmic today!",
      "Exploring neon dreams 🌌",
      "AI + creativity = endless possibilities",
      "Cyberpunk vibes in motion"
    ];

    const hashtags = ["#AstrioV2", "#AI", "#NeonFeed", "#FutureSocial"];

    aiOverlay.innerHTML = `
      <h2 class="text-2xl neon-text mb-4">AI Suggestions</h2>
      <div class="mb-4">
        <h3 class="text-lg mb-2">Captions</h3>
        ${captions.map(c => `<button class="ai-suggestion bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded m-1">${c}</button>`).join("")}
      </div>
      <div class="mb-4">
        <h3 class="text-lg mb-2">Hashtags</h3>
        ${hashtags.map(h => `<button class="ai-suggestion bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded m-1">${h}</button>`).join("")}
      </div>
      <div>
        <h3 class="text-lg mb-2">AI Media Generation</h3>
        <p class="text-gray-300">Click below to generate AI images or videos (placeholder)</p>
        <button id="generate-ai-media" class="bg-primary-color px-4 py-2 rounded mt-2">Generate AI Media</button>
      </div>
    `;

    // Event listener for AI media generation
    document.getElementById("generate-ai-media").addEventListener("click", async () => {
      aiOverlay.innerHTML += "<p class='text-white mt-2'>Generating AI media... (this is a placeholder)</p>";
      // Integrate RunwayML / Stable Diffusion API here
    });

    // Click to copy caption/hashtag
    document.querySelectorAll(".ai-suggestion").forEach(btn => {
      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(btn.innerText);
        btn.innerText = "Copied!";
        setTimeout(() => btn.innerText = btn.innerText, 1000);
      });
    });

  } catch (err) {
    aiOverlay.innerHTML = `<p class="text-red-500">Error generating AI suggestions: ${err.message}</p>`;
  }
}

// ----------------------
// Optional: Function to save AI-generated post
// ----------------------
async function saveAIPost(username, caption, media_url, type) {
  const { data, error } = await supabase
    .from("posts")
    .insert([{ username, caption, media_url, type }]);

  if (error) console.error("Error saving AI post:", error);
  else console.log("AI post saved:", data);
         }
 
