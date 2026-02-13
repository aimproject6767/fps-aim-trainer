const gameArea = document.getElementById("gameArea");
const scoreEl = document.getElementById("score");
const accuracyEl = document.getElementById("accuracy");
const rankEl = document.getElementById("rank");
const comboText = document.getElementById("comboText");

let score=0;
let hits=0;
let shots=0;
let combo=0;
let comboTimer;
let spawnRate=1200;
let gameInterval;

function startGame(mode){
  score=0; hits=0; shots=0; combo=0;
  scoreEl.textContent=0;
  accuracyEl.textContent="0%";
  rankEl.textContent="Bronze";
  gameArea.innerHTML="";

  if(mode==="easy") spawnRate=1200;
  if(mode==="hard") spawnRate=900;
  if(mode==="pro") spawnRate=700;

  clearInterval(gameInterval);
  gameInterval=setInterval(()=>spawnTarget(),spawnRate);
}

function spawnTarget(){
  const target=document.createElement("div");
  target.className="target";

  const x=Math.random()*(gameArea.clientWidth-70);
  const y=Math.random()*(gameArea.clientHeight-70);
  target.style.left=x+"px";
  target.style.top=y+"px";

  target.onclick=()=>{
    shots++; hits++; combo++;

    clearTimeout(comboTimer);
    comboTimer=setTimeout(()=>{
      combo=0;
      removeEffects();
    },1200);

    score+=10*(1+combo*0.05);

    updateUI();
    applyEffects();
    target.remove();
  };

  gameArea.appendChild(target);

  setTimeout(()=>{
    if(target.parentNode){
      shots++;
      combo=0;
      updateUI();
      removeEffects();
      target.remove();
    }
  },spawnRate);
}

function updateUI(){
  scoreEl.textContent=Math.floor(score);
  accuracyEl.textContent=Math.round((hits/shots)*100)+"%";

  if(score>1000) rankEl.textContent="Diamond";
  else if(score>500) rankEl.textContent="Gold";
  else if(score>200) rankEl.textContent="Silver";
  else rankEl.textContent="Bronze";
}

function applyEffects(){
  if(combo>=2){
    comboText.textContent=combo+" COMBO";
    comboText.classList.add("comboShow");
    setTimeout(()=>comboText.classList.remove("comboShow"),500);
  }

  if(combo>=5) document.body.classList.add("comboGlow");
  if(combo>=10) document.body.classList.add("comboGlowHigh");
  if(combo>=20) document.body.classList.add("screenDistort");
}

function removeEffects(){
  document.body.classList.remove("comboGlow");
  document.body.classList.remove("comboGlowHigh");
  document.body.classList.remove("screenDistort");
}