let totalWins = parseInt(localStorage.getItem("wins")||0);
function updateStatus(){ document.getElementById("status").innerText = "通算勝利: "+totalWins; }
function train(type){ alert(type+" トレーニング完了"); }
function rest(){ alert("休養完了"); }
function startTournament(rank){ alert(rank+"大会開始！"); totalWins++; localStorage.setItem("wins",totalWins); updateStatus(); }
updateStatus();