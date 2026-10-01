const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id]");
const revealItems = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

setActiveNav();

window.addEventListener("scroll", setActiveNav, { passive: true });

/* --- Section connectors draw themselves when they scroll into view --- */
const sectionLinks = document.querySelectorAll(".section-link");
if ("IntersectionObserver" in window && !reducedMotion) {
  const linkObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-drawn");
          linkObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  sectionLinks.forEach((link) => linkObserver.observe(link));
} else {
  sectionLinks.forEach((link) => link.classList.add("is-drawn"));
}

/* --- Local time in the contact card --- */
(function initLocalTime() {
  const timeEl = document.getElementById("local-time");
  const moodEl = document.getElementById("local-mood");
  if (!timeEl) return;

  function tick() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
    const hour = Number(now.toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }));
    moodEl.textContent = hour < 7 || hour >= 24 ? "· probably asleep 😴" : hour < 10 ? "· probably at the gym 🏋️" : hour >= 22 ? "· probably still coding 🌙" : "· probably awake ☕";
  }

  tick();
  setInterval(tick, 30000);
})();

/* --- Projects: filters, search, show more --- */
const projectCards = [...document.querySelectorAll(".project-card")];
const filterButtons = document.querySelectorAll(".filter-button");
const projectSearch = document.getElementById("project-search");
const noResults = document.getElementById("no-results");
const showMoreButton = document.getElementById("show-more");

const INITIAL_PROJECTS = 9;
let showAllProjects = false;

const searchText = new Map(
  projectCards.map((card) => {
    const links = [...card.querySelectorAll("a")].map((link) => link.href).join(" ");
    return [card, `${card.textContent} ${links}`.toLowerCase()];
  })
);

filterButtons.forEach((button) => {
  const filter = button.dataset.filter;
  const count = filter === "all" ? projectCards.length : projectCards.filter((card) => card.dataset.category === filter).length;
  button.querySelector(".filter-count").textContent = String(count);
});

function filterProjects() {
  const activeFilter = document.querySelector(".filter-button.is-selected")?.dataset.filter ?? "all";
  const searchTerm = projectSearch.value.trim().toLowerCase();
  const isBrowsing = activeFilter === "all" && searchTerm === "";
  let matchCount = 0;

  projectCards.forEach((card) => {
    const matchesCategory = activeFilter === "all" || card.dataset.category === activeFilter;
    const matchesSearch = searchText.get(card).includes(searchTerm);
    const isMatch = matchesCategory && matchesSearch;
    if (isMatch) matchCount += 1;
    card.hidden = !isMatch || (isBrowsing && !showAllProjects && matchCount > INITIAL_PROJECTS);
  });

  noResults.hidden = matchCount !== 0;
  showMoreButton.hidden = !isBrowsing || matchCount <= INITIAL_PROJECTS;
  showMoreButton.textContent = showAllProjects ? "Show fewer projects" : `Show all ${matchCount} projects ✨`;
  showMoreButton.setAttribute("aria-expanded", String(showAllProjects));
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

showMoreButton.addEventListener("click", () => {
  showAllProjects = !showAllProjects;
  filterProjects();
  if (!showAllProjects) {
    document.getElementById("projects").scrollIntoView();
  }
});

filterProjects();

/* --- Project details dialog (content comes from the card itself) --- */
const projectDialog = document.getElementById("project-dialog");
const dialogLive = document.getElementById("dialog-live");

document.querySelectorAll(".notes-button").forEach((button) => {
  if (typeof projectDialog.showModal !== "function") {
    button.hidden = true;
    return;
  }

  button.addEventListener("click", () => {
    const card = button.closest(".project-card");
    const liveLink = card.querySelector(".live-link");

    document.getElementById("dialog-kicker").textContent = card.querySelector(".project-chip").textContent;
    document.getElementById("dialog-title").textContent = card.querySelector("h3").textContent;
    document.getElementById("dialog-description").textContent = card.querySelector(".project-summary").textContent;
    document.getElementById("dialog-detail").textContent = card.querySelector(".project-detail").textContent;
    document.getElementById("dialog-tags").innerHTML = card.querySelector(".tag-list").innerHTML;
    document.getElementById("dialog-repo").href = card.querySelector(".solid-btn").href;
    dialogLive.hidden = !liveLink;
    if (liveLink) dialogLive.href = liveLink.href;

    projectDialog.showModal();
  });
});

projectDialog.addEventListener("click", (e) => {
  if (e.target === projectDialog) projectDialog.close();
});

/* --- Meme break --- */
(function initMemes() {
  const frame = document.getElementById("meme-frame");
  const emojiEl = document.getElementById("meme-emoji");
  const setupEl = document.getElementById("meme-setup");
  const punchEl = document.getElementById("meme-punch");
  const nextBtn = document.getElementById("meme-next");

  if (!frame || !emojiEl || !setupEl || !punchEl || !nextBtn) return;

  const memes = [
    ["🐛", "99 little bugs in the code. Take one down, patch it around...", "127 little bugs in the code."],
    ["💻", "\"But it works on my machine.\"", "Great, then we're shipping your machine."],
    ["⏰", "Me: I'll fix this in five minutes.", "Me, three hours later: so anyway, I rewrote everything."],
    ["🤔", "Code doesn't work: why?", "Code works: ...why?"],
    ["📦", "git commit -m \"final\"", "git commit -m \"final_FINAL_pls_work\""],
    ["🫠", "Kernel panic?", "No no, the kernel is fine. I'm the one panicking."],
    ["🚰", "Data pipeline status:", "It's flowing. Nobody touch anything."],
    ["🤖", "Trained the model for six hours.", "Forgot to save it. We don't talk about it."],
    ["🏀", "Debugging is a lot like basketball:", "you miss 100% of the semicolons you don't check."],
    ["✨", "It's not a bug.", "It's a surprise feature."]
  ];

  let index = 0;

  nextBtn.addEventListener("click", () => {
    index = (index + 1) % memes.length;
    const [emoji, setup, punch] = memes[index];
    emojiEl.textContent = emoji;
    setupEl.textContent = setup;
    punchEl.textContent = punch;
    frame.classList.remove("is-swapping");
    void frame.offsetWidth;
    frame.classList.add("is-swapping");
  });
})();

/* --- Mini-game: Bubble Pop (always open, runs while it is on screen) --- */
(function initBubbleGame() {
  const section = document.getElementById("games");
  const playfield = document.getElementById("bubble-playfield");
  const scoreEl = document.getElementById("bubble-score");
  const bestEl = document.getElementById("bubble-best");
  const hintEl = document.getElementById("bubble-hint");
  const restartBtn = document.getElementById("bubble-restart");
  const pauseBtn = document.getElementById("bubble-pause");
  const fab = document.getElementById("game-fab");

  if (!section || !playfield || !scoreEl || !bestEl || !hintEl || !restartBtn || !pauseBtn) return;

  const MAX_BUBBLES = 6;
  const SPAWN_MIN = 750;
  const SPAWN_MAX = 1300;
  const BUBBLE_LIFETIME_MS = 5200;
  const BEST_KEY = "bubble-pop-best";
  const DEFAULT_HINT = hintEl.textContent;

  let score = 0;
  let best = 0;
  let spawnTimer = null;
  let running = false;
  // Visitors who prefer reduced motion start paused and can press Play.
  let paused = reducedMotion;
  let inView = !("IntersectionObserver" in window);

  const colors = ["#ff5aa5", "#ffd23f", "#4f8dff", "#35d68a", "#ff8a3d", "#a77bff"];

  const cheers = {
    5: "Nice popping! 🫧",
    10: "You're on a roll ✨",
    25: "Bubble boss 👑",
    50: "Okay, certified pop star 🌟"
  };

  try {
    best = Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch (e) {
    best = 0;
  }
  bestEl.textContent = String(best);

  function setScore(next) {
    score = next;
    scoreEl.textContent = String(score);

    if (score > best) {
      best = score;
      bestEl.textContent = String(best);
      try {
        window.localStorage.setItem(BEST_KEY, String(best));
      } catch (e) {
        /* best score just won't be remembered */
      }
    }

    if (score === 0) {
      hintEl.textContent = DEFAULT_HINT;
    } else if (cheers[score]) {
      hintEl.textContent = cheers[score];
    }
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
    if (bubbles.length >= MAX_BUBBLES || !playfield.clientWidth || !playfield.clientHeight) return;

    const bubble = document.createElement("button");
    bubble.type = "button";
    bubble.className = "bubble-game__bubble";
    bubble.setAttribute("aria-label", "Pop bubble");

    const size = randomBetween(44, 62);
    const leftPct = randomBetween(4, 96 - (size / playfield.clientWidth) * 100);
    const topPct = randomBetween(4, 94 - (size / playfield.clientHeight) * 100);

    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.max(0, leftPct)}%`;
    bubble.style.top = `${Math.max(0, topPct)}%`;
    bubble.style.background = colors[Math.floor(Math.random() * colors.length)];

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

      const spark = document.createElement("span");
      spark.className = "bubble-game__spark";
      spark.textContent = "+1 ✨";
      spark.style.left = bubble.style.left;
      spark.style.top = bubble.style.top;
      playfield.appendChild(spark);

      window.setTimeout(() => {
        bubble.remove();
        spark.remove();
      }, 700);
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
      window.setTimeout(() => {
        if (running) trySpawnBubble();
      }, i * 120);
    }
  }

  function stopGame() {
    running = false;
    clearSpawnTimer();
  }

  function syncGame() {
    const shouldRun = !paused && inView && !document.hidden;
    if (shouldRun && !running) startGame();
    if (!shouldRun && running) stopGame();

    playfield.classList.toggle("is-paused", paused);
    pauseBtn.textContent = paused ? "Play" : "Pause";
    pauseBtn.setAttribute("aria-pressed", String(paused));
  }

  pauseBtn.addEventListener("click", () => {
    paused = !paused;
    if (paused) clearPlayfield();
    syncGame();
  });

  restartBtn.addEventListener("click", () => {
    setScore(0);
    clearPlayfield();
    paused = false;
    stopGame();
    syncGame();
  });

  document.addEventListener("visibilitychange", syncGame);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      syncGame();
    }).observe(playfield);

    if (fab) {
      new IntersectionObserver((entries) => {
        fab.classList.toggle("is-hidden", entries[0].isIntersecting);
      }).observe(section);
    }
  }

  syncGame();
})();

/* --- Draggable stickers --- */
document.querySelectorAll(".drag").forEach((item) => {
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;

  item.addEventListener("pointerdown", (e) => {
    item.setPointerCapture(e.pointerId);
    startX = e.clientX - x;
    startY = e.clientY - y;
    item.classList.add("is-dragging");
  });

  item.addEventListener("pointermove", (e) => {
    if (!item.hasPointerCapture(e.pointerId)) return;
    x = e.clientX - startX;
    y = e.clientY - startY;
    item.style.setProperty("--dx", `${x}px`);
    item.style.setProperty("--dy", `${y}px`);
  });

  ["pointerup", "pointercancel"].forEach((type) => {
    item.addEventListener(type, () => item.classList.remove("is-dragging"));
  });
});

/* --- Confetti pop wherever you click --- */
(function initClickBurst() {
  if (reducedMotion) return;

  const colors = ["#ff5aa5", "#ffd23f", "#4f8dff", "#35d68a", "#ff8a3d", "#a77bff"];
  const PIECES = 7;

  document.addEventListener("pointerdown", (e) => {
    if (e.target.closest("canvas, input, dialog, .drag, .bubble-game__playfield")) return;

    const burst = document.createElement("span");
    burst.className = "click-burst";
    burst.style.left = `${e.clientX}px`;
    burst.style.top = `${e.clientY}px`;

    for (let i = 0; i < PIECES; i += 1) {
      const piece = document.createElement("i");
      piece.style.setProperty("--a", `${(360 / PIECES) * i + Math.random() * 24}deg`);
      piece.style.setProperty("--c", colors[i % colors.length]);
      if (i % 2) piece.style.setProperty("--br", "2px");
      burst.appendChild(piece);
    }

    document.body.appendChild(burst);
    window.setTimeout(() => burst.remove(), 600);
  });
})();

/* --- Doodle pad (strokes are stored so the drawing survives a resize) --- */
(function initDoodlePad() {
  const canvas = document.getElementById("doodle-canvas");
  const sizeInput = document.getElementById("doodle-size");
  const undoBtn = document.getElementById("doodle-undo");
  const clearBtn = document.getElementById("doodle-clear");
  const saveBtn = document.getElementById("doodle-save");
  const swatches = document.querySelectorAll(".swatch");

  if (!canvas || !canvas.getContext || !sizeInput || !undoBtn || !clearBtn || !saveBtn) return;

  const ctx = canvas.getContext("2d");
  // Points and sizes are stored as fractions of the canvas width/height.
  const strokes = [];
  let current = null;
  let color = "#17141f";
  let width = 0;
  let height = 0;

  function drawStroke(stroke) {
    const [first, ...rest] = stroke.points;
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.size * width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (rest.length === 0) {
      ctx.beginPath();
      ctx.arc(first.x * width, first.y * height, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.beginPath();
    ctx.moveTo(first.x * width, first.y * height);
    rest.forEach((point) => ctx.lineTo(point.x * width, point.y * height));
    ctx.stroke();
  }

  function redraw() {
    // Transparent so the dotted paper from the CSS shows through; the PNG export adds its own paper.
    ctx.clearRect(0, 0, width, height);
    strokes.forEach(drawStroke);
  }

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (!width || !height) return;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    redraw();
  }

  function pointFrom(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - canvas.clientLeft) / width,
      y: (e.clientY - rect.top - canvas.clientTop) / height
    };
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (!width || !height) return;
    canvas.setPointerCapture(e.pointerId);
    current = { color, size: Number(sizeInput.value) / width, points: [pointFrom(e)] };
    strokes.push(current);
    redraw();
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!current) return;
    const point = pointFrom(e);
    const last = current.points[current.points.length - 1];
    current.points.push(point);
    drawStroke({ ...current, points: [last, point] });
  });

  ["pointerup", "pointercancel"].forEach((type) => {
    canvas.addEventListener(type, () => {
      current = null;
    });
  });

  swatches.forEach((swatch) => {
    swatch.addEventListener("click", () => {
      color = swatch.dataset.color;
      swatches.forEach((other) => {
        const isSelected = other === swatch;
        other.classList.toggle("is-selected", isSelected);
        other.setAttribute("aria-pressed", String(isSelected));
      });
    });
  });

  undoBtn.addEventListener("click", () => {
    strokes.pop();
    redraw();
  });

  clearBtn.addEventListener("click", () => {
    strokes.length = 0;
    redraw();
  });

  saveBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "doodle.png";
    // Composite onto cream paper so the download is not transparent
    const paper = document.createElement("canvas");
    paper.width = canvas.width;
    paper.height = canvas.height;
    const paperCtx = paper.getContext("2d");
    paperCtx.fillStyle = "#fffdf8";
    paperCtx.fillRect(0, 0, paper.width, paper.height);
    paperCtx.drawImage(canvas, 0, 0);
    link.href = paper.toDataURL("image/png");
    link.click();
  });

  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(canvas);
  } else {
    window.addEventListener("resize", resize);
  }

  resize();
})();
