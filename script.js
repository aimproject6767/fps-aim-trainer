const startBtn = document.getElementById("startBtn");
const gameArea = document.getElementById("gameArea");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const rankEl = document.getElementById("rank");
const sensSlider = document.getElementById("sens");
const sensValue = document.getElementById("sensValue");
const themeToggle = document.getElementById("themeToggle");
const modeBtns = document.querySelectorAll(".modeBtn");

let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let reactionTimes = [];
let gameInterval;
let currentMode = "easy";
let lastSpawn;
let chart;

bestEl.textContent = bestScore;

// 민감도 숫자 표시 정상화
sensSlider.addEventListener("input", () => {
    sensValue.textContent = parseFloat(sensSlider.value).toFixed(1);
});

// 다크모드 정상작동
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
});

// 모드 버튼 정상작동
modeBtns.forEach(btn=>{
    btn.addEventListener("click", ()=>{
        modeBtns.forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        currentMode = btn.dataset.mode;
    });
});

// 시작 버튼 정상작동
startBtn.addEventListener("click", startGame);

function startGame(){
    score=0;
    reactionTimes=[];
    scoreEl.textContent=0;
    clearInterval(gameInterval);
    spawnTarget();

    let speed = currentMode==="easy"?1200:
                currentMode==="hard"?800:600;

    gameInterval = setInterval(()=>{
        spawnTarget();
    }, speed);
}

function spawnTarget(){
    gameArea.innerHTML="";
    const target = document.createElement("div");
    target.classList.add("target");

    const x = Math.random()*(gameArea.clientWidth-60);
    const y = Math.random()*(gameArea.clientHeight-60);
    target.style.left = x+"px";
    target.style.top = y+"px";

    gameArea.appendChild(target);
    lastSpawn = Date.now();

    target.addEventListener("click", ()=>{
        const reaction = Date.now()-lastSpawn;
        reactionTimes.push(reaction);
        score++;
        scoreEl.textContent=score;
        spawnTarget();
    });
}

function getRank(score){
    if(score<10) return "Bronze";
    if(score<20) return "Silver";
    if(score<30) return "Gold";
    return "Radiant";
}

// 게임 종료 예시용 (10초 후 자동 종료)
setInterval(()=>{
    if(score>0){
        clearInterval(gameInterval);
        showResults();
        score=0;
    }
},10000);

function showResults(){
    if(score>bestScore){
        bestScore=score;
        localStorage.setItem("bestScore",bestScore);
        bestEl.textContent=bestScore;
    }

    rankEl.textContent=getRank(score);

    if(chart) chart.destroy();

    const ctx=document.getElementById("reactionChart");
    chart=new Chart(ctx,{
        type:"line",
        data:{
            labels:reactionTimes.map((_,i)=>i+1),
            datasets:[{
                label:"Reaction Time (ms)",
                data:reactionTimes,
                borderColor:"#ff4655",
                fill:false,
                tension:0.2
            }]
        },
        options:{
            responsive:true,
            plugins:{
                legend:{ display:true }
            }
        }
    });
}