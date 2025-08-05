// === Letras (incluye Ñ) ===
const LETTERS = [
  "A","B","C","D","E","F","G","H","I","J","K","L","M",
  "N","Ñ","O","P","Q","R","S","T","U","V","W","X","Y","Z"
];

// --- Render del tablero ---
const board = document.getElementById("board");
const editTimeBtn = document.getElementById("editTimeBtn");
const modalOverlay = document.getElementById("modalOverlay");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const timeForm = document.getElementById("timeForm");
const minutesInput = document.getElementById("minutesInput");
const secondsInput = document.getElementById("secondsInput");
const msInput = document.getElementById("msInput");



function createCard(letter) {
  const card = document.createElement("button");
  card.className = "card";
  card.type = "button";
  card.setAttribute("aria-label", `Letra ${letter}. Pulsa para voltear.`);

  const inner = document.createElement("div");
  inner.className = "card-inner";

  const front = document.createElement("div");
  front.className = "card-face front";
  front.textContent = letter;

  const back = document.createElement("div");
  back.className = "card-face back";
  back.textContent = "↻";

  inner.appendChild(front);
  inner.appendChild(back);
  card.appendChild(inner);

  card.addEventListener("click", () => card.classList.toggle("flipped"));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      card.classList.toggle("flipped");
    }
  });

  return card;
}

(function renderBoard() {
  const frag = document.createDocumentFragment();
  LETTERS.forEach(letter => frag.appendChild(createCard(letter)));
  board.innerHTML = "";
  board.appendChild(frag);
})();

// --- Contador de 3 minutos (mm:ss:ms) ---
// const DURATION_MS = 3 * 60 * 1000;
// const DURATION_MS = 3 * 60 * 1000; // ❌ Ya no se necesita
let durationMs = 0;  // ✅ Valor inicial hasta que el usuario lo configure


const minEl = document.getElementById("min");
const secEl = document.getElementById("sec");
const msEl  = document.getElementById("ms");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

let remaining = durationMs;
let running = false;
let rafId = null;
let lastTs = null;

function formatAndPaint(msLeft) {
  const clamped = Math.max(0, msLeft);
  const minutes = Math.floor(clamped / 60000);
  const seconds = Math.floor((clamped % 60000) / 1000);
  const millis  = Math.floor(clamped % 1000);

  minEl.textContent = String(minutes).padStart(2, "0");
  secEl.textContent = String(seconds).padStart(2, "0");
  msEl.textContent  = String(millis).padStart(3, "0");

  // Agrega o quita la clase "urgent"
  const timerEl = document.querySelector(".timer");
  if (clamped <= 10_000) {
    timerEl.classList.add("urgent");
  } else {
    timerEl.classList.remove("urgent");
  }
}


function tick(ts) {
  if (!running) return;
  if (lastTs == null) lastTs = ts;

  const delta = ts - lastTs;
  lastTs = ts;
  remaining -= delta;

  formatAndPaint(remaining);

  if (remaining <= 0) {
    running = false;
    cancelAnimationFrame(rafId);
    rafId = null;
    if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
    return;
  }
  rafId = requestAnimationFrame(tick);
}

function start() {
  if (running) return;
  running = true;
  lastTs = null;
  rafId = requestAnimationFrame(tick);
}

function pause() {
  if (!running) return;
  running = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  lastTs = null;
}

function reset() {
  pause();
  remaining = durationMs; // ✅ Usa el tiempo personalizado
  formatAndPaint(remaining);

  // Restaurar cartas volteadas
  document.querySelectorAll(".card.flipped").forEach(card => {
    card.classList.remove("flipped");
  });
}



startBtn.addEventListener("click", start);
pauseBtn.addEventListener("click", pause);
resetBtn.addEventListener("click", reset);

// Inicializa la vista del tiempo
formatAndPaint(remaining);


// Mostrar modal
editTimeBtn.addEventListener("click", () => {
  const total = Math.max(0, remaining);
  minutesInput.value = Math.floor(total / 60000);
  secondsInput.value = Math.floor((total % 60000) / 1000);
  msInput.value = Math.floor(total % 1000);
  modalOverlay.style.display = "flex";
});

// Ocultar modal
cancelModalBtn.addEventListener("click", () => {
  modalOverlay.style.display = "none";
});

// Guardar nuevo tiempo
timeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const minutes = parseInt(minutesInput.value, 10);
  const seconds = parseInt(secondsInput.value, 10);
  const ms = parseInt(msInput.value, 10);

  if (
    isNaN(minutes) || minutes < 0 || minutes > 60 ||
    isNaN(seconds) || seconds < 0 || seconds > 59 ||
    isNaN(ms) || ms < 0 || ms > 999
  ) {
    alert("Ingresa valores válidos:\nMinutos: \nSegundos: \nMilisegundos: ");
    return;
  }

  durationMs = (minutes * 60 * 1000) + (seconds * 1000) + ms;
  remaining = durationMs;


  formatAndPaint(remaining);
  modalOverlay.style.display = "none";
});

