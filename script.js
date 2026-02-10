const gameArea = document.getElementById("gameArea");
const startBtn = document.getElementById("startBtn");
const stats = document.getElementById("stats");
const darkToggle = document.getElementById("darkToggle");

let startTime;
let hits = 0;
let totalTargets = 10;

darkToggle.onclick = () => {
  document.body.classList.toggle("dark");
};

startBtn.onclick = () => {
  gameArea.innerHTML = "";
  hits = 0;
  startTime = performance.now();
  spawnTarget();
};

function spawnTarget() {
  if (hits >= totalTargets) {
    endChallenger();
    return;
  }

  const target = document.createElement("div");
  target.className = "target";

  const x = Math.random() * (gameArea.clientWidth - 40);
  const y = Math.random() * (gameArea.clientHeight - 40);

  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  target.onclick = () => {
    hits++;
    target.remove();
    spawnTarget();
  };

  gameArea.appendChild(target);
}

function endChallenger() {
  const time = ((performance.now() - startTime) / 1000).toFixed(2);
  stats.innerText = `클리어 시간: ${time}초`;
}