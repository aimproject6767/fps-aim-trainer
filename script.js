const startBtn = document.getElementById("startBtn");
const gameArea = document.getElementById("gameArea");
const stats = document.getElementById("stats");
const darkToggle = document.getElementById("darkToggle");

let gameActive = false;
let hits = 0;
let misses = 0;
let maxTargets = 10;
let difficulty = "easy";

let currentTarget = null;
let targetTimeout = null;
let reactionTimes = [];
let targetStartTime;
let startTime;

/* 다크모드 */
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

/* 난이도 버튼 */
const difficultyContainer = document.createElement("div");
difficultyContainer.style.marginBottom = "15px";

["easy","hard","pro"].forEach(mode=>{
  const btn = document.createElement("button");
  btn.textContent = mode.toUpperCase();
  btn.classList.add("diff-btn");
  btn.style.marginRight = "8px";
  btn.style.opacity = mode==="easy"?"1":"0.5";

  btn.addEventListener("click",()=>{
    difficulty = mode;
    document.querySelectorAll(".diff-btn").forEach(b=>b.style.opacity="0.5");
    btn.style.opacity="1";
  });

  difficultyContainer.appendChild(btn);
});

gameArea.parentNode.insertBefore(difficultyContainer,gameArea);

/* HUD */
const hud = document.createElement("div");
hud.style.position="absolute";
hud.style.top="10px";
hud.style.left="50%";
hud.style.transform="translateX(-50%)";
hud.style.padding="8px 16px";
hud.style.borderRadius="20px";
hud.style.fontSize="13px";
hud.style.fontWeight="600";
hud.style.backdropFilter="blur(8px)";
hud.style.zIndex="100";
gameArea.appendChild(hud);

function updateHUD(){
  const accuracy = hits+misses===0?100:
  ((hits/(hits+misses))*100).toFixed(1);

  const avgReaction = reactionTimes.length===0?0:
  Math.round(reactionTimes.reduce((a,b)=>a+b,0)/reactionTimes.length);

  hud.style.background=document.body.classList.contains("dark")?
  "rgba(30,40,50,0.8)":"rgba(255,255,255,0.8)";

  hud.style.color=document.body.classList.contains("dark")?"#fff":"#111";

  hud.innerHTML=`
  🎯 ${hits} | ❌ ${misses} |
  🎯 ${accuracy}% |
  ⚡ ${avgReaction}ms |
  🎚 ${difficulty.toUpperCase()}
  `;
}

/* 카운트다운 */
function countdown(){
  return new Promise(resolve=>{
    let count=3;
    const counter=document.createElement("div");
    counter.style.position="absolute";
    counter.style.top="50%";
    counter.style.left="50%";
    counter.style.transform="translate(-50%,-50%)";
    counter.style.fontSize="80px";
    counter.style.fontWeight="bold";
    counter.style.color="#ff4655";
    gameArea.appendChild(counter);

    const interval=setInterval(()=>{
      counter.textContent=count;
      count--;
      if(count<0){
        clearInterval(interval);
        counter.remove();
        resolve();
      }
    },1000);
  });
}

/* 타겟 생성 */
function createTarget(){
  if(!gameActive) return;

  if(currentTarget) currentTarget.remove();
  clearTimeout(targetTimeout);

  const target=document.createElement("div");
  target.classList.add("target");

  const size=45;
  target.style.width=size+"px";
  target.style.height=size+"px";

  const x=Math.random()*(gameArea.clientWidth-size);
  const y=Math.random()*(gameArea.clientHeight-size);

  target.style.left=`${x}px`;
  target.style.top=`${y}px`;

  targetStartTime=Date.now();

  target.addEventListener("click",e=>{
    e.stopPropagation();
    const reaction=Date.now()-targetStartTime;
    reactionTimes.push(reaction);
    hits++;
    nextStep();
  });

  gameArea.appendChild(target);
  currentTarget=target;

  if(difficulty==="hard"||difficulty==="pro"){
    targetTimeout=setTimeout(()=>{
      misses++;
      nextStep();
    },1500);
  }

  updateHUD();
}

function nextStep(){
  if(currentTarget) currentTarget.remove();
  clearTimeout(targetTimeout);

  if(hits+misses>=maxTargets){
    endGame();
  } else {
    createTarget();
  }
}

/* 시작 */
startBtn.addEventListener("click",async()=>{
  if(gameActive) return;

  hits=0;
  misses=0;
  reactionTimes=[];
  stats.innerHTML="";
  gameActive=true;

  await countdown();
  startTime=Date.now();
  createTarget();
});

/* PRO 오클릭 */
gameArea.addEventListener("click",e=>{
  if(!gameActive) return;

  if(difficulty==="pro"){
    if(!e.target.classList.contains("target")){
      misses++;
      nextStep();
    }
  }
});

/* 티어 */
function getRank(avg){
  if(avg>=450) return "🟫 Bronze";
  if(avg>=350) return "🟩 Silver";
  if(avg>=250) return "🟦 Gold";
  if(avg>=180) return "🟪 Diamond";
  return "🔥 Challenger";
}

/* 종료 */
function endGame(){
  gameActive=false;

  const totalTime=((Date.now()-startTime)/1000).toFixed(2);
  const accuracy=((hits/(hits+misses))*100).toFixed(1);
  const avgReaction=Math.round(
    reactionTimes.reduce((a,b)=>a+b,0)/reactionTimes.length
  );

  const rank=getRank(avgReaction);

  let nextModeButton="";

  if(difficulty==="easy"){
    nextModeButton=`<button id="nextModeBtn" class="next-btn">
    🔥 Hard 모드 도전하기</button>`;
  } else if(difficulty==="hard"){
    nextModeButton=`<button id="nextModeBtn" class="next-btn">
    ⚡ Pro 모드 도전하기</button>`;
  } else {
    nextModeButton=`<button id="nextModeBtn" class="next-btn">
    🏆 한 번 더 Challenger 도전</button>`;
  }

  stats.innerHTML=`
  <h2>🏁 결과</h2>
  ⏱ ${totalTime}초<br>
  🎯 정확도: ${accuracy}%<br>
  ⚡ 평균 반응속도: ${avgReaction}ms<br><br>
  🏆 티어: <b>${rank}</b><br><br>
  ${nextModeButton}
  `;

  const nextBtn=document.getElementById("nextModeBtn");
  if(nextBtn){
    nextBtn.addEventListener("click",()=>{
      if(difficulty==="easy") difficulty="hard";
      else if(difficulty==="hard") difficulty="pro";

      document.querySelectorAll(".diff-btn")
      .forEach(b=>b.style.opacity="0.5");

      document.querySelectorAll(".diff-btn")
      .forEach(b=>{
        if(b.textContent.toLowerCase()===difficulty){
          b.style.opacity="1";
        }
      });

      stats.innerHTML="";
      startBtn.click();
    });
  }

  saveScore(totalTime,accuracy,avgReaction,rank);
}

/* 로컬 리더보드 저장 */
function saveScore(time,accuracy,avgReaction,rank){
  let nickname=prompt("닉네임 입력 (10글자 제한)");
  if(!nickname) nickname="익명";

  let leaderboard=
  JSON.parse(localStorage.getItem("leaderboard"))||[];

  leaderboard.push({
    name:nickname.substring(0,10),
    time:parseFloat(time),
    accuracy,
    reaction:avgReaction,
    rank,
    mode:difficulty
  });

  leaderboard.sort((a,b)=>a.time-b.time);
  leaderboard=leaderboard.slice(0,5);

  localStorage.setItem("leaderboard",
  JSON.stringify(leaderboard));
}