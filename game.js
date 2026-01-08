const enemies = [
  {
    name: "赤井 剛",
    power: 14,
    stamina: 6,
    pattern: "burst"
  },
  {
    name: "青田 俊",
    power: 10,
    stamina: 10,
    pattern: "speed"
  },
  {
    name: "黒川 鉄",
    power: 9,
    stamina: 14,
    pattern: "defense"
  }
];

let currentEnemyIndex = 0;
let player = {
  power: 10,
  stamina: 10
};
let gauge = 50; // 0 = プレイヤー勝利 / 100 = CPU勝利
let matchActive = false;
function cpuPower(enemy) {
  switch (enemy.pattern) {
    case "burst": // 赤井：最初だけ強い
      return enemy.stamina > 3 ? enemy.power + 4 : enemy.power - 3;

    case "speed": // 青田：安定
      return enemy.power + Math.random() * 3;

    case "defense": // 黒川：粘る
      return enemy.power - 1;

    default:
      return enemy.power;
  }
}
function push() {
  if (!matchActive) return;

  gauge -= player.power * 0.4;
  player.stamina -= 0.5;

  updateGauge();
}
function startMatch() {
  matchActive = true;
  gauge = 50;

  const enemy = enemies[currentEnemyIndex];

  document.getElementById("enemyName").textContent = enemy.name;
  document.getElementById("result").textContent = "";

  const interval = setInterval(() => {
    if (!matchActive) {
      clearInterval(interval);
      return;
    }

    const cpu = cpuPower(enemy);
    gauge += cpu * 0.3;

    enemy.stamina -= 0.3;
    player.stamina += 0.2; // 自然回復

    updateGauge();

    if (gauge <= 0) {
      endMatch(true);
      clearInterval(interval);
    } else if (gauge >= 100) {
      endMatch(false);
      clearInterval(interval);
    }
  }, 500);
}
function endMatch(win) {
  matchActive = false;

  const result = document.getElementById("result");

  if (win) {
    result.textContent = "🏆 勝利！";
    currentEnemyIndex++;
  } else {
    result.textContent = "💀 敗北…";
  }

  player.stamina = 10;
}
function updateGauge() {
  document.getElementById("gauge").style.width = gauge + "%";
}
let hookActive = false;
let hookTimer = 0;
function useHook() {
  if (!matchActive || player.stamina < 3) return;

  hookActive = true;
  hookTimer = 3; // 3ターン有効
  player.stamina -= 3;

  document.getElementById("result").textContent = "🛡 フック！防御体勢！";
}
function useTopRoll() {
  if (!matchActive || player.stamina < 4) return;

  const enemy = enemies[currentEnemyIndex];

  enemy.stamina -= 3;
  gauge -= 5; // 一気に押す
  player.stamina -= 4;

  document.getElementById("result").textContent = "⚡ トップロール！相手の腕を崩した！";

  updateGauge();
}
const cpu = cpuPower(enemy);

// フック中はCPUの力を軽減
let cpuForce = cpu;
if (hookActive) {
  cpuForce *= 0.5;
}

gauge += cpuForce * 0.3;
if (hookActive) {
  hookTimer--;
  if (hookTimer <= 0) {
    hookActive = false;
  }
}
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
let enemySkillActive = false;
let enemySkillTimer = 0;
// 敵が技を使う判定
if (!enemySkillActive && enemy.skill && Math.random() < 0.2 && enemy.stamina > 3) {
  activateEnemySkill(enemy);
}
function activateEnemySkill(enemy) {
  enemySkillActive = true;

  if (enemy.skill === "powerBurst") {
    enemySkillTimer = 1;
    enemy.stamina -= 3;
    document.getElementById("result").textContent = "💥 敵のパワーバースト！";
  }

  if (enemy.skill === "lock") {
    enemySkillTimer = 3;
    document.getElementById("result").textContent = "🔒 敵が腕をロックした！";
  }
}
let cpuForce = cpu;

// フック軽減
if (hookActive) {
  cpuForce *= 0.5;
}

// 敵パワーバースト
if (enemySkillActive && enemy.skill === "powerBurst") {
  cpuForce *= 2;
}

// 黒川ロック：ゲージ変動を抑える
if (enemySkillActive && enemy.skill === "lock") {
  cpuForce *= 0.2;
}
if (enemySkillActive) {
  enemySkillTimer--;
  if (enemySkillTimer <= 0) {
    enemySkillActive = false;
  }
}
