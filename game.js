// ===== デバッグ確認 =====
console.log("game.js 読み込み成功");

// ==========================
// 敵キャラクター
// ==========================
const enemies = [
  { name: "赤井 剛", power: 14, stamina: 6, pattern: "burst", skill: "powerBurst" },
  { name: "青田 俊", power: 10, stamina: 10, pattern: "speed", skill: null },
  { name: "黒川 鉄", power: 9, stamina: 14, pattern: "defense", skill: "lock" }
];

let currentEnemyIndex = 0;

// ==========================
// プレイヤー
// ==========================
let player = { power: 10, stamina: 10 };

let gauge = 50;
let matchActive = false;
let loopId = null;

// 技状態
let hookActive = false;
let hookTimer = 0;
let enemySkillActive = false;
let enemySkillTimer = 0;

// ==========================
// CPUロジック
// ==========================
function cpuPower(enemy) {
  if (enemy.pattern === "burst") {
    return enemy.stamina > 3 ? enemy.power + 4 : enemy.power - 3;
  }
  if (enemy.pattern === "speed") {
    return enemy.power + Math.random() * 3;
  }
  if (enemy.pattern === "defense") {
    return enemy.power - 1;
  }
  return enemy.power;
}

// ==========================
// 試合開始
// ==========================
function startMatch() {
  if (matchActive) return;

  const enemy = enemies[currentEnemyIndex];
  if (!enemy) {
    document.getElementById("result").textContent = "🎉 全員撃破！";
    return;
  }

  matchActive = true;
  gauge = 50;
  player.stamina = 10;
  hookActive = false;
  enemySkillActive = false;

  document.getElementById("enemyName").textContent = enemy.name;
  document.getElementById("result").textContent = "";

  loopId = setInterval(gameLoop, 500);
}

// ==========================
// メインループ
// ==========================
function gameLoop() {
  const enemy = enemies[currentEnemyIndex];

  // 敵スキル発動
  if (!enemySkillActive && enemy.skill && Math.random() < 0.2 && enemy.stamina > 3) {
    activateEnemySkill(enemy);
  }

  let cpuForce = cpuPower(enemy);

  if (hookActive) cpuForce *= 0.5;
  if (enemySkillActive && enemy.skill === "powerBurst") cpuForce *= 2;
  if (enemySkillActive && enemy.skill === "lock") cpuForce *= 0.2;

  gauge += cpuForce * 0.3;
  enemy.stamina -= 0.3;
  player.stamina = Math.min(player.stamina + 0.2, 10);

  if (hookActive && --hookTimer <= 0) hookActive = false;
  if (enemySkillActive && --enemySkillTimer <= 0) enemySkillActive = false;

  updateGauge();

  if (gauge <= 0) endMatch(true);
  if (gauge >= 100) endMatch(false);
}

// ==========================
// 勝敗
// ==========================
function endMatch(win) {
  clearInterval(loopId);
  matchActive = false;

  document.getElementById("result").textContent =
    win ? "🏆 勝利！" : "💀 敗北…";

  if (win) currentEnemyIndex++;
}

// ==========================
// プレイヤー操作
// ==========================
function push() {
  if (!matchActive || player.stamina <= 0) return;
  gauge -= player.power * 0.4;
  player.stamina -= 0.5;
  updateGauge();
}

function useHook() {
  if (!matchActive || player.stamina < 3) return;
  hookActive = true;
  hookTimer = 3;
  player.stamina -= 3;
  document.getElementById("result").textContent = "🛡 フック！";
}

function useTopRoll() {
  if (!matchActive || player.stamina < 4) return;
  const enemy = enemies[currentEnemyIndex];
  enemy.stamina -= 3;
  gauge -= 6;
  player.stamina -= 4;
  document.getElementById("result").textContent = "⚡ トップロール！";
  updateGauge();
}

// ==========================
// 敵スキル
// ==========================
function activateEnemySkill(enemy) {
  enemySkillActive = true;

  if (enemy.skill === "powerBurst") {
    enemySkillTimer = 1;
    enemy.stamina -= 3;
    document.getElementById("result").textContent = "💥 敵の必殺！";
  }

  if (enemy.skill === "lock") {
    enemySkillTimer = 3;
    document.getElementById("result").textContent = "🔒 ロック状態！";
  }
}

// ==========================
// UI
// ==========================
function updateGauge() {
  gauge = Math.max(0, Math.min(100, gauge));
  document.getElementById("gauge").style.width = gauge + "%";
}
