const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 400;

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let rankDisplay = document.getElementById("rank");
document.getElementById("highScore").textContent = highScore;

let difficulty = "easy";
let gameTime = 30;
let intervalTime = 1000;
let timer;
let remainingTime;
let reactionTimes = [];
let lastSpawnTime;

const sensSlider = document.getElementById("sensitivity");
const sensValue = document.getElementById("sensValue");

sensSlider.addEventListener("input", ()=>{
sensValue.textContent = sensSlider.value;
});

document.querySelectorAll(".difficulty").forEach(btn=>{
btn.onclick=()=>{
difficulty = btn.dataset.mode;
if(difficulty==="easy") intervalTime=1000;
if(difficulty==="hard") intervalTime=700;
if(difficulty==="pro") intervalTime=450;
};
});

document.querySelectorAll(".timeBtn").forEach(btn=>{
btn.onclick=()=>{
gameTime = parseInt(btn.dataset.time);
};
});

document.getElementById("modeToggle").onclick=()=>{
document.body.classList.toggle("dark");
document.body.classList.toggle("light");
};

let target;

function spawnTarget(){
target = {
x:Math.random()*550+25,
y:Math.random()*350+25,
size:25,
shape:Math.floor(Math.random()*3)
};
lastSpawnTime = Date.now();
}

function drawTarget(){
if(!target) return;
ctx.fillStyle="#ff1744";

if(target.shape===0){
ctx.beginPath();
ctx.arc(target.x,target.y,target.size,0,Math.PI*2);
ctx.fill();
}else if(target.shape===1){
ctx.fillRect(target.x-20,target.y-20,40,40);
}else{
ctx.beginPath();
ctx.moveTo(target.x,target.y-25);
ctx.lineTo(target.x-25,target.y+25);
ctx.lineTo(target.x+25,target.y+25);
ctx.closePath();
ctx.fill();
}
}

canvas.onclick = (e)=>{
if(!target) return;
const rect = canvas.getBoundingClientRect();
const mx = (e.clientX-rect.left);
const my = (e.clientY-rect.top);

if(Math.hypot(mx-target.x,my-target.y)<30){
let reaction = Date.now()-lastSpawnTime;
reactionTimes.push(reaction);

let multiplier = 1;
if(remainingTime<=3) multiplier=1.5;
if(remainingTime<=5) multiplier=1.5;
if(remainingTime<=10) multiplier=1.5;

score += Math.floor(10*multiplier);
document.getElementById("score").textContent = score;
spawnTarget();
}
};

function updateRank(){
if(score<100) return "Bronze";
if(score<200) return "Silver";
if(score<350) return "Gold";
return "Pro";
}

function startGame(){
score=0;
reactionTimes=[];
remainingTime=gameTime;
document.getElementById("score").textContent=0;

spawnTarget();

timer=setInterval(()=>{
remainingTime--;
if(remainingTime<=0){
clearInterval(timer);
if(score>highScore){
localStorage.setItem("highScore",score);
document.getElementById("highScore").textContent=score;
}
rankDisplay.textContent = updateRank();
drawGraph();
}
},1000);

setInterval(spawnTarget,intervalTime);
}

document.getElementById("startBtn").onclick=startGame;

function gameLoop(){
ctx.clearRect(0,0,canvas.width,canvas.height);
drawTarget();
requestAnimationFrame(gameLoop);
}
gameLoop();

function drawGraph(){
const chart = document.getElementById("reactionChart");
const ctx2 = chart.getContext("2d");
chart.width=600;
chart.height=200;

ctx2.clearRect(0,0,600,200);

reactionTimes.forEach((time,i)=>{
ctx2.fillRect(i*10,200-time/5,8,time/5);
});
}

/* Three.js Gun */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,1,0.1,1000);
const renderer = new THREE.WebGLRenderer({alpha:true});
renderer.setSize(300,200);
document.getElementById("gunContainer").appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(3,0.5,0.5);
const material = new THREE.MeshBasicMaterial({color:0x333333});
const gun = new THREE.Mesh(geometry,material);
scene.add(gun);

camera.position.z=5;

function animateGun(){
requestAnimationFrame(animateGun);
gun.rotation.y+=0.01;
renderer.render(scene,camera);
}
animateGun();