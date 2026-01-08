let player = {
  power:50,
  wrist:50,
  technique:50,
  stamina:50,
  mental:50
};

let gauge = 50;

const gaugeElem = document.getElementById("gauge");
const statusElem = document.getElementById("status");
const playerImg = document.getElementById("player");
const opponentImg = document.getElementById("opponent");

function updateStatus(){
  statusElem.innerText =
   `筋力:${player.power} 手首:${player.wrist} 技術:${player.technique}
スタミナ:${player.stamina} メンタル:${player.mental}`;
  gaugeElem.style.width = gauge + "%";
}

function train(type){
  player[type] += 5;
  if(player[type] > 100) player[type] = 100;
  updateStatus();
}

function startMatch(){
  let playerScore =
    player.power + player.wrist + player.technique +
    player.stamina + player.mental;

  let enemyScore = Math.random() * 400 + 200;

  gauge = Math.max(0, Math.min(100, 50 + (playerScore - enemyScore) / 8));

  if(gauge >= 50){
    document.getElementById("result").innerText = "勝利！";
    playerImg.style.transform = "translateX(40px)";
    opponentImg.style.transform = "translateX(-40px) scaleX(-1)";
  } else {
    document.getElementById("result").innerText = "敗北…";
    playerImg.style.transform = "translateX(-20px)";
    opponentImg.style.transform = "translateX(20px) scaleX(-1)";
  }

  updateStatus();

  setTimeout(()=>{
    playerImg.style.transform = "translateX(0)";
    opponentImg.style.transform = "scaleX(-1)";
    gauge = 50;
    updateStatus();
  }, 1000);
}

document.getElementById("playerSelect").addEventListener("change", e=>{
  playerImg.src = e.target.value;
});

updateStatus();
