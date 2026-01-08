// ==========================
// キャラクター定義
// ==========================
const enemies = [
  {
    name: "赤井 剛",
    power: 14,
    stamina: 6,
    pattern: "burst",
    skill: "powerBurst"
  },
  {
    name: "青田 俊",
    power: 10,
    stamina: 10,
    pattern: "speed",
    skill: null
  },
  {
    name: "黒川 鉄",
    power: 9,
    stamina: 14,
    pattern: "defense",
    skill: "lock"
  }
];

let currentEnemyIndex = 0;

// ==========================
// プレイヤー状態
// ==========================
let player = {
  power: 10,
  stamina: 10
};

let gauge = 50; // 0=勝利 / 100=敗北
let matchActive = false;
let loopId = null;

// 技状態
let hookActive = false;
let hookTimer = 0;

// 敵スキル
let enemySkillActive = false;
let enemySkillTimer = 0;

// ==========================
// CPU 行動ロジック
// ==========================
function cpuPower(enemy) {
  switch (enemy.pattern) {
    case "burst":
      return enemy.stamina > 3 ? enemy.power + 4 : enemy.power - 3;
    case "speed":
      return enemy.power + Math.random() * 3;
    case "defense":
      return enemy.power - 1;
    default:
      return enemy.power;
  }
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
  enemy.stamina = enemy.stamina; // 初期値維持

  hookActive = false;
  enemySkillActive = false;

  document.getElementById("enemyName").textContent = enemy.name;
  document.getElementById("result").textContent = "";

  loopId = setInterval(gameLoop, 500);
}

// ==========================
// メインゲームループ
// ==========================
function gameLoop() {
  const enemy = enemies[currentEnemyIndex];

  // --- 敵の技発動判定 ---
  if (!enemySkillActive && enemy.skill && Math.random() < 0.2 && enemy.stamina > 3) {
    activateEnemySkill(enemy);
  }

  // --- CPU 力計算 ---
  let cpuForce = cpuPower(enemy);

  if (hookActive) cpuForce *= 0.5;
  if (enemySkillActive && enemy.skill === "powerBurst") cpuForce *= 2;
  if (enemySkillActive && enemy.skill === "lock") cpuForce *= 0.2;

  // --- ゲージ変動 ---
  gauge += cpuForce * 0.3;
  enemy.stamina -= 0.3;
  player.stamina = Math.min(player.stamina + 0.2, 10);

  // --- タイマー処理 ---
  if (hookActive && --hookTimer <= 0) hookActive = false;
  if (enemySkillActive && --enemySkillTimer <= 0) enemySkillActive = false;

  updateGauge();

  // --- 勝敗判定 ---
  if (gauge <= 0) endMatch(true);
  if (gauge >= 100) endMatch(false);
}

// ==========================
// 勝敗処理
// ==========================
function endMatch(win) {
  clearInterval(loopId);
  matchActive = false;

  if (win) {
    document.getElementById("result").textContent = "🏆 勝利！";
    currentEnemyIndex++;
  } else {
    document.getElementById("result").textContent = "💀 敗北…";
  }
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

  document.getElementById("result").textContent = "🛡 フック！防御体勢！";
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
