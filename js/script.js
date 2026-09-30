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

const projectCards = [...document.querySelectorAll(".project-card")];
const filterButtons = document.querySelectorAll(".filter-button");
const projectSearch = document.getElementById("project-search");
const noResults = document.getElementById("no-results");

function filterProjects() {
  const activeFilter = document.querySelector(".filter-button.is-selected")?.dataset.filter ?? "all";
  const searchTerm = projectSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  projectCards.forEach((card) => {
    const matchesCategory = activeFilter === "all" || card.dataset.category === activeFilter;
    const matchesSearch = card.dataset.search.includes(searchTerm);
    const isVisible = matchesCategory && matchesSearch;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  noResults.hidden = visibleCount !== 0;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((filterButton) => {
      const isSelected = filterButton === button;
      filterButton.classList.toggle("is-selected", isSelected);
      filterButton.setAttribute("aria-pressed", String(isSelected));
    });
    filterProjects();
  });
});

projectSearch.addEventListener("input", filterProjects);

const projectDetails = {
  kernel: {
    category: "01 / SYSTEMS PROGRAMMING",
    title: "Starting from the very first byte",
    description: "A custom bootloader and kernel built to understand what happens between powering on a computer and getting to an operating system.",
    detail: "The project explores low-level startup, memory, and interrupt concepts using C and Assembly, with QEMU for testing. Open the repository to see the code and setup details.",
    repo: "https://github.com/clickatanushka/Coustum-bootloader-and-kernel-development"
  },
  xai: {
    category: "02 / EXPLAINABLE AI",
    title: "When the model shows its work",
    description: "An X-ray diagnosis project focused on looking inside model predictions, not just reporting a result.",
    detail: "Grad-CAM visual explanations help inspect which image regions influence a prediction. This is a learning project, not a diagnostic tool; see the repository for implementation and research context.",
    repo: "https://github.com/clickatanushka/XAI"
  },
  analytics: {
    category: "03 / DATA STORIES",
    title: "Finding the story in user behavior",
    description: "An exploration of user behavior data and the patterns that can reveal how people engage with a product.",
    detail: "Using Python, Pandas, and statistical exploration to move from raw activity toward interpretable engagement insights. The repository has the project materials.",
    repo: "https://github.com/clickatanushka/User-behavior-Analytics"
  }
};

const projectDialog = document.getElementById("project-dialog");
document.querySelectorAll(".notes-button").forEach((button) => {
  button.addEventListener("click", () => {
    const project = projectDetails[button.dataset.project];
    if (!project) return;
    document.getElementById("dialog-kicker").textContent = project.category;
    document.getElementById("dialog-title").textContent = project.title;
    document.getElementById("dialog-description").textContent = project.description;
    document.getElementById("dialog-detail").textContent = project.detail;
    document.getElementById("dialog-repo").href = project.repo;
    projectDialog.showModal();
  });
});

document.getElementById("play-bubbles").addEventListener("click", () => {
  const toggle = document.getElementById("bubble-game-toggle");
  if (!document.getElementById("bubble-game-widget").classList.contains("bubble-game-widget--open")) {
    toggle.click();
  }
  toggle.focus();
});

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
