// プレイヤーステータス
let player = {
    power: 50,
    wrist: 50,
    technique: 50,
    stamina: 50,
    mental: 50,
    totalWins: parseInt(localStorage.getItem("wins")||0)
};

// ゲージ
let gauge = 50;
let gaugeElem = document.getElementById("gauge");

// 更新表示
function updateStatus(){
    document.getElementById("status").innerText = 
        `筋力:${player.power} 手首:${player.wrist} 技術:${player.technique} スタミナ:${player.stamina} メンタル:${player.mental} | 通算勝利:${player.totalWins}`;
    gaugeElem.style.width = gauge + "%";
}

// 育成
function train(type){
    switch(type){
        case 'power': player.power+=5; break;
        case 'wrist': player.wrist+=5; break;
        case 'technique': player.technique+=5; break;
        case 'stamina': player.stamina+=5; break;
        case 'mental': player.mental+=5; break;
    }
    for(let key in player){ if(player[key]>100) player[key]=100; }
    alert(type+" トレーニング完了！");
    updateStatus();
}

// 休養
function rest(){
    player.stamina += 10;
    if(player.stamina>100) player.stamina=100;
    alert("休養完了！");
    updateStatus();
}

// キャラクター選択
document.getElementById("playerSelect").addEventListener("change", function(){
    document.getElementById("player").src = this.value;
});

// 試合
function startTournament(rank){
    let opponent = {
        power: Math.floor(Math.random()*50+40),
        wrist: Math.floor(Math.random()*50+40),
        technique: Math.floor(Math.random()*50+40),
        stamina: Math.floor(Math.random()*50+40),
        mental: Math.floor(Math.random()*50+40)
    };

    // 勝敗ゲージ計算
    let playerScore = player.power+player.wrist+player.technique+player.stamina+player.mental;
    let opponentScore = opponent.power+opponent.wrist+opponent.technique+opponent.stamina+opponent.mental;
    gauge = Math.max(0, Math.min(100, 50 + (playerScore-opponentScore)/2 + (Math.random()*20-10)));

    // 勝敗判定
    let resultText;
    let playerElem = document.getElementById("player");
    let oppElem = document.getElementById("opponent");
    if(gauge>=50){
        resultText = "勝利！";
        player.totalWins++;
        document.getElementById("winSE").play();
        // キャラクターアニメ
        playerElem.style.transform="translateX(50px)";
        oppElem.style.transform="translateX(-50px)";
    }else{
        resultText = "敗北…";
        document.getElementById("loseSE").play();
        playerElem.style.transform="translateX(-50px)";
        oppElem.style.transform="translateX(50px)";
    }

    document.getElementById("result").innerText = rank+"大会の結果: "+resultText;
    localStorage.setItem("wins",player.totalWins);
    updateStatus();

    // ゲージ初期化
    setTimeout(()=>{ playerElem.style.transform="translateX(0)"; oppElem.style.transform="translateX(0)"; gauge=50; updateStatus(); }, 1000);
}

updateStatus();
