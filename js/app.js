document.addEventListener("DOMContentLoaded", () => {

    const navButtons = document.querySelectorAll(".nav-btn");

    const pages = [
        "pages/feed.html",
        "pages/market.html",
        "pages/create.html",
        "pages/chat.html",
        "pages/profile.html"
    ];

    navButtons.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            window.location.href = pages[index];
        });
    });

});window.Astrio = window.Astrio || {};

(() => {
  const SUPABASE_URL = "https://llooewepqlkcpqzmiuzo.supabase.co";
  const SUPABASE_KEY = "sb_publishable_vYhWHzf0GkDxch6hp9QmAA_kXkJEu6C";

  const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  
console.log("Supabase connected:", supabase);
  
  Astrio.sb = sb;
  Astrio.state = {
    user: null,
    profile: null,
    page: "",
    roomId: null
  };
  Astrio.channels = {};
  Astrio.pageInits = {};

  Astrio.registerPage = (name, fn) => {
    Astrio.pageInits[name] = fn;
  };

  Astrio.userName = () => {
    return (
      Astrio.state.profile?.username ||
      Astrio.state.user?.user_metadata?.username ||
      Astrio.state.user?.email?.split("@")[0] ||
      "astrio"
    );
  };

  Astrio.avatarUrl = () => {
    return (
      Astrio.state.profile?.avatar_url ||
      Astrio.state.user?.user_metadata?.avatar_url ||
      ""
    );
  };

  Astrio.setActiveButtons = (page) => {
    document.querySelectorAll("[data-page]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.page === page);
    });
  };

  Astrio.loadUser = async () => {
    const { data: { session } } = await sb.auth.getSession();
    Astrio.state.user = session?.user || null;

    if (Astrio.state.user) {
      await Astrio.ensureProfile();
    }

    return Astrio.state.user;
  };

  Astrio.ensureProfile = async () => {
    if (!Astrio.state.user) return null;

    const user = Astrio.state.user;
    const username = user.user_metadata?.username || user.email.split("@")[0];

    const { data: existing, error } = await sb
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Profile read error:", error.message);
    }

    if (!existing) {
      await sb.from("profiles").upsert({
        id: user.id,
        username,
        bio: "",
        avatar_url: "",
        updated_at: new Date().toISOString()
      });
    }

    const { data: profile } = await sb
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    Astrio.state.profile = profile || {
      id: user.id,
      username,
      bio: "",
      avatar_url: ""
    };

    return Astrio.state.profile;
  };

  Astrio.loadPage = async (page) => {
    const allowed = [
      "auth",
      "feed",
      "ai",
      "notifications",
      "market",
      "create",
      "chat",
      "profile"
    ];

    if (!allowed.includes(page)) page = "feed";

    const app = document.getElementById("app");
    if (!app) return;

    const response = await fetch(`pages/${page}.html`, { cache: "no-store" });
    if (!response.ok) {
      app.innerHTML = `<section class="page-screen"><div class="card">Page not found.</div></section>`;
      return;
    }

    const html = await response.text();
    app.innerHTML = html;
    Astrio.state.page = page;
    Astrio.setActiveButtons(page);
    window.scrollTo(0, 0);

    const init = Astrio.pageInits[page];
    if (typeof init === "function") {
      await init();
    }
  };

  Astrio.go = (page) => {
    location.hash = page;
    Astrio.loadPage(page);
  };

  Astrio.logout = async () => {
    await sb.auth.signOut();
    Astrio.state.user = null;
    Astrio.state.profile = null;
    Astrio.go("auth");
  };

  Astrio.boot = async () => {
    await Astrio.loadUser();

    const hash = (location.hash || "").replace("#", "");
    const startPage = Astrio.state.user ? (hash || "feed") : "auth";

    if (!Astrio.state.user && startPage !== "auth") {
      await Astrio.loadPage("auth");
      return;
    }

    await Astrio.loadPage(startPage);
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button) return;

    event.preventDefault();

    const page = button.dataset.page;
    if (page === "auth") {
      Astrio.go("auth");
      return;
    }

    if (!Astrio.state.user) {
      Astrio.go("auth");
      return;
    }

    Astrio.go(page);
  });

  sb.auth.onAuthStateChange(async (_event, session) => {
    Astrio.state.user = session?.user || null;

    if (Astrio.state.user) {
      await Astrio.ensureProfile();
      if (Astrio.state.page === "auth") {
        Astrio.go("feed");
      }
    } else if (Astrio.state.page !== "auth") {
      Astrio.go("auth");
    }
  });

  document.addEventListener("DOMContentLoaded", Astrio.boot);
})();
document.querySelectorAll(".nav-btn").forEach((btn, index) => {
    btn.addEventListener("click", () => {
        const pages = [
            "pages/feed.html",
            "pages/market.html",
            "pages/create.html",
            "pages/chat.html",
            "pages/profile.html"
        ];

        window.location.href = pages[index];
    });
});
document.getElementById("ai-btn")?.addEventListener("click", () => {
    window.location.href = "pages/ai.html";
});

document.getElementById("notif-btn")?.addEventListener("click", () => {
    window.location.href = "pages/notifications.html";
});
