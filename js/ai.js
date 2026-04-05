window.Astrio = window.Astrio || {};

Astrio.registerPage("ai", async () => {
  const promptInput = document.getElementById("ai-prompt");
  const captionBtn = document.getElementById("ai-caption-btn");
  const hashtagBtn = document.getElementById("ai-hashtag-btn");
  const ideaBtn = document.getElementById("ai-idea-btn");
  const output = document.getElementById("ai-output");

  const captions = [
    "Neon nights and future lights.",
    "Built in the glow of tomorrow.",
    "Short reels, big energy.",
    "A new world in motion."
  ];

  const hashtags = [
    "#Astrio",
    "#NeonFeed",
    "#CreatorMode",
    "#FutureSocial",
    "#Reels"
  ];

  const ideas = [
    "Make a 12-second reel with a hard beat drop and a glowing city backdrop.",
    "Turn a simple selfie video into a cinematic cyber clip with motion zooms.",
    "Create an anime-style intro clip with a futuristic title reveal.",
    "Cut a music snippet into a looping visual post with pulsing effects."
  ];

  const render = (title, items) => {
    if (!output) return;

    output.innerHTML = `
      <div class="card column">
        <div class="page-title">${title}</div>
        <div class="grid">
          ${items
            .map(
              (item) => `
                <button class="btn btn-ghost ai-copy" data-copy="${item}">${item}</button>
              `
            )
            .join("")}
        </div>
      </div>
    `;
  };

  const copyHandlers = () => {
    document.querySelectorAll(".ai-copy").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const text = btn.dataset.copy || "";
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = "Copied";
          setTimeout(() => {
            btn.textContent = text;
          }, 900);
        } catch {
          alert(text);
        }
      });
    });
  };

  captionBtn?.addEventListener("click", () => {
    const base = promptInput?.value?.trim() || "";
    const items = captions.map((c) => (base ? `${c} ${base}` : c));
    render("Captions", items);
    copyHandlers();
  });

  hashtagBtn?.addEventListener("click", () => {
    const base = promptInput?.value?.trim() || "";
    const items = base
      ? hashtags.map((tag) => `${tag} ${base.split(" ").slice(0, 2).join(" ")}`.trim())
      : hashtags;
    render("Hashtags", items);
    copyHandlers();
  });

  ideaBtn?.addEventListener("click", () => {
    render("Ideas", ideas);
    copyHandlers();
  });

  if (output) {
    output.innerHTML = `
      <div class="card">
        <div class="page-title">AI Studio</div>
        <div class="small-note">Type a prompt, then generate captions, hashtags, or content ideas.</div>
      </div>
    `;
  }
});
