armwrestle_app/
├─ index.html
├─ style.css
├─ game.js
├─ manifest.json
├─ service-worker.js
├─ win.mp3
├─ lose.mp3
├─ icon-192.png
├─ icon-512.png
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>アームレスリング育成ゲーム</title>
  <link rel="stylesheet" href="style.css">
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#222222">
</head>
<body>
  <h1>アームレスリング育成ゲーム</h1>

  <div id="status">
    <p id="playerStats">ステータス表示</p>
    <p id="fatigue">疲労:0</p>
    <p id="injury"></p>
  </div>

  <div id="controls">
    <button onclick="train('power')">筋力トレーニング</button>
    <button onclick="train('wrist')">手首トレーニング</button>
    <button onclick="train('technique')">技術トレーニング</button>
    <button onclick="train('stamina')">スタミナトレーニング</button>
    <button onclick="train('mental')">メンタルトレーニング</button>
    <button onclick="rest()">休養</button>
  </div>

  <hr>

  <div id="battle">
    <div id="gauge-bg"><div id="gauge"></div></div>
    <button onclick="startTournament('local')">地方大会</button>
    <button onclick="startTournament('national')">全国大会</button>
    <button onclick="startTournament('world')">世界大会</button>
  </div>

  <p id="result"></p>
  <p id="ranking">🏆 通算勝利数：0</p>

  <audio id="winSE" src="win.mp3"></audio>
  <audio id="loseSE" src="lose.mp3"></audio>

  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>

  <script src="game.js"></script>
</body>
</html>
body { font-family:sans-serif; text-align:center; padding:20px; background:#111; color:#eee; }
button { padding:10px 20px; margin:5px; font-size:16px; }
#gauge-bg { width:100%; height:20px; background:#444; margin:20px 0; border-radius:10px; }
#gauge { height:100%; width:50%; background:linear-gradient(to right, red, yellow, green); transition: width 0.3s; border-radius:10px; }
// Firebase初期化
const firebaseConfig = { apiKey:"YOUR_KEY", authDomain:"YOUR_DOMAIN", projectId:"YOUR_PROJECT_ID" };
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
auth.signInAnonymously();

// プレイヤークラス
class ArmWrestler {
  constructor(name){ 
    this.name=name;
    this.power=70; this.wrist=65; this.technique=60;
    this.maxStamina=80; this.stamina=80;
    this.mental=60;
    this.fatigue=0; this.injury=false;
    this.reaction=Math.floor(Math.random()*61)+40;
  }
  growth(value, base, sponsorKey=null, sponsorEffect=null){
    let gain=Math.floor(base*(100-value)/100);
    if(sponsorKey && sponsorEffect && sponsorEffect[sponsorKey]) gain=Math.floor(gain*sponsorEffect[sponsorKey]);
    return gain;
  }
  train(menu,sponsor=null){
    if(this.injury) return `🤕 ケガ中でトレーニング不可`;
    if(this.fatigue>=80) return `😵 疲労が溜まりすぎ`;

    let msg="";
    if(menu==="power"){ let g=this.growth(this.power,5,"power_growth",sponsor); this.power+=g; this.fatigue+=15; if(Math.random()<0.15){this.injury=true; msg=`💥 筋力+${g} しかしケガ`; }else{msg=`💪 筋力+${g}`;} }
    else if(menu==="wrist"){ let g=this.growth(this.wrist,4,"wrist_growth",sponsor); this.wrist+=g; this.fatigue+=10; msg=`🤚 手首+${g}`; }
    else if(menu==="technique"){ let g=this.growth(this.technique,3,"tech_growth",sponsor); this.technique+=g; this.fatigue+=8; msg=`🎯 技術+${g}`; }
    else if(menu==="stamina"){ let g=this.growth(this.maxStamina,4,"stamina_growth",sponsor); this.maxStamina+=g; this.stamina+=g; this.fatigue+=10; msg=`🏃 スタミナ+${g}`; }
    else if(menu==="mental"){ if(Math.random()<0.2){this.fatigue+=5; msg=`🧠 集中できず失敗`; } else { let g=this.growth(this.mental,3,"mental_growth",sponsor); this.mental+=g; this.fatigue+=5; msg=`🧠 メンタル+${g}`; } }
    updateStatus();
    return msg;
  }
  rest(){ this.fatigue=Math.max(0,this.fatigue-30); this.stamina=this.maxStamina; if(this.injury && Math.random()<0.4){this.injury=false; return "🩹 休養でケガが治った"; } updateStatus(); return "😌 休養して回復した"; }
}

// グローバル
let player = new ArmWrestler("PLAYER");
let sponsor = null;
let totalWins = parseInt(localStorage.getItem("wins")||0);

// UI更新
function updateStatus(){
  document.getElementById("playerStats").innerText=`筋力:${player.power} 手首:${player.wrist} 技術:${player.technique} スタミナ:${player.stamina}/${player.maxStamina} メンタル:${player.mental}`;
  document.getElementById("fatigue").innerText=`疲労:${player.fatigue}`;
  document.getElementById("injury").innerText=player.injury?"⚠ ケガ中":"";
}

// トレーニング
function train(menu){ let msg=player.train(menu,sponsor); alert(msg); }

// バトル・大会
function createCPU(rank,matchNum){ return new ArmWrestler(`CPU_${rank}_${matchNum}`); }
function startTournament(rank){
  if(player.injury){ alert("🤕 ケガで大会棄権"); return; }
  let rounds={"local":3,"national":4,"world":5}[rank];
  alert(`${rank.toUpperCase()}大会開始`);
  for(let i=1;i<=rounds;i++){ let cpu=createCPU(rank,i); fightMatch(cpu); player.fatigue+=10; if(player.stamina<=0||player.injury){ alert("❌ 敗北…大会終了"); return; } }
  alert(`🏆 ${rank.toUpperCase()}大会優勝！`);
  totalWins+=rounds; localStorage.setItem("wins",totalWins);
  submitScore(player.name,totalWins*10,totalWins); loadRanking();
}

// 戦術選択バトル
function fightMatch(cpu){
  let tech=prompt("技を選択 (toproll / hook / press)",""); if(!tech) tech="toproll";
  let gauge=document.getElementById("gauge"); gauge.style.width=(Math.random()*100)+"%";
  let resultText=document.getElementById("result");

  let win=false;
  if((tech==="toproll"&&cpu.technique%3===0)||(tech==="hook"&&cpu.technique%3===1)||(tech==="press"&&cpu.technique%3===2)) win=true;

  if(win){ resultText.innerText=`勝利 vs ${cpu.name}`; document.getElementById("winSE").play(); navigator.vibrate(100); totalWins+=1; }
  else{ resultText.innerText=`敗北 vs ${cpu.name}`; document.getElementById("loseSE").play(); navigator.vibrate([50,50,50]); player.fatigue+=30; player.stamina=Math.max(0,player.stamina-20); }
  updateStatus();
}

// 世界ランキング
function submitScore(name,rating,wins){ const uid=auth.currentUser.uid; db.collection("players").doc(uid).set({name,rating,wins,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}); }
function loadRanking(){ db.collection("players").orderBy("rating","desc").limit(10).get().then(snapshot=>{ let text="🌍 世界ランキング\n"; let rank=1; snapshot.forEach(doc=>{const p=doc.data(); text+=`${rank}. ${p.name} (${p.rating})\n`; rank++;}); document.getElementById("ranking").innerText=text; }); }

// 初期化
updateStatus(); loadRanking();
{
  "name": "Arm Wrestling Game",
  "short_name": "ArmWrestle",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#111111",
  "theme_color": "#222222",
  "orientation": "portrait",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
const CACHE_NAME = "armwrestle-v1";
const urlsToCache = ["./", "./index.html", "./style.css", "./game.js", "./manifest.json"];
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))); });
self.addEventListener("fetch", event => { event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request))); });
