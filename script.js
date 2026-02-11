const gameArea = document.getElementById("gameArea");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const highScoreEl = document.getElementById("highScore");
const result = document.getElementById("result");
const chartCanvas = document.getElementById("reactionChart");
const ctx = chartCanvas.getContext("2d");

let score = 0;
let combo = 0;
let bestCombo = 0;
let highScore = localStorage.getItem("aimHighScore") || 0;
let totalShots = 0;
let totalHits = 0;
let reactionTimes = [];
let gameInterval;
let currentMode = "easy";

highScoreEl.textContent = highScore;

document.querySelectorAll(".modeBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentMode = btn.dataset.mode;
    startGame();
  });
});

function startGame() {
  score = 0;
  combo = 0;
  bestCombo = 0;
  totalShots = 0;
  totalHits = 0;
  reactionTimes = [];
  result.innerHTML = "";
  updateHUD();

  clearInterval(gameInterval);

  let spawnRate = 1500;
  if (currentMode === "hard") spawnRate = 1000;
  if (currentMode === "pro") spawnRate = 700;

  gameInterval = setInterval(spawnTarget, spawnRate);

  setTimeout(endGame, 30000);
}

function spawnTarget() {
  const target = document.createElement("div");
  target.classList.add("target");

  const size = 40 + Math.random() * 30;
  target.style.width = size + "px";
  target.style.height = size + "px";

  target.style.left = Math.random() * (850 - size) + "px";
  target.style.top = Math.random() * (450 - size) + "px";

  gameArea.appendChild(target);

  const appearTime = Date.now();

  target.addEventListener("click", () => {
    const reaction = Date.now() - appearTime;
    reactionTimes.push(reaction);

    score++;
    combo++;
    totalHits++;
    totalShots++;
    bestCombo = Math.max(bestCombo, combo);

    target.remove();
    updateHUD();
  });

  setTimeout(() => {
    if (gameArea.contains(target)) {
      target.remove();
      combo = 0;
      totalShots++;
      updateHUD();
    }
  }, 1500);
}

function updateHUD() {
  scoreEl.textContent = score;
  comboEl.textContent = combo;
}

function calculateRank(score, accuracy) {
  if (score >= 45 && accuracy >= 90) return "S";
  if (score >= 35 && accuracy >= 80) return "A";
  if (score >= 25 && accuracy >= 70) return "B";
  if (score >= 15 && accuracy >= 60) return "C";
  return "D";
}

function endGame() {
  clearInterval(gameInterval);

  const accuracy = totalShots
    ? Math.round((totalHits / totalShots) * 100)
    : 0;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("aimHighScore", highScore);
    highScoreEl.textContent = highScore;
  }

  const rank = calculateRank(score, accuracy);

  result.innerHTML = `
    <h2>MISSION COMPLETE</h2>
    <div class="rankBadge rank-${rank}">${rank}</div>
    <p>Score: ${score}</p>
    <p>Accuracy: ${accuracy}%</p>
    <p>Best Combo: ${bestCombo}</p>
  `;

  drawGraph();
}

function drawGraph() {
  chartCanvas.width = 900;
  chartCanvas.height = 200;

  ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

  ctx.strokeStyle = "#00eaff";
  ctx.beginPath();

  reactionTimes.forEach((time, index) => {
    const x = (index / reactionTimes.length) * chartCanvas.width;
    const y = chartCanvas.height - time / 5;

    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}
