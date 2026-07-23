from .models import CardDefinition

CARDS = [
    CardDefinition(id="stone_goblin", name="Stone Goblin", description="A quick, low-cost melee fighter.", cost=2, health=80, damage=18, speed=44, attack_interval=0.8, role="melee", emoji="🪨"),
    CardDefinition(id="iron_wolf", name="Iron Wolf", description="Fast attacker that pressures a lane.", cost=3, health=120, damage=24, speed=58, attack_interval=0.9, role="melee", emoji="🐺"),
    CardDefinition(id="fire_imp", name="Fire Imp", description="Fragile ranged elemental attacker.", cost=3, health=70, damage=30, speed=37, attack_interval=1.2, role="ranged", emoji="🔥"),
    CardDefinition(id="shield_troll", name="Shield Troll", description="Slow tank with high health.", cost=5, health=310, damage=22, speed=24, attack_interval=1.4, role="tank", emoji="🛡️"),
    CardDefinition(id="sky_bat", name="Sky Bat", description="A fast flying nuisance.", cost=2, health=65, damage=16, speed=64, attack_interval=0.7, role="flying", emoji="🦇"),
    CardDefinition(id="cannon_bug", name="Cannon Bug", description="Prioritizes enemy structures.", cost=4, health=155, damage=48, speed=30, attack_interval=1.6, role="siege", emoji="🐞"),
    CardDefinition(id="frost_lizard", name="Frost Lizard", description="Balanced creature with chilling attacks.", cost=4, health=165, damage=28, speed=35, attack_interval=1.1, role="control", emoji="🦎"),
    CardDefinition(id="storm_eagle", name="Storm Eagle", description="Flying ranged attacker.", cost=5, health=145, damage=42, speed=48, attack_interval=1.3, role="flying", emoji="🦅"),
    CardDefinition(id="lava_brute", name="Lava Brute", description="Expensive monster with crushing power.", cost=7, health=430, damage=65, speed=20, attack_interval=1.7, role="tank", emoji="🌋"),
    CardDefinition(id="heal_sprite", name="Heal Sprite", description="Light support creature.", cost=2, health=60, damage=12, speed=52, attack_interval=0.9, role="support", emoji="✨"),
]
