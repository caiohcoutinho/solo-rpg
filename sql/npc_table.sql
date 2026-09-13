CREATE TABLE IF NOT EXISTS npcs (
    uuid UUID PRIMARY KEY,
    name TEXT NOT NULL,
    gender CHAR(1) NOT NULL CHECK (gender IN ('M', 'F'))
);

ALTER TABLE npcs
ADD COLUMN IF NOT EXISTS portrait TEXT;

ALTER TABLE npcs
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE npcs
ADD COLUMN IF NOT EXISTS in_scene BOOLEAN DEFAULT FALSE;

ALTER TABLE npcs
ADD COLUMN IF NOT EXISTS background TEXT;

INSERT INTO npcs (uuid, name, gender, portrait, created_at, in_scene, background)
VALUES ('9d80d4d4-2c3c-4f7a-8d0f-39fe7f2b0324', 'Maria', 'F', 'maria.png', CURRENT_TIMESTAMP, TRUE, 'Maria was the youngest daughter of a miller, remembered as quiet, kind, and rarely seen without a distant expression. During a particularly harsh winter, she vanished while walking home after dusk. Search parties found only her footprints, ending abruptly beside a frozen stream. Her body was never recovered. For years, villagers claimed to glimpse her standing in silence along lonely roads or staring through frost-covered windows. Unlike other spirits, Maria never attacked or spoke. She simply watched, her hollow eyes fixed on anyone who crossed her path. Old folklore says Maria became trapped between the living world and the next because no one ever learned the truth of her death. Some believe she slipped beneath the ice and was carried away unseen. Others whisper that someone followed her into the woods that evening and ensured she would never return. Her ghost appears exactly as she was remembered in her final days: pale, motionless, with gently drifting hair and an expression emptied of fear, sorrow, and anger alike. Those who meet her often report a strange certainty that she is searching—not for vengeance, but for the one memory she lost when she died. Until that memory is restored, Maria wanders in silence, unable to leave the world behind.')
ON CONFLICT (uuid) DO UPDATE
SET name = EXCLUDED.name,
    gender = EXCLUDED.gender,
    portrait = EXCLUDED.portrait,
    created_at = COALESCE(npcs.created_at, EXCLUDED.created_at),
    in_scene = EXCLUDED.in_scene;
    background = EXCLUDED.background;

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, background)
VALUES (uuid_generate_v4(),'Harry Baker', 'M', 'harry,png', true, 'Harry Baker is a 38-year-old construction manager, husband to Christine, and father of two daughters: three-year-old Bethany and five-month-old Kaetlyn. Outwardly he looks like an ordinary working man, usually wearing a baseball cap, a plaid shirt beneath a work vest, jeans, and a short beard. Beneath that familiar appearance, however, his home life has been deteriorating. Financial strain, the demands of raising two young children, a lack of intimacy in his marriage, and Bethany''s frequent tantrums have left him exhausted and increasingly volatile. Harry has developed a destructive temper, lashing out by yelling at his family, striking walls, and breaking furniture—behavior he regrets but has been unable to control. Harry''s final day began like any other. After submitting reports that exposed misconduct at work, several dismissed coworkers sabotaged his pickup truck in retaliation. Unaware of the damage, Harry collected Bethany and Kaetlyn from childcare and started the drive home. The truck failed on a riverside road, sending all three into the water. Harry fought desperately to save his daughters, carrying baby Kaetlyn to the riverbank before diving back toward Bethany''s cries. In the next instant, he awoke alone on the roadside in a cold, silent world. The pickup truck was slowly sinking beneath the river''s surface, his daughters were nowhere to be seen, and he had no idea that he had crossed into the Shadowlands.');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, background)
VALUES (uuid_generate_v4(), 'Shadow', 'M', 'shadow.png', true, 'It sits just behind your eyes, a heavy, suffocating cold that never warms up, no matter how bright the underworld’s fires burn. The Shadow is not merely a passenger in your mind; it is a parasitic architect, a sentient shard of Oblivion itself that crawled into your soul the exact moment you crossed the Shroud. It knows your deepest shames, your quietest regrets, and the exact pitch of your mother’s voice—and it uses all of them as weapons. It breathes when you breathe, waiting in the silence between your thoughts, a tireless, malicious twin whispering that every choice you make is a failure, and every bond you hold is a lie. Its goal is a patient, agonizing erosion. Brutally direct, the Shadows is all about pain and greed. Whatever it wants, it will command you to take. Whatever it hates, it will demand that you destroy. If you refuse, it will try to destroy you as well, for it cannot stand to be resisted in any way. There’s no compromise or subtlety in her ways To see the Shadow dominant is to see a sneak peek of Spectrehood. It will lay waste to anything in its path, taking what it wants and destroying everything else out of sheer spite. Guttural and vulgar, the Shadows rarely has anything to say that isn’t an obscenity. Why bother being polite to anyone else when they’re nothing more than obstacles to your pleasure?');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, background)
VALUES (uuid_generate_v4(), 'Elias Crowe', 'M', 'elias_crowe.png', true, 'Elias Crowe speaks as though every conversation is an interruption. He answers questions with the fewest words possible and rarely volunteers information unless he believes it will keep someone alive. He has no patience for self-pity, heroics, or grand ideals. When Harry asks whether things will get better, Elias doesn''t answer. Instead, he teaches him how to hide from a Spectre, how to recognize a Nihil, or how to tell when another wraith is lying. To Elias, surviving another day is the only lesson worth learning.');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, background)
VALUES (uuid_generate_v4(), 'Ash Wardens', 'M', 'ash_wardens.png', true, 'The Ash Wardens are the local arm of the Hierarchy in Pinewood County, a disciplined patrol that keeps order through intimidation, routine, and absolute obedience to Stygian law. They hunt for newly dead wraiths to register or conscript, settle disturbances without mercy, and view unaligned ghosts as problems waiting to happen. To them, Harry is just another lost soul until his repeated refusal to cooperate turns him into someone worth watching.');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, background)
VALUES (uuid_generate_v4(), 'Tindlehound', 'M', 'tindlehound.png', true, 'Tindlehounds are nightmarish beasts shaped like enormous black dogs, with multiple snarling heads and blazing green eyes. A tindlehound is a massive creature, stand- ing four to five feet high at the shoulder, and leaving a heavy trail of soot wherever it goes. Its multiple heads — as few as two or as many as 15 — belch gouts of green fire when on the hunt, and its corpus emits a choking veil of cinders to blind and incapacitate its prey. Most tindlehounds have short or docked tails, but some have been reported to possess a long, whip-like appendage tipped with a cluster of viciously barbed hooks.');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, background)
VALUES (uuid_generate_v4(), 'Derek Shaw', 'M', 'derek_shaw.png', true, 'Derek Shaw is a skilled but reckless construction worker whose repeated disregard for safety led Harry to report him, costing Derek his job. Proud and hot-headed, he blamed Harry rather than accepting responsibility for his own actions. Whether his bitterness stopped at angry words or grew into something far more dangerous remains an unanswered question.');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, background)
VALUES (uuid_generate_v4(), 'Christine Baker', 'M', 'christine_baker.png', false, 'Christine Baker is a compassionate nurse whose quiet resilience held her family together through years of financial strain and Harry''s increasingly volatile temper. Widowed in a single devastating morning that also claimed Bethany, she struggles to raise Kaetlyn alone while carrying an overwhelming mixture of love, grief, exhaustion, and unanswered questions. Though deeply wounded, she refuses to let tragedy define the life her surviving daughter will have.');


INSERT INTO npcs (uuid, name, gender, portrait, in_scene, background)
VALUES (uuid_generate_v4(), 'Miriam Voss', 'F', 'miriam_voss.png', true, 'Miriam Voss wanders hospitals, crime scenes, and hospice wards, obsessively recording the final words of the dying in hundreds of weathered notebooks. She believes the last sentence spoken before death reveals a soul''s true nature. She''ll trade valuable information for a last word Harry overhears.');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, campaign_id, background)
VALUES (uuid_generate_v4(), 'Viccy', 'F', 'viccy.png', false, '8a62b1b6-7689-40a6-9114-72c30ae364b0', 'Viccy is a Ghost Council Theurge in her early thirties, a wild-eyed Wiccan woman with an unkempt red mane and small, scattered tattoos. Brave and intensely curious, she has a mysterious, slightly unsettling presence, as though she is always listening to something just beyond the edge of the ordinary.');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, campaign_id, background)
VALUES (uuid_generate_v4(), 'Rusty', 'M', 'rusty.png', false, '8a62b1b6-7689-40a6-9114-72c30ae364b0', 'Rusty is an aging Silver Fang Philodox, once a formidable leader and now a frail, sickly Garou whose body has begun to betray him. Demanding and occasionally cantankerous, he expects much from those around him, but beneath his severity lies hard-earned wisdom and a deep understanding of the old ways. Though some see him as soft and permissive in his later years, Rusty knows that leadership is not always about choosing the harshest path.');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, campaign_id, background)
VALUES (uuid_generate_v4(), 'Terry', 'M', 'terry.png', false, '8a62b1b6-7689-40a6-9114-72c30ae364b0', 'Terry is a young Black Fury, tall and lean with a strong, athletic build, blonde hair, and a quiet intensity. Brave and fiercely independent, he carries himself with confidence but has much to learn about leadership, tradition, and the burdens of the Garou. He wears a simple green vest and favors practical clothing suited to life in the wilderness.');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, campaign_id, background)
VALUES (uuid_generate_v4(), 'Amara', 'F', 'amara.png', false, '8a62b1b6-7689-40a6-9114-72c30ae364b0', 'A kind and gentle Hart Warden Galliard, Amara is a Black woman who has devoted herself to caring for the Caern and the land around it. Patient and warm, she tends the grove with quiet reverence, tending its wounds, keeping its stories alive, and making sure those who call it home never forget what they are protecting. Beneath her softness lies a deep spiritual strength and an unshakable devotion to the Caern.');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, campaign_id, background)
VALUES (uuid_generate_v4(), 'Flowers', 'F', 'flowers.png', false, '8a62b1b6-7689-40a6-9114-72c30ae364b0', 'Flowers is a fierce Red Talon Ahroun who feels more comfortable in wolf form than among humans. Almost entirely nonverbal, she communicates through posture, growls, and instinctive gestures, but her loyalty to the Caern and her pack is absolute. She is blunt, territorial, and terrifying when provoked, with little patience for human weakness or civilization.');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, campaign_id, background)
VALUES (uuid_generate_v4(), 'Maribel “Mari” Vale', 'F', 'maribel_vale.png', false, '8a62b1b6-7689-40a6-9114-72c30ae364b0', 'Viccy''s maternal aunt and the undisputed eccentric of the Vale family. A former anthropology student who never quite settled into a conventional career, Mari filled her apartment with old books, tarot decks, folklore collections, strange artifacts, and handwritten notes about local legends. She was the first adult in Viccy''s life who treated her fascination with the strange as something worth nurturing rather than something embarrassing. Viccy still calls her when she needs advice, even when she knows better than to tell Mari exactly what kind of “weird” she has gotten herself into. She''s a brunnete, with a smart smirk, that smokes a lot, in her early 40''s');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, campaign_id, background)
VALUES (uuid_generate_v4(), 'Milo Reyes', 'M', 'milo_reyes.png', false, '8a62b1b6-7689-40a6-9114-72c30ae364b0', 'Milo was twelve when Terry first found him sleeping behind a closed convenience store in Blackpine Town, hungry, terrified, and already learning the wrong lessons about surviving on the streets. Terry took him under his wing, teaching him where to sleep safely, who to avoid, and how to make a little money without getting himself killed. Eventually, Milo was placed into a foster program and later adopted by a local couple, giving him the ordinary life Terry never had. Now sixteen, Milo still occasionally texts Terry, usually pretending he needs some trivial favor when what he really wants is to make sure his old big brother is still alive. Milo now is a boy around 12yo');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, campaign_id, background)
VALUES (uuid_generate_v4(), 'Ethan Pike', 'M', 'ethan_pike.png', false, '8a62b1b6-7689-40a6-9114-72c30ae364b0', 'Ethan is a NORTHEX environmental compliance technician who relocated to Blackpine Town for the job and rents a small house near the old industrial district. Unlike the company''s executives, he genuinely believes he''s doing legitimate environmental work, and he has been increasingly uncomfortable with discrepancies between what NORTHEX reports and what he sees in the field. He''s not a whistleblower yet—he''s scared of losing his job and possibly his career—but he''s keeping copies of documents he probably shouldn''t have.');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, campaign_id, background)
VALUES (uuid_generate_v4(), 'Janice Bell', 'F', 'janice_bell.png', false, '8a62b1b6-7689-40a6-9114-72c30ae364b0', 'Janice owns the Blackpine Diner, a faded but well-loved establishment that serves as one of the town''s unofficial gathering places. She''s in her late fifties, observant, socially connected, and has the irritating ability to notice when someone is lying without necessarily knowing why. Truckers, cops, construction workers, teenagers, and retirees all pass through her diner, meaning Janice hears an enormous amount of local gossip—especially complaints about NORTHEX, strange noises in the hills, and people who suddenly stop coming around.');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, campaign_id, background)
VALUES (uuid_generate_v4(), 'Dale “Duke” Mercer', 'M', 'dale_mercer.png', false, '8a62b1b6-7689-40a6-9114-72c30ae364b0', 'Duke runs a shabby auto-repair shop on the edge of Blackpine Town and supplements his income by selling stolen firearms, pills, and other contraband to people who know where to ask. He''s not particularly vicious; he’s simply spent twenty years convincing himself that survival is more important than morality. Duke knows exactly which local roads, hunting trails, abandoned buildings, and industrial access routes are useful for moving things discreetly, making him potentially valuable to anyone trying to operate around NORTHEX without being noticed.');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, campaign_id, background)
VALUES (uuid_generate_v4(), 'Elena Morales', 'F', 'elena_morales.png', false, '8a62b1b6-7689-40a6-9114-72c30ae364b0', 'Elena works at Blackpine Community Clinic, the town''s small medical facility, and has become one of its unofficial pillars. She''s competent, exhausted, blunt, and deeply protective of her patients, particularly the elderly people and low-income families who can''t afford to leave town for treatment. Lately she’s noticed strange clusters of headaches, skin irritation, respiratory problems, and unexplained nausea among people living near the NORTHEX expansion, but she has no evidence tying them together.');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, campaign_id, background)
VALUES (uuid_generate_v4(), 'Caleb Rourke', 'M', 'caleb_rouker.png', false, '8a62b1b6-7689-40a6-9114-72c30ae364b0', 'Caleb is a young deputy who grew up in Blackpine Town and joined the department because he wanted to be useful rather than because he had some grand vision of law enforcement. He''s friendly, slightly awkward, and has a habit of talking too much when nervous. Caleb handles most of the town''s mundane calls—domestic disputes, drunk drivers, missing pets, trespassing—and is likely to encounter Terry or the others before realizing they''re anything unusual. Caleb is african american.');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, campaign_id, background)
VALUES (uuid_generate_v4(), 'Marlene Voss', 'F', 'marlene_voss.png', false, '8a62b1b6-7689-40a6-9114-72c30ae364b0', 'Marlene Voss has been sheriff of Blackpine County for twelve years and knows most residents by name, including which ones she doesn''t particularly like. She''s practical, politically cautious, and increasingly irritated by NORTHEX''s presence, though she isn''t stupid enough to openly challenge a corporation with better lawyers than her department has money. She sees the Blackpine Grove area as dangerous backcountry and has no idea how close she is to something genuinely dangerous. She''s in early fourties.');

INSERT INTO npcs (uuid, name, gender, portrait, in_scene, campaign_id, background)
VALUES (uuid_generate_v4(), 'Legendary Wolf', 'M', 'legendary_wolf.jpeg', false, '8a62b1b6-7689-40a6-9114-72c30ae364b0', 'A colossal wolf spirit roams the Umbra, its silver-gray fur shimmering like moonlight and its ancient eyes carrying the weight of countless hunts. It is neither hostile nor welcoming, but watches the Garou with the quiet judgment of something that has seen generations rise and fall. Those who prove themselves worthy may approach it and learn Gifts drawn from the primal wisdom of the wolf.');