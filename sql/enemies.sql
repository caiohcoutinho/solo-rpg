CREATE TABLE IF NOT EXISTS enemies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    description TEXT,
    combat_strategy VARCHAR(255),
    corpus INT,
    willpower INT,
    dodge_dice INT,
    soak_dice INT,
    attack_1 VARCHAR(255),
    hit_dice_1 INT,
    damage_1 INT,
    special_effect_1 VARCHAR(255),
    attack_2 VARCHAR(255),
    hit_dice_2 INT,
    damage_2 INT,
    special_effect_2 VARCHAR(255)
);

ALTER TABLE enemies
ADD COLUMN IF NOT EXISTS portrait TEXT;


INSERT INTO enemies (
    name,
    description,
    combat_strategy,
    corpus,
    willpower,
    dodge_dice,
    soak_dice,
    attack_1,
    hit_dice_1,
    damage_1,
    special_effect_1,
    attack_2,
    hit_dice_2,
    damage_2,
    special_effect_2
) VALUES
(
    'Stray Hound',
    'A mangy black dog driven feral by the energies of the Shadowlands. Fast, hungry, and fearless.',
    'Rushes the closest target and never retreats.',
    5, 2, 2, 1,
    'Bite', 3, 2, 'Chance to stagger',
    'Tackle', 2, 2, 'Knocks target prone'
),
(
    'Restless Crow Swarm',
    'A cloud of spectral crows whose razor beaks strip Corpus instead of flesh.',
    'Harasses isolated enemies while staying mobile.',
    4, 3, 4, 0,
    'Pecking Swarm', 3, 1, 'None',
    'Distracting Flurry', 2, 0, 'Target suffers -1 die on next attack'
),
(
    'Cemetery Rat',
    'A corpse-sized ghostly rat with exposed ribs and glowing teeth.',
    'Circles until it finds an opening, then lunges.',
    4, 2, 3, 1,
    'Bite', 2, 2, 'None',
    'Sweep Legs', 2, 1, 'Knocks target prone'
),
(
    'Ash Zombie',
    'A slow humanoid made from compacted ash and burned bones.',
    'Slowly advances while absorbing punishment.',
    7, 4, 1, 4,
    'Heavy Strike', 2, 3, 'None',
    'Clinch', 2, 2, 'Continues crushing each turn'
),
(
    'Hollow Laborer',
    'The ghost of a construction worker whose tools became part of his Corpus.',
    'Relentlessly swings until destroyed.',
    6, 3, 2, 2,
    'Rusty Pipe Strike', 3, 3, 'None',
    'Weapon Hook', 2, 2, 'Target loses next weapon attack unless they break free'
),
(
    'Tindlehound',
    'A massive soot-black beast with three snarling heads and burning green eyes.',
    'Charges dangerous opponents first and keeps them pinned.',
    12, 7, 5, 5,
    'Triple Bite', 6, 5, 'None',
    'Crushing Tackle', 5, 4, 'Knocks target prone'
),
(
    'Ferryman Renegade',
    'A fallen boatman wearing broken Stygian armor and wielding a long polearm.',
    'Controls distance before finishing weakened foes.',
    10, 6, 4, 4,
    'Polearm Strike', 5, 5, 'None',
    'Disarm', 4, 0, 'Target drops held weapon'
),
(
    'Bone Stalker',
    'A skeletal predator assembled from dozens of mismatched animal bones.',
    'Uses speed to isolate and overwhelm a single victim.',
    9, 5, 6, 3,
    'Claw Frenzy', 5, 4, 'None',
    'Hold', 4, 2, 'Immobilizes while maintained'
),
(
    'Ash Warden Patrolman',
    'An armored Hierarchy enforcer carrying a relic shotgun and iron baton.',
    'Suppresses targets before closing into melee.',
    11, 6, 4, 5,
    'Baton Strike', 5, 4, 'None',
    'Shotgun Blast', 4, 5, 'None'
),
(
    'Sorrow Widow',
    'A ghostly woman whose elongated arms drag chains of condensed grief across the ground.',
    'Restrains prey before delivering devastating blows.',
    10, 6, 5, 3,
    'Chain Lash', 5, 4, 'None',
    'Soul Snare', 4, 1, 'Hold; victim remains restrained until escaping'
);