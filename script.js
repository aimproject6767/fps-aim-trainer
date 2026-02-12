const canvas = document.getElementById("gameCanvas");
canvas.width = 800;
canvas.height = 500;

// Three.js 기본 세팅
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(800, 500);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f141c);

const camera = new THREE.PerspectiveCamera(75, 800/500, 0.1, 1000);
camera.position.z = 100;

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 100).normalize();
scene.add(light);

// 게임 변수
let score = 0, hits = 0, shots = 0, combo = 0, timeLeft = 30;
let reactionTimes = [], spawnTime, currentTarget = null;
let highScore = localStorage.getItem("highScore") || 0;
let sensitivity = 0.5;
let gameInterval;

document.getElementById("highScore").innerText = highScore;

// 감도 조절
document.getElementById("sensitivity").addEventListener("input", e => {
  sensitivity = parseFloat(e.target.value);
  document.getElementById("sensValue").innerText = sensitivity.toFixed(2);
});

// 다크/화이트 모드 토글
document.getElementById("modeToggle").onclick = () => {
  document.body.style.background = document.body.style.background === "white" ? "#0f141c" : "white";
  document.body.style.color = document.body.style.color === "black" ? "white" : "black";
};

// 게임 시작
document.getElementById("startBtn").onclick = startGame;

function startGame() {
  score = hits = shots = combo = 0;
  timeLeft = 30;
  reactionTimes = [];
  currentTarget = null;
  document.getElementById("result").innerHTML = "";

  spawn3DTarget();
  updateHUD();

  gameInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("time").innerText = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

// 3D 타겟 생성
function spawn3DTarget() {
  if (currentTarget) scene.remove(currentTarget);

  const geometry = new THREE.SphereGeometry(5 + Math.random()*5, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0055, metalness:0.5, roughness:0.2 });

  currentTarget = new THREE.Mesh(geometry, material);
  currentTarget.position.x = Math.random()*80 - 40;
  currentTarget.position.y = Math.random()*40 - 20;
  currentTarget.position.z = Math.random()*20 - 10;

  scene.add(currentTarget);
  spawnTime = Date.now();
}

// 클릭 감지
renderer.domElement.addEventListener('click', e => {
  if (!currentTarget) return;
  shots++;

  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left)/rect.width)*2 - 1,
    -((e.clientY - rect.top)/rect.height)*2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(currentTarget);
  if (intersects.length > 0) {
    score++; hits++; combo++; reactionTimes.push(Date.now()-spawnTime);
    spawn3DTarget();
    updateHUD();
  } else {
    combo = 0;
  }
});

function updateHUD() {
  document.getElementById("score").innerText = score;
  const acc = shots ? Math.round((hits/shots)*100) : 0;
  document.getElementById("accuracy").innerText = acc + "%";
}

// 랭크 계산
function calculateRank(score, accuracy) {
  if (score>=45 && accuracy>=90) return "S";
  if (score>=35 && accuracy>=80) return "A";
  if (score>=25 && accuracy>=70) return "B";
  if (score>=15 && accuracy>=60) return "C";
  return "D";
}

// 게임 종료
function endGame() {
  clearInterval(gameInterval);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    document.getElementById("highScore").innerText = highScore;
  }

  const accuracy = shots ? Math.round((hits/shots)*100) : 0;
  const rank = calculateRank(score, accuracy);

  document.getElementById("result").innerHTML = `
    <h2>MISSION COMPLETE</h2>
    <div class="rankBadge rank-${rank}">${rank}</div>
    <p>Score: ${score}</p>
    <p>Accuracy: ${accuracy}%</p>
    <p>Combo: ${combo}</p>
  `;

  drawGraph();
}

// 반응속도 그래프
function drawGraph() {
  const g = document.getElementById("graphCanvas");
  const gctx = g.getContext("2d");
  gctx.clearRect(0,0,g.width,g.height);

  if (reactionTimes.length===0) return;

  gctx.beginPath();
  gctx.moveTo(0, g.height - reactionTimes[0]/5);

  for (let i=1;i<reactionTimes.length;i++) {
    gctx.lineTo(i*20, g.height - reactionTimes[i]/5);
  }
  gctx.strokeStyle="#00eaff";
  gctx.stroke();
}

// 렌더링 루프
function animate() {
  requestAnimationFrame(animate);
  if (currentTarget) currentTarget.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();