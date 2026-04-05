window.Astrio = window.Astrio || {};

Astrio.registerPage("create", async () => {
  const fileInput = document.getElementById("media-file");
  const captionInput = document.getElementById("create-caption");
  const typeSelect = document.getElementById("post-type");
  const preview = document.getElementById("media-preview");
  const postBtn = document.getElementById("create-post-btn");
  const status = document.getElementById("create-status");
  const filterNeon = document.getElementById("filter-neon");
  const filterMono = document.getElementById("filter-monochrome");
  const filterClear = document.getElementById("filter-clear");

  let selectedFilter = "clear";

  const showStatus = (text, good = true) => {
    if (!status) return;
    status.textContent = text;
    status.style.color = good ? "var(--cyan)" : "#ff8e8e";
  };

  const renderPreview = (file) => {
    if (!preview || !file) return;

    const url = URL.createObjectURL(file);
    preview.innerHTML = "";

    if (file.type.startsWith("video/")) {
      preview.innerHTML = `<video src="${url}" controls playsinline></video>`;
    } else if (file.type.startsWith("image/")) {
      preview.innerHTML = `<img src="${url}" alt="preview">`;
    } else {
      preview.innerHTML = `<div class="card">Audio file selected: ${file.name}</div>`;
    }
  };

  const applyFilterClass = () => {
    const media = preview?.querySelector("img,video");
    if (!media) return;
    media.classList.remove("filter-neon", "filter-mono");

    if (selectedFilter === "neon") media.classList.add("filter-neon");
    if (selectedFilter === "mono") media.classList.add("filter-mono");
  };

  fileInput?.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (file) {
      renderPreview(file);
      applyFilterClass();
    }
  });

  filterNeon?.addEventListener("click", () => {
    selectedFilter = "neon";
    applyFilterClass();
  });

  filterMono?.addEventListener("click", () => {
    selectedFilter = "mono";
    applyFilterClass();
  });

  filterClear?.addEventListener("click", () => {
    selectedFilter = "clear";
    applyFilterClass();
  });

  const createPost = async () => {
    const user = Astrio.state.user;
    if (!user) {
      showStatus("Login first", false);
      Astrio.go("auth");
      return;
    }

    const caption = captionInput?.value?.trim() || "";
    const file = fileInput?.files?.[0] || null;
    const postType = typeSelect?.value || (file?.type?.startsWith("video/") ? "video" : file?.type?.startsWith("image/") ? "image" : "text");

    let mediaUrl = "";

    if (file) {
      const safeName = `${user.id}/${Date.now()}-${file.name}`.replace(/\s+/g, "-");
      const { error: uploadError } = await Astrio.sb.storage
        .from("media")
        .upload(safeName, file, { upsert: true });

      if (uploadError) {
        showStatus(uploadError.message, false);
        return;
      }

      const { data: publicUrl } = Astrio.sb.storage
        .from("media")
        .getPublicUrl(safeName);

      mediaUrl = publicUrl?.publicUrl || "";
    }

    const { error } = await Astrio.sb.from("posts").insert({
      user_id: user.id,
      author_name: Astrio.userName(),
      author_avatar: Astrio.avatarUrl(),
      type: postType,
      caption,
      media_url: mediaUrl,
      likes: 0
    });

    if (error) {
      showStatus(error.message, false);
      return;
    }

    if (captionInput) captionInput.value = "";
    if (fileInput) fileInput.value = "";
    if (preview) preview.innerHTML = "";
    showStatus("Posted");
    Astrio.go("feed");
  };

  postBtn?.addEventListener("click", createPost);
});
