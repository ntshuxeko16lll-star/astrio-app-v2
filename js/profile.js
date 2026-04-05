window.Astrio = window.Astrio || {};

Astrio.registerPage("profile", async () => {
  const avatar = document.getElementById("profile-avatar");
  const nameInput = document.getElementById("profile-username");
  const bioInput = document.getElementById("profile-bio");
  const avatarInput = document.getElementById("profile-avatar-input");
  const emailLine = document.getElementById("profile-email");
  const postsCount = document.getElementById("profile-posts");
  const followersCount = document.getElementById("profile-followers");
  const followingCount = document.getElementById("profile-following");
  const saveBtn = document.getElementById("profile-save-btn");
  const status = document.getElementById("profile-status");

  const showStatus = (text, good = true) => {
    if (!status) return;
    status.textContent = text;
    status.style.color = good ? "var(--cyan)" : "#ff8e8e";
  };

  const loadProfile = async () => {
    const user = Astrio.state.user;
    if (!user) return;

    if (emailLine) emailLine.textContent = user.email;

    const { data: profile } = await Astrio.sb
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      await Astrio.sb.from("profiles").upsert({
        id: user.id,
        username: Astrio.userName(),
        bio: "",
        avatar_url: "",
        updated_at: new Date().toISOString()
      });
    }

    const { data: fresh } = await Astrio.sb
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const current = fresh || profile;

    if (current) {
      Astrio.state.profile = current;
      if (nameInput) nameInput.value = current.username || Astrio.userName();
      if (bioInput) bioInput.value = current.bio || "";
      if (avatar && current.avatar_url) avatar.src = current.avatar_url;
    }

    const { count: postCount } = await Astrio.sb
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { count: followerCount } = await Astrio.sb
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", user.id);

    const { count: followingCountValue } = await Astrio.sb
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", user.id);

    if (postsCount) postsCount.textContent = String(postCount || 0);
    if (followersCount) followersCount.textContent = String(followerCount || 0);
    if (followingCount) followingCount.textContent = String(followingCountValue || 0);
  };

  saveBtn?.addEventListener("click", async () => {
    const user = Astrio.state.user;
    if (!user) return;

    let avatarUrl = Astrio.avatarUrl();

    if (avatarInput?.value?.trim()) {
      avatarUrl = avatarInput.value.trim();
    }

    const username = nameInput?.value?.trim() || Astrio.userName();
    const bio = bioInput?.value?.trim() || "";

    const { error: authError } = await Astrio.sb.auth.updateUser({
      data: {
        username,
        avatar_url: avatarUrl
      }
    });

    if (authError) {
      showStatus(authError.message, false);
      return;
    }

    const { error } = await Astrio.sb.from("profiles").upsert({
      id: user.id,
      username,
      bio,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    });

    if (error) {
      showStatus(error.message, false);
      return;
    }

    if (avatar && avatarUrl) avatar.src = avatarUrl;
    Astrio.state.profile = {
      ...(Astrio.state.profile || {}),
      username,
      bio,
      avatar_url: avatarUrl
    };

    showStatus("Saved");
  });

  await loadProfile();
});
