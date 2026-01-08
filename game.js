let totalWins = parseInt(localStorage.getItem("wins")||0);
let gauge = 50; // 0～100で勝敗ゲージ
let gaugeElem = document.getElementById("gauge");

function updateStatus(){
    document.getElementById("status").innerText = "通算勝利: "+totalWins;
    gaugeElem.style.width = gauge + "%";
}

function train(type){
    alert(type+" トレーニング完了");
    gauge += 5; // 簡易でパワーUP
    if(gauge>100) gauge=100;
    updateStatus();
}

function rest(){
    alert("休養完了");
    gauge -= 5; // 休養で微調整
    if(gauge<0) gauge=0;
    updateStatus();
}

function startTournament(rank){
    // ランダム判定で勝敗決定
    let chance = Math.random()*100;
    let resultText = "";
    if(chance < gauge){ // ゲージが高いほど勝ちやすい
        resultText = "勝利！";
        totalWins++;
        document.getElementById("winSE").play();
    }else{
        resultText = "敗北…";
        document.getElementById("loseSE").play();
    }
    document.getElementById("result").innerText = rank+"大会の結果: "+resultText;
    localStorage.setItem("wins",totalWins);
    updateStatus();
    gauge = 50; // ゲージを初期化
}

updateStatus();
