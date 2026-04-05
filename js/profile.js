// js/profile.js
// Handles user profile data, updates, and display

// Initialize Supabase (reuse credentials)
const supabaseUrl = "https://llooewepqlkcpqzmiuzo.supabase.co";
const supabaseKey = "sb_publishable_vYhWHzf0GkDxch6hp9QmAA_kXkJEu6C";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Elements
const profileAvatar = document.getElementById("profile-avatar");
const profileName = document.getElementById("profile-name");
const profileBio = document.getElementById("profile-bio");
const profileSaveBtn = document.getElementById("profile-save-btn");
const avatarInput = document.getElementById("avatar-input");

let currentUserId = "123"; // Replace with logged-in user ID

// ----------------------
// Fetch profile data
// ----------------------
async function loadProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) console.error("Error loading profile:", error);
  else {
    profileName.value = data.username || "";
    profileBio.value = data.bio || "";
    if (data.avatar_url) profileAvatar.src = data.avatar_url;
  }
}

// ----------------------
// Update profile data
// ----------------------
async function saveProfile() {
  let avatarUrl = profileAvatar.src;

  // Upload avatar if a new file is selected
  if (avatarInput.files && avatarInput.files[0]) {
    const file = avatarInput.files[0];
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(`avatars/${currentUserId}/${file.name}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) console.error("Avatar upload error:", uploadError);
    else {
      const { publicUrl } = supabase.storage
        .from("avatars")
        .getPublicUrl(uploadData.path);
      avatarUrl = publicUrl;
    }
  }

  // Update profile
  const { data, error } = await supabase.from("profiles").upsert([
    {
      id: currentUserId,
      username: profileName.value,
      bio: profileBio.value,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    },
  ]);

  if (error) console.error("Error saving profile:", error);
  else alert("Profile updated successfully!");
}

// ----------------------
// Event listeners
// ----------------------
if (profileSaveBtn) {
  profileSaveBtn.addEventListener("click", saveProfile);
}

// ----------------------
// Initial load
// ----------------------
loadProfile(currentUserId);
