window.Astrio = window.Astrio || {};

Astrio.registerPage("auth", async () => {
  const loginPanel = document.getElementById("login-panel");
  const signupPanel = document.getElementById("signup-panel");
  const goSignup = document.getElementById("go-signup");
  const goLogin = document.getElementById("go-login");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const message = document.getElementById("auth-message");

  const showMessage = (text, good = true) => {
    if (!message) return;
    message.textContent = text;
    message.style.color = good ? "var(--cyan)" : "#ff8e8e";
  };

  const showLogin = () => {
    loginPanel?.classList.remove("hidden");
    signupPanel?.classList.add("hidden");
    showMessage("");
  };

  const showSignup = () => {
    signupPanel?.classList.remove("hidden");
    loginPanel?.classList.add("hidden");
    showMessage("");
  };

  goSignup?.addEventListener("click", showSignup);
  goLogin?.addEventListener("click", showLogin);

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    const { data, error } = await Astrio.sb.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      showMessage(error.message, false);
      return;
    }

    if (data?.user) {
      await Astrio.loadUser();
      Astrio.go("feed");
    }
  });

  signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("signup-username").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;

    const { data, error } = await Astrio.sb.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) {
      showMessage(error.message, false);
      return;
    }

    if (data?.user) {
      await Astrio.sb.from("profiles").upsert({
        id: data.user.id,
        username,
        bio: "",
        avatar_url: "",
        updated_at: new Date().toISOString()
      });
    }

    if (data?.session) {
      await Astrio.loadUser();
      Astrio.go("feed");
      return;
    }

    showMessage("Account created. Check email verification if it is enabled.", true);
    showLogin();
  });

  showLogin();
});
