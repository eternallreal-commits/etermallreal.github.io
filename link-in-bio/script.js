const themeToggle = document.querySelector(".theme-toggle");
const stored = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
  }
}

applyTheme(stored || (prefersDark ? "dark" : "light"));

const bgVideo = document.querySelector(".bg-video__media");

function startBackgroundVideo() {
  if (!bgVideo) return;

  bgVideo.muted = true;
  bgVideo.defaultMuted = true;
  bgVideo.setAttribute("muted", "");
  bgVideo.setAttribute("playsinline", "");
  bgVideo.setAttribute("webkit-playsinline", "");

  const markReady = () => document.body.classList.add("has-video");

  bgVideo.addEventListener("loadeddata", markReady, { once: true });
  bgVideo.addEventListener("playing", markReady, { once: true });

  bgVideo.play()
    .then(markReady)
    .catch(() => {
      document.addEventListener("click", () => {
        bgVideo.play().then(markReady).catch(() => {});
      }, { once: true });
    });
}

startBackgroundVideo();

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
  applyTheme(next);
  localStorage.setItem("theme", next);
});

document.querySelectorAll(".music-accordion").forEach((accordion) => {
  const toggle = accordion.querySelector(".music-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const isOpen = accordion.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
});

let currentAudio = null;
let currentTrack = null;

document.querySelectorAll(".track-item--audio").forEach((track) => {
  const playBtn = track.querySelector(".track-play");
  const audio = track.querySelector("audio");
  if (!playBtn || !audio) return;

  playBtn.addEventListener("click", () => {
    const isSameTrack = currentTrack === track;

    if (currentAudio && currentTrack && !isSameTrack) {
      currentAudio.pause();
      currentTrack.classList.remove("is-playing");
      playBtn.setAttribute("aria-label", `Воспроизвести ${track.querySelector(".track-name")?.textContent || "трек"}`);
    }

    if (isSameTrack && !audio.paused) {
      audio.pause();
      track.classList.remove("is-playing");
      currentAudio = null;
      currentTrack = null;
      playBtn.setAttribute("aria-label", `Воспроизвести ${track.querySelector(".track-name")?.textContent || "трек"}`);
      return;
    }

    audio.play().catch(() => {});
    track.classList.add("is-playing");
    currentAudio = audio;
    currentTrack = track;
    playBtn.setAttribute("aria-label", `Пауза: ${track.querySelector(".track-name")?.textContent || "трек"}`);
  });

  audio.addEventListener("ended", () => {
    track.classList.remove("is-playing");
    if (currentTrack === track) {
      currentAudio = null;
      currentTrack = null;
    }
    playBtn.setAttribute("aria-label", `Воспроизвести ${track.querySelector(".track-name")?.textContent || "трек"}`);
  });
});

document.querySelectorAll(".link-card[href], .project-card a").forEach((el) => {
  el.addEventListener("click", (e) => {
    if (el.getAttribute("href") === "#") {
      e.preventDefault();
    }
  });
});

const plural = (n, forms) => {
  const a = n % 10;
  const b = n % 100;
  if (a === 1 && b !== 11) return forms[0];
  if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return forms[1];
  return forms[2];
};

document.querySelectorAll("[data-release-date]").forEach((el) => {
  const [y, m, d] = el.dataset.releaseDate.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((target - today) / 86400000);

  if (days > 1) {
    el.textContent = `Через ${days} ${plural(days, ["день", "дня", "дней"])}`;
  } else if (days === 1) {
    el.textContent = "Завтра";
  } else if (days === 0) {
    el.textContent = "Сегодня";
  } else {
    el.textContent = "Уже вышел";
  }
});

/* ---------- Форма «Написать мне» ---------- */

// Сообщения уходят через сервис Web3Forms прямо с сайта, без почтового приложения.
// Получи бесплатный ключ на https://web3forms.com (нужно только указать свою почту)
// и вставь его сюда между кавычками.
const WEB3FORMS_KEY = "fc3ea388-277c-4dab-ac46-08b6cdb087e8";


const contactPage = document.getElementById("contact-page");
const contactBtn = document.querySelector(".contact-btn");
const contactBack = document.querySelector(".contact-back");
const contactForm = document.querySelector(".contact-form");
const contactStatus = document.querySelector(".contact-status");

if (contactPage && contactBtn && contactForm) {
  let openedByClick = false;
  let lastFocus = null;

  const setOpen = (open) => {
    if (contactPage.classList.contains("is-open") === open) return;

    contactPage.classList.toggle("is-open", open);
    contactPage.setAttribute("aria-hidden", String(!open));
    contactPage.inert = !open;
    document.body.style.overflow = open ? "hidden" : "";

    if (open) {
      lastFocus = document.activeElement;
      setTimeout(() => contactForm.querySelector("input")?.focus({ preventScroll: true }), 450);
    } else if (lastFocus) {
      lastFocus.focus({ preventScroll: true });
    }
  };

  const syncWithHash = () => setOpen(location.hash === "#write");

  const openContact = () => {
    openedByClick = true;
    location.hash = "write";
  };

  const closeContact = () => {
    if (openedByClick && history.length > 1) {
      history.back();
    } else {
      history.replaceState(null, "", location.pathname + location.search);
      syncWithHash();
    }
    openedByClick = false;
  };

  contactBtn.addEventListener("click", openContact);
  contactBack.addEventListener("click", closeContact);
  window.addEventListener("hashchange", syncWithHash);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && contactPage.classList.contains("is-open")) closeContact();
  });
  syncWithHash();

  const setStatus = (text, type = "") => {
    contactStatus.textContent = text;
    contactStatus.className = "contact-status" + (type ? ` is-${type}` : "");
  };

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();
    const contact = String(data.get("contact") || "").trim();
    const message = String(data.get("message") || "").trim();

    contactForm.querySelectorAll(".field-input").forEach((el) => el.classList.remove("is-invalid"));

    if (!contact || !message) {
      if (!contact) contactForm.elements.contact.classList.add("is-invalid");
      if (!message) contactForm.elements.message.classList.add("is-invalid");
      setStatus("Заполни контакт и сообщение.", "error");
      return;
    }

    // Ловушка для ботов: настоящий человек это поле не видит
    if (data.get("_gotcha")) {
      setStatus("Спасибо! Сообщение отправлено ✓", "success");
      contactForm.reset();
      return;
    }

    const submitBtn = contactForm.querySelector(".contact-submit");

    if (!WEB3FORMS_KEY) {
      setStatus("Форма ещё не подключена. Напиши мне в Telegram: @eternalLforeal", "error");
      return;
    }

    submitBtn.disabled = true;
    setStatus("Отправляю…");

    try {
      const payload = {
        access_key: WEB3FORMS_KEY,
        subject: "Сообщение с сайта eternalL",
        from_name: name || "Посетитель сайта",
        name: name || "—",
        contact,
        message: `${message}\n\nКонтакт для связи: ${contact}`,
      };
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) payload.email = contact;

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.success) throw new Error("bad response");
      setStatus("Спасибо! Сообщение отправлено ✓", "success");
      contactForm.reset();
    } catch {
      setStatus("Не получилось отправить. Попробуй ещё раз или напиши в Telegram: @eternalLforeal", "error");
    } finally {
      submitBtn.disabled = false;
    }
  });
}
