const gameArea = document.getElementById("gameArea");
const startBtn = document.getElementById("startBtn");
const scoreDisplay = document.getElementById("score");
const comboDisplay = document.getElementById("combo");
const bestComboDisplay = document.getElementById("bestCombo");
const avgTimeDisplay = document.getElementById("avgTime");
const comboBar = document.getElementById("comboBar");
const result = document.getElementById("result");
const modeButtons = document.querySelectorAll(".mode");

let score = 0;
let combo = 0;
let bestCombo = 0;
let totalShots = 0;
let totalHits = 0;
let reactionTimes = [];
let gameInterval;
let targetTimeout;
let mode = "easy";
let spawnTime;

const settings = {
  easy: { spawn: 1200, life: 1500 },
  hard: { spawn: 800, life: 1000 },
  pro:  { spawn: 600, life: 700 }
};

modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    mode = btn.dataset.mode;
  });
});

startBtn.addEventListener("click", startGame);

function startGame() {
  score = 0;
  combo = 0;
  bestCombo = 0;
  totalShots = 0;
  totalHits = 0;
  reactionTimes = [];
  result.textContent = "";

  updateHUD();

  clearInterval(gameInterval);
  gameInterval = setInterval(spawnTarget, settings[mode].spawn);

  setTimeout(endGame, 30000);
}

function spawnTarget() {
  removeTarget();
  totalShots++;

  const target = document.createElement("div");
  target.classList.add("target");

  const size = 50;
  const maxX = gameArea.clientWidth - size;
  const maxY = gameArea.clientHeight - size;

  target.style.left = Math.random() * maxX + "px";
  target.style.top = Math.random() * maxY + "px";

  spawnTime = Date.now();

  target.addEventListener("click", () => {
    const reaction = Date.now() - spawnTime;
    reactionTimes.push(reaction);

    score++;
    combo++;
    totalHits++;

    if (combo > bestCombo) bestCombo = combo;

    updateHUD();
    removeTarget();
  });

  gameArea.appendChild(target);

  targetTimeout = setTimeout(() => {
    if (target.parentNode) {
      combo = 0;
      updateHUD();
      removeTarget();
    }
  }, settings[mode].life);
}

function removeTarget() {
  const existing = document.querySelector(".target");
  if (existing) existing.remove();
}

function updateHUD() {
  scoreDisplay.textContent = score;
  comboDisplay.textContent = combo;
  bestComboDisplay.textContent = bestCombo;

  const avg = reactionTimes.length
    ? Math.round(reactionTimes.reduce((a,b)=>a+b,0)/reactionTimes.length)
    : 0;

  avgTimeDisplay.textContent = avg;

  comboBar.style.width = Math.min(combo * 10, 100) + "%";
}

function endGame() {
  clearInterval(gameInterval);
  removeTarget();

  const accuracy = totalShots ? Math.round((totalHits/totalShots)*100) : 0;

  result.innerHTML = `
    <h2>GAME OVER</h2>
    <p>Score: ${score}</p>
    <p>Accuracy: ${accuracy}%</p>
    <p>Best Combo: ${bestCombo}</p>
  `;
}
