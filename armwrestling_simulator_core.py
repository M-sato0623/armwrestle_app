"""
Armwrestling Competition Simulator - Core Engine (MVP)
思想：競技再現・癖学習・トーナメント対応
"""

import random
from collections import defaultdict

# ==============================
# 選手モデル
# ==============================
class Fighter:
    def __init__(self, name, weight, style, dominant="right"):
        self.name = name
        self.weight = weight
        self.style = style
        self.dominant = dominant

        # 基本能力
        self.power = 70
        self.tech = 70
        self.nerve = 100

        # 部位耐久
        self.parts = {
            "wrist": 100,
            "fingers": 100,
            "elbow": 100,
            "shoulder": 100
        }

        # 癖記録
        self.habits = defaultdict(int)

    def damage_penalty(self):
        return sum(100 - v for v in self.parts.values()) * 0.002

    def is_broken(self):
        return any(v <= 0 for v in self.parts.values())


# ==============================
# スタイル定義（実在思想）
# ==============================
STYLE_BONUS = {
    "levan": {"press": 1.3, "top": 1.2},
    "todd": {"hook": 1.3, "defend": 1.2},
    "hand": {"top": 1.3, "fingers": 1.2},
    "balanced": {}
}

# ==============================
# 技定義
# ==============================
TECHS = {
    "press": {"target": "elbow", "nerve": -18},
    "hook": {"target": "shoulder", "nerve": -12},
    "top": {"target": "wrist", "nerve": -15},
    "fingers": {"target": "fingers", "nerve": -14},
    "defend": {"target": None, "nerve": +8}
}

# ==============================
# 力計算
# ==============================
def calc_force(fighter, tech_name):
    base = fighter.power * 0.6 + fighter.tech * 0.4
    nerve_rate = fighter.nerve / 100
    penalty = fighter.damage_penalty()

    force = base * nerve_rate * (1 - penalty)

    if fighter.style in STYLE_BONUS:
        force *= STYLE_BONUS[fighter.style].get(tech_name, 1.0)

    return force * random.uniform(0.85, 1.15)

# ==============================
# AI（癖学習）
# ==============================
def ai_choose(player_habits, cpu_style):
    if not player_habits:
        return random.choice(list(TECHS.keys()))

    most_used = max(player_habits, key=player_habits.get)
    counter = {
        "press": "defend",
        "hook": "top",
        "top": "hook",
        "fingers": "press"
    }

    if random.random() < 0.7:
        return counter.get(most_used, random.choice(list(TECHS.keys())))
    return random.choice(list(TECHS.keys()))

# ==============================
# 試合エンジン（プレイヤー操作＋セットアップ＋ファウル）
# ==============================
def foul_check(tech, nerve, referee_level):
    """ファウル判定: referee_level 1=甘い 2=普通 3=厳しい"""
    base = {
        "press": 0.15,
        "hook": 0.10,
        "top": 0.12,
        "fingers": 0.18,
        "defend": 0.05
    }[tech]

    nerve_factor = (100 - nerve) / 100
    referee_factor = {"1": 0.6, "2": 1.0, "3": 1.5}[referee_level]

    foul_rate = base * (1 + nerve_factor) * referee_factor
    return random.random() < foul_rate


def match(f1: Fighter, f2: Fighter, verbose=True):
    angle = 0

    # ---- セットアップ ----
    print("
【セットアップ】")
    print("ナックル高さ: 1=低い 2=標準 3=高い")
    knuckle = input("選択: ")

    print("親指位置: 1=浅い 2=標準 3=深い")
    thumb = input("選択: ")

    print("審判厳しさ: 1=甘い 2=普通 3=厳しい")
    referee = input("選択: ")

    f1_fouls = 0

    for turn in range(1, 16):
        if abs(angle) >= 10 or f1.is_broken() or f2.is_broken():
            break

        print(f"
--- Turn {turn} ---")
        print(f"角度: {angle}")
        print(f"神経: {f1.nerve}  | ファウル: {f1_fouls}")
        print("技を選択: press / hook / top / fingers / defend")

        p_tech = input("選択: ").strip()
        if p_tech not in TECHS:
            p_tech = "defend"

        f1.habits[p_tech] += 1
        c_tech = ai_choose(f1.habits, f2.style)

        # ---- ファウル判定 ----
        if foul_check(p_tech, f1.nerve, referee):
            f1_fouls += 1
            print("⚠️ ファウル！")
            if f1_fouls >= 2:
                print("❌ 失格負け")
                return f2
            continue

        f1.nerve = max(0, f1.nerve + TECHS[p_tech]["nerve"])
        f2.nerve = max(0, f2.nerve + TECHS[c_tech]["nerve"])

        f1_force = calc_force(f1, p_tech)
        f2_force = calc_force(f2, c_tech)

        diff = f1_force - f2_force
        angle += int(diff / 15)

        if TECHS[p_tech]["target"]:
            f2.parts[TECHS[p_tech]["target"]] -= int(abs(diff) * 0.4)
        if TECHS[c_tech]["target"]:
            f1.parts[TECHS[c_tech]["target"]] -= int(abs(diff) * 0.4)

        if verbose:
            print(f"あなた:{p_tech} vs CPU:{c_tech} | 力差 {int(diff)}")
            print("CPU部位:", f2.parts)

    return f1 if angle > 0 else f2

# ==============================
# トーナメント
# ==============================
def tournament(fighters):
    random.shuffle(fighters)
    round_no = 1

    while len(fighters) > 1:
        print(f"\n=== Round {round_no} ===")
        winners = []

        for i in range(0, len(fighters), 2):
            w = match(fighters[i], fighters[i+1])
            print(f"Winner: {w.name}")
            winners.append(w)

        fighters = winners
        round_no += 1

    print(f"\n🏆 Champion: {fighters[0].name}")


# ==============================
# デモ実行
# ==============================
if __name__ == "__main__":
    player = Fighter("PLAYER", 110, "hand")
    cpu1 = Fighter("LEVAN_AI", 180, "levan")
    cpu2 = Fighter("TODD_AI", 115, "todd")

    tournament([player, cpu1, cpu2])
