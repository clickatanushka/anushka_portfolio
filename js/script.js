const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id]");
const revealItems = document.querySelectorAll(".reveal");

function setActiveNav() {
  const offset = window.scrollY + 140;
  let currentId = "";

  sections.forEach((section) => {
    if (offset >= section.offsetTop) {
      currentId = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.2
  }
);

revealItems.forEach((item) => revealObserver.observe(item));
setActiveNav();

window.addEventListener("scroll", setActiveNav);

/* --- Mini-game: Bubble Pop (floating widget) --- */
(function initBubbleGame() {
  const widget = document.getElementById("bubble-game-widget");
  const toggle = document.getElementById("bubble-game-toggle");
  const panel = document.getElementById("bubble-game-panel");
  const playfield = document.getElementById("bubble-playfield");
  const scoreEl = document.getElementById("bubble-score");
  const restartBtn = document.getElementById("bubble-restart");

  if (!widget || !toggle || !panel || !playfield || !scoreEl || !restartBtn) return;

  const MAX_BUBBLES = 6;
  const SPAWN_MIN = 750;
  const SPAWN_MAX = 1300;
  const BUBBLE_LIFETIME_MS = 5200;

  let score = 0;
  let spawnTimer = null;
  let running = false;

  const gradients = [
    "linear-gradient(145deg, #ff8fc9, #ff6eb4)",
    "linear-gradient(145deg, #c4a8ff, #9b8cff)",
    "linear-gradient(145deg, #ffd4a8, #ffb8c8)",
    "linear-gradient(145deg, #a8e6ff, #c9b5ff)",
    "linear-gradient(145deg, #ffb8e8, #b8d4ff)"
  ];

  function setScore(next) {
    score = next;
    scoreEl.textContent = String(score);
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function clearSpawnTimer() {
    if (spawnTimer) {
      clearTimeout(spawnTimer);
      spawnTimer = null;
    }
  }

  function scheduleSpawn() {
    clearSpawnTimer();
    spawnTimer = window.setTimeout(() => {
      if (!running) return;
      trySpawnBubble();
      scheduleSpawn();
    }, randomBetween(SPAWN_MIN, SPAWN_MAX));
  }

  function trySpawnBubble() {
    const bubbles = playfield.querySelectorAll(".bubble-game__bubble:not(.is-popping)");
    if (bubbles.length >= MAX_BUBBLES) return;

    const bubble = document.createElement("button");
    bubble.type = "button";
    bubble.className = "bubble-game__bubble";
    bubble.setAttribute("aria-label", "Pop bubble");

    const size = randomBetween(38, 58);
    const leftPct = randomBetween(4, 92 - (size / playfield.clientWidth) * 100);
    const topPct = randomBetween(4, 88 - (size / playfield.clientHeight) * 100);

    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.max(0, leftPct)}%`;
    bubble.style.top = `${Math.max(0, topPct)}%`;
    bubble.style.background = gradients[Math.floor(Math.random() * gradients.length)];

    const life = window.setTimeout(() => {
      if (bubble.isConnected && !bubble.classList.contains("is-popping")) {
        bubble.style.opacity = "0";
        bubble.style.transition = "opacity 0.4s ease";
        window.setTimeout(() => bubble.remove(), 400);
      }
    }, BUBBLE_LIFETIME_MS);

    bubble.addEventListener("click", (e) => {
      e.stopPropagation();
      window.clearTimeout(life);
      if (bubble.classList.contains("is-popping")) return;
      bubble.classList.add("is-popping");
      setScore(score + 1);
      window.setTimeout(() => bubble.remove(), 320);
    });

    playfield.appendChild(bubble);
  }

  function clearPlayfield() {
    playfield.innerHTML = "";
  }

  function startGame() {
    running = true;
    clearSpawnTimer();
    scheduleSpawn();
    for (let i = 0; i < 3; i += 1) {
      window.setTimeout(() => trySpawnBubble(), i * 120);
    }
  }

  function stopGame() {
    running = false;
    clearSpawnTimer();
    clearPlayfield();
  }

  function setOpen(open) {
    widget.classList.toggle("bubble-game-widget--open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    panel.hidden = !open;
    if (open) {
      setScore(0);
      startGame();
    } else {
      stopGame();
    }
  }

  toggle.addEventListener("click", () => {
    setOpen(!widget.classList.contains("bubble-game-widget--open"));
  });

  restartBtn.addEventListener("click", () => {
    if (!widget.classList.contains("bubble-game-widget--open")) return;
    setScore(0);
    clearPlayfield();
    startGame();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && widget.classList.contains("bubble-game-widget--open")) {
      setOpen(false);
    }
  });
})();
