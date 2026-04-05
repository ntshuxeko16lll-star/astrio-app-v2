
/* ==========================
   ASTRIO MEDIA TOOLS
   Handles video/audio uploads, filters, green screen, AI music
========================== */

const uploadInput = document.getElementById("media-upload");
const uploadBtn = document.getElementById("media-upload-btn");
const mediaPreview = document.getElementById("media-preview");
const applyFilterBtn = document.getElementById("apply-filter-btn");
const generateMusicBtn = document.getElementById("generate-music-btn");

// 1️⃣ Upload video/audio to Supabase Storage
async function uploadMedia() {
  const file = uploadInput.files[0];
  if (!file) return alert("Select a file to upload");

  const user = supabase.auth.user();
  if (!user) return alert("You must be logged in");

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}_${Date.now()}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("media")
    .upload(filePath, file);

  if (error) {
    console.error("Upload error:", error);
    return alert("Failed to upload media");
  }

  const url = supabase.storage.from("media").getPublicUrl(filePath).publicURL;
  mediaPreview.src = url;
  mediaPreview.style.display = "block";
  alert("Upload successful!");
}

// 2️⃣ Apply simple Canvas filters (green screen, glitch, neon glow)
function applyFilter(filterType) {
  if (!mediaPreview) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = mediaPreview.videoWidth || mediaPreview.width;
  canvas.height = mediaPreview.videoHeight || mediaPreview.height;

  ctx.drawImage(mediaPreview, 0, 0, canvas.width, canvas.height);

  if (filterType === "neon") {
    ctx.globalCompositeOperation = "lighter";
    ctx.filter = "brightness(1.5) contrast(1.3) saturate(2)";
    ctx.drawImage(mediaPreview, 0, 0, canvas.width, canvas.height);
  }

  if (filterType === "greenscreen") {
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < frame.data.length; i += 4) {
      const r = frame.data[i], g = frame.data[i + 1], b = frame.data[i + 2];
      if (g > 100 && g > r + 20 && g > b + 20) { // simple green detection
        frame.data[i + 3] = 0; // make transparent
      }
    }
    ctx.putImageData(frame, 0, 0);
  }

  mediaPreview.src = canvas.toDataURL();
}

// 3️⃣ Generate AI music (Magenta.js / Tone.js)
async function generateMusic() {
  if (!window.mm) {
    alert("Magenta.js not loaded!");
    return;
  }

  const rnn = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');
  await rnn.initialize();

  const seed = { notes: [{ pitch: 60, startTime: 0, endTime: 0.5 }] };
  const result = await rnn.continueSequence(seed, 32, 1.0);

  const player = new mm.Player();
  player.start(result);
}

// 4️⃣ Event listeners
if (uploadBtn) uploadBtn.addEventListener("click", uploadMedia);
if (applyFilterBtn) applyFilterBtn.addEventListener("click", () => applyFilter("neon"));
if (generateMusicBtn) generateMusicBtn.addEventListener("click", generateMusic);
