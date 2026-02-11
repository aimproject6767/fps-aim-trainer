const startBtn = document.getElementById("startBtn");
const gameArea = document.getElementById("gameArea");
const stats = document.getElementById("stats");
const darkToggle = document.getElementById("darkToggle");

let difficulty = "easy";
let gameActive = false;
let hits = 0;
let misses = 0;
let score = 0;
let combo = 0;
let maxCombo = 0;
let maxRounds = 10;
let startTime;
let reactionStart;
let reactionTimes = [];
let currentTargets = [];

/* 🌙 다크모드 */
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

/* 🎚 난이도 버튼 */
const difficultyContainer = document.createElement("div");
difficultyContainer.style.marginBottom = "15px";

["easy", "hard", "pro"].forEach(mode => {
  const btn = document.createElement("button");
  btn.textContent = mode.toUpperCase();
  btn.classList.add("diff-btn");
  btn.style.marginRight = "8px";
  btn.style.opacity = mode === "easy" ? "1" : "0.5";

  btn.addEventListener("click", () => {
    difficulty = mode;
    document.querySelectorAll(".diff-btn").forEach(b => b.style.opacity = "0.5");
    btn.style.opacity = "1";
  });

  difficultyContainer.appendChild(btn);
});

gameArea.parentNode.insertBefore(difficultyContainer, gameArea);

/* 🔥 콤보 UI */
const comboUI = document.createElement("div");
comboUI.style.marginTop = "10px";
comboUI.innerHTML = `
  <div style="margin-bottom:5px;">🔥 Combo: <span id="comboText">0</span></div>
  <div class="combo-bar-bg">
    <div id="comboBar" class="combo-bar"></div>
  </div>
`;
gameArea.parentNode.insertBefore(comboUI, gameArea.nextSibling);

function updateComboUI() {
  const comboText = document.getElementById("comboText");
  const comboBar = document.getElementById("comboBar");

  comboText.textContent = combo;
  comboBar.style.width = Math.min(combo * 10, 100) + "%";

  if (combo >= 10) {
    comboBar.classList.add("combo-max");
  } else {
    comboBar.classList.remove("combo-max");
  }
}

/* 🎯 타겟 생성 */
function createTarget() {
  if (!gameActive) return;

  currentTargets.forEach(t => t.remove());
  currentTargets = [];

  const count = difficulty === "pro" ? (Math.random() < 0.5 ? 2 : 1) : 1;

  for (let i = 0; i < count; i++) {
    spawnOneTarget();
  }
}

function spawnOneTarget() {
  const target = document.createElement("div");
  target.classList.add("target");

  const size = 50;
  target.style.width = size + "px";
  target.style.height = size + "px";

  const rect = gameArea.getBoundingClientRect();
  const x = Math.random() * (rect.width - size);
  const y = Math.random() * (rect.height - size);

  target.style.left = x + "px";
  target.style.top = y + "px";

  reactionStart = Date.now();

  let timeout = 1500;
  if (difficulty === "hard") timeout = 900;
  if (difficulty === "pro") timeout = 700;

  const autoMiss = setTimeout(() => {
    if (!gameActive) return;

    misses++;
    combo = 0;
    updateComboUI();
    showPopup("MISS", rect.width / 2, rect.height / 2, "miss");
    nextRound();
  }, timeout);

  target.addEventListener("click", () => {
    if (!gameActive) return;

    clearTimeout(autoMiss);

    const reactionTime = Date.now() - reactionStart;
    reactionTimes.push(reactionTime);

    hits++;
    combo++;
    if (combo > maxCombo) maxCombo = combo;

    updateComboUI();

    const multiplier = Math.min(combo, 5);
    const gained = multiplier;
    score += gained;

    if (combo >= 5) triggerShake();
    if (combo >= 10) triggerFire();

    showPopup(`+${gained} (x${multiplier})`, rect.width / 2, rect.height / 2, "hit");

    nextRound();
  });

  currentTargets.push(target);
  gameArea.appendChild(target);
}

/* 🔄 다음 라운드 */
function nextRound() {
  currentTargets.forEach(t => t.remove());
  currentTargets = [];

  if (hits + misses >= maxRounds) {
    endGame();
  } else {
    createTarget();
  }
}

/* 🚀 시작 */
startBtn.addEventListener("click", () => {
  if (gameActive) return;

  hits = 0;
  misses = 0;
  score = 0;
  combo = 0;
  maxCombo = 0;
  reactionTimes = [];
  gameArea.innerHTML = "";
  stats.innerHTML = "";
  gameActive = true;

  updateComboUI();
  startTime = Date.now();
  createTarget();
});

/* 🏁 종료 */
function endGame() {
  gameActive = false;

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  const accuracy = ((hits / maxRounds) * 100).toFixed(1);
  const avgReaction = reactionTimes.length
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  stats.innerHTML = `
    <h2>🏁 결과</h2>
    🎯 총 점수: <b>${score}</b><br>
    🔥 최고 콤보: <b>${maxCombo}</b><br>
    ⏱ ${totalTime}초<br>
    🎯 정확도: ${accuracy}%<br>
    ⚡ 평균 반응속도: ${avgReaction}ms
  `;
}

/* 🏆 티어 */
function getRank(avg) {
  if (avg < 250) return "🔥 Challenger";
  if (avg < 350) return "💎 Diamond";
  if (avg < 450) return "🥇 Platinum";
  if (avg < 550) return "🥈 Gold";
  return "🥉 Silver";
}

/* 💥 화면 흔들림 */
function triggerShake() {
  gameArea.classList.add("shake");
  setTimeout(() => gameArea.classList.remove("shake"), 300);
}

/* 🔥 불꽃 효과 */
function triggerFire() {
  gameArea.classList.add("fire");
  setTimeout(() => gameArea.classList.remove("fire"), 400);
}

/* 💥 팝업 */
function showPopup(text, x, y, type) {
  const popup = document.createElement("div");
  popup.classList.add("popup", type);
  popup.textContent = text;

  popup.style.left = x + "px";
  popup.style.top = y + "px";

  gameArea.appendChild(popup);
  setTimeout(() => popup.remove(), 800);
}