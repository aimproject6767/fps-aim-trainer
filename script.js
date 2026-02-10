const startBtn = document.getElementById("startBtn");
const gameArea = document.getElementById("gameArea");
const stats = document.getElementById("stats");
const darkToggle = document.getElementById("darkToggle");
const leaderboardList = document.getElementById("leaderboardList");

let score = 0;
let startTime = 0;

const MAX_TARGETS = 10;
const TARGET_SIZE = 40;

/* Dark Mode */
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

/* Start Game */
startBtn.addEventListener("click", () => {
  score = 0;
  gameArea.innerHTML = "";
  stats.textContent = "Score: 0";
  startTime = Date.now();
  spawnTarget();
});

/* Spawn Target */
function spawnTarget() {
  if (score >= MAX_TARGETS) {
    endGame();
    return;
  }

  const target = document.createElement("div");
  target.className = "target";

  const x = Math.random() * (gameArea.clientWidth - TARGET_SIZE);
  const y = Math.random() * (gameArea.clientHeight - TARGET_SIZE);

  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  target.onclick = () => {
    score++;
    stats.textContent = `Score: ${score}`;
    target.remove();
    spawnTarget();
  };

  gameArea.appendChild(target);
}

/* End Game */
function endGame() {
  const time = ((Date.now() - startTime) / 1000).toFixed(2);
  stats.textContent = `완료! 기록: ${time}초`;
  saveScore(Number(time));
  loadLeaderboard();
}

/* Leaderboard */
function saveScore(time) {
  const records = JSON.parse(localStorage.getItem("leaderboard")) || [];
  records.push(time);
  records.sort((a, b) => a - b);
  localStorage.setItem("leaderboard", JSON.stringify(records.slice(0, 10)));
}

function loadLeaderboard() {
  if (!leaderboardList) return;
  leaderboardList.innerHTML = "";

  const records = JSON.parse(localStorage.getItem("leaderboard")) || [];
  records.forEach((time, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}위 - ${time}초`;
    leaderboardList.appendChild(li);
  });
}

loadLeaderboard();