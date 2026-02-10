const startBtn = document.getElementById("startBtn");
const gameArea = document.getElementById("gameArea");
const stats = document.getElementById("stats");
const darkToggle = document.getElementById("darkToggle");

let score = 0;
let startTime = 0;
let maxTargets = 10;

/* 다크모드 토글 */
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

/* 게임 시작 */
startBtn.addEventListener("click", startGame);

function startGame() {
  score = 0;
  stats.textContent = "Score: 0";
  gameArea.innerHTML = "";
  startTime = Date.now();
  spawnTarget();
}

/* 타겟 생성 */
function spawnTarget() {
  if (score >= maxTargets) {
    endGame();
    return;
  }

  const target = document.createElement("div");
  target.classList.add("target");

  const size = 40;
  const x = Math.random() * (gameArea.clientWidth - size);
  const y = Math.random() * (gameArea.clientHeight - size);

  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  target.addEventListener("click", () => {
    score++;
    stats.textContent = `Score: ${score}`;
    target.remove();
    spawnTarget();
  });

  gameArea.appendChild(target);
}

/* 게임 종료 */
function endGame() {
  const endTime = Date.now();
  const timeTaken = ((endTime - startTime) / 1000).toFixed(2);

  stats.textContent = `완료! 기록: ${timeTaken}초`;

  // 나중에 여기서 리더보드 서버로 기록 전송
  console.log("Challenger Time:", timeTaken);
}