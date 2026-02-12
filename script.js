const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

let score = 0;
let hits = 0;
let shots = 0;
let timeLeft = 30;
let sensitivity = 0.5;
let highScore = localStorage.getItem("highScore") || 0;
let reactionTimes = [];
let gameInterval;
let currentTarget = null;
let spawnTime;

document.getElementById("highScore").innerText = highScore;

document.getElementById("sensitivity").addEventListener("input", e => {
  sensitivity = parseFloat(e.target.value);
  document.getElementById("sensValue").innerText = sensitivity.toFixed(2);
});

document.getElementById("modeToggle").onclick = () => {
  document.body.style.background =
    document.body.style.background === "white" ? "#0f141c" : "white";
  document.body.style.color =
    document.body.style.color === "black" ? "white" : "black";
};

document.getElementById("startBtn").onclick = startGame;

function startGame() {
  score = 0;
  hits = 0;
  shots = 0;
  timeLeft = 30;
  reactionTimes = [];
  document.getElementById("result").innerHTML = "";

  spawnTarget();

  gameInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("time").innerText = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function spawnTarget() {
  currentTarget = {
    x: Math.random() * (canvas.width - 100) + 50,
    y: Math.random() * (canvas.height - 100) + 50,
    radius: 35
  };
  spawnTime = Date.now();
  draw();
}

canvas.addEventListener("click", e => {
  if (!currentTarget) return;
  shots++;

  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * sensitivity;
  const y = (e.clientY - rect.top) * sensitivity;

  const dx = x - currentTarget.x;
  const dy = y - currentTarget.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < currentTarget.radius) {
    score++;
    hits++;
    reactionTimes.push(Date.now() - spawnTime);
    spawnTarget();
  }

  updateHUD();
});

function updateHUD() {
  document.getElementById("score").innerText = score;
  const acc = shots ? Math.round((hits / shots) * 100) : 0;
  document.getElementById("accuracy").innerText = acc + "%";
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (!currentTarget) return;

  const gradient = ctx.createRadialGradient(
    currentTarget.x,
    currentTarget.y,
    5,
    currentTarget.x,
    currentTarget.y,
    currentTarget.radius
  );

  gradient.addColorStop(0,"#ffffff");
  gradient.addColorStop(0.3,"#ff0055");
  gradient.addColorStop(1,"#440000");

  ctx.beginPath();
  ctx.arc(currentTarget.x,currentTarget.y,currentTarget.radius,0,Math.PI*2);
  ctx.fillStyle = gradient;
  ctx.fill();
}

function endGame() {
  clearInterval(gameInterval);
  currentTarget = null;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }

  document.getElementById("result").innerHTML =
    `<h2>MISSION COMPLETE</h2>
     <h1>Score: ${score}</h1>`;

  drawGraph();
}

function drawGraph() {
  const g = document.getElementById("graphCanvas");
  const gctx = g.getContext("2d");

  gctx.clearRect(0,0,g.width,g.height);

  if (reactionTimes.length === 0) return;

  gctx.beginPath();
  gctx.moveTo(0, g.height - reactionTimes[0]/5);

  for (let i=1;i<reactionTimes.length;i++) {
    gctx.lineTo(i*20, g.height - reactionTimes[i]/5);
  }

  gctx.strokeStyle="#00eaff";
  gctx.stroke();
}