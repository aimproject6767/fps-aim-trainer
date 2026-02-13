let score = 0;
let highscore = localStorage.getItem("highscore") || 0;
let reactionTimes = [];
let mode = "easy";
let spawnInterval;
let lastSpawnTime;

const gameArea = document.getElementById("gameArea");
const scoreEl = document.getElementById("score");
const highscoreEl = document.getElementById("highscore");
const reactionEl = document.getElementById("reactionTime");
const rankEl = document.getElementById("rank");

highscoreEl.innerText = highscore;

document.querySelectorAll(".mode-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    mode = btn.dataset.mode;
  });
});

document.getElementById("startBtn").addEventListener("click", startGame);

function startGame() {
  score = 0;
  reactionTimes = [];
  scoreEl.innerText = score;
  gameArea.innerHTML = "";

  let speed = 1000;
  if (mode === "hard") speed = 700;
  if (mode === "pro") speed = 500;

  clearInterval(spawnInterval);
  spawnInterval = setInterval(spawnTarget, speed);
}

function spawnTarget() {
  const target = document.createElement("div");
  target.classList.add("target");

  const x = Math.random() * (gameArea.clientWidth - 60);
  const y = Math.random() * (gameArea.clientHeight - 60);

  target.style.left = x + "px";
  target.style.top = y + "px";

  gameArea.appendChild(target);

  lastSpawnTime = Date.now();

  target.addEventListener("click", () => {
    const reaction = Date.now() - lastSpawnTime;
    reactionTimes.push(reaction);
    score++;
    scoreEl.innerText = score;
    updateReaction();
    updateRank();
    target.remove();
  });

  setTimeout(() => {
    if (gameArea.contains(target)) target.remove();
  }, 1500);
}

function updateReaction() {
  if (reactionTimes.length === 0) return;
  const avg = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
  reactionEl.innerText = Math.round(avg) + "ms";
}

function updateRank() {
  if (score > highscore) {
    highscore = score;
    localStorage.setItem("highscore", highscore);
    highscoreEl.innerText = highscore;
  }

  if (score < 10) rankEl.innerText = "Bronze";
  else if (score < 20) rankEl.innerText = "Silver";
  else if (score < 30) rankEl.innerText = "Gold";
  else rankEl.innerText = "Platinum";
}

/* ===== 8 Language System ===== */

const translations = {
ko:{title:"FPS 에임 트레이너",start:"시작",easy:"쉬움",hard:"어려움",pro:"프로",score:"점수",highscore:"최고 기록",reaction:"평균 반응속도",rank:"랭크"},
en:{title:"FPS Aim Trainer",start:"Start",easy:"Easy",hard:"Hard",pro:"Pro",score:"Score",highscore:"High Score",reaction:"Avg Reaction",rank:"Rank"},
pt:{title:"Treinador de Mira FPS",start:"Começar",easy:"Fácil",hard:"Difícil",pro:"Pro",score:"Pontuação",highscore:"Recorde",reaction:"Reação Média",rank:"Rank"},
es:{title:"Entrenador de Puntería FPS",start:"Comenzar",easy:"Fácil",hard:"Difícil",pro:"Pro",score:"Puntuación",highscore:"Récord",reaction:"Reacción Prom.",rank:"Rango"},
tr:{title:"FPS Nişan Eğitimi",start:"Başla",easy:"Kolay",hard:"Zor",pro:"Pro",score:"Skor",highscore:"En Yüksek",reaction:"Ort. Tepki",rank:"Rütbe"},
zh:{title:"FPS 瞄准训练器",start:"开始",easy:"简单",hard:"困难",pro:"专业",score:"得分",highscore:"最高分",reaction:"平均反应",rank:"段位"},
de:{title:"FPS Zieltrainer",start:"Start",easy:"Leicht",hard:"Schwer",pro:"Profi",score:"Punkte",highscore:"Bestwert",reaction:"Ø Reaktion",rank:"Rang"},
ja:{title:"FPS エイムトレーナー",start:"開始",easy:"簡単",hard:"難しい",pro:"プロ",score:"スコア",highscore:"最高記録",reaction:"平均反応",rank:"ランク"}
};

function detectLanguage(){
  const saved = localStorage.getItem("selectedLang");
  if(saved && translations[saved]) return saved;
  const userLang = navigator.language.split("-")[0];
  return translations[userLang] ? userLang : "ko";
}

function applyTranslations(lang){
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    if(translations[lang][key]){
      el.innerText = translations[lang][key];
    }
  });
}

document.addEventListener("DOMContentLoaded",()=>{
  const lang = detectLanguage();
  applyTranslations(lang);
  const switcher = document.getElementById("languageSwitcher");
  switcher.value = lang;
  switcher.addEventListener("change",function(){
    localStorage.setItem("selectedLang",this.value);
    applyTranslations(this.value);
  });
});