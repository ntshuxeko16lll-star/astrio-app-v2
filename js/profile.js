/* ==========================
   ASTRIO PROFILE.JS
   Handles user profile, posts, followers
========================== */

const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const profileAvatar = document.getElementById("profile-avatar");
const profileStats = document.getElementById("profile-stats");
const editProfileBtn = document.getElementById("edit-profile-btn");

// 1️⃣ Load user profile
async function loadProfile() {
  const user = supabase.auth.user();
  if (!user) return;

  profileName.textContent = user.user_metadata?.full_name || user.email.split("@")[0];
  profileEmail.textContent = user.email;
  profileAvatar.src = user.user_metadata?.avatar_url || "assets/icons/default-avatar.png";

  // Load stats
  const { data: posts, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id);

  const { data: followers, error: followersError } = await supabase
    .from("followers")
    .select("*")
    .eq("followed_id", user.id);

  const { data: following, error: followingError } = await supabase
    .from("followers")
    .select("*")
    .eq("follower_id", user.id);

  if (postError || followersError || followingError) console.error("Error loading stats", postError, followersError, followingError);

  profileStats.innerHTML = `
    <div class="stat-item"><strong>${posts?.length || 0}</strong><span>Posts</span></div>
    <div class="stat-item"><strong>${followers?.length || 0}</strong><span>Followers</span></div>
    <div class="stat-item"><strong>${following?.length || 0}</strong><span>Following</span></div>
  `;
}

// 2️⃣ Edit profile
async function editProfile({ name, avatarUrl }) {
  const user = supabase.auth.user();
  if (!user) return;

  const updates = {
    full_name: name,
    avatar_url: avatarUrl,
    updated_at: new Date()
  };

  const { error } = await supabase.auth.update({ data: updates });
  if (error) {
    console.error("Error updating profile:", error);
    return;
  }

  loadProfile(); // Refresh profile UI
}

// 3️⃣ Event listener for edit button
if (editProfileBtn) editProfileBtn.addEventListener("click", () => {
  const newName = prompt("Enter new display name:", profileName.textContent);
  const newAvatar = prompt("Enter avatar URL:", profileAvatar.src);
  if (newName || newAvatar) editProfile({ name: newName, avatarUrl: newAvatar });
});

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", loadProfile);
