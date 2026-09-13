CREATE TABLE IF NOT EXISTS scene (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name TEXT NOT NULL,
    description TEXT NOT NULL
);

INSERT INTO scene(name, description)
VALUES ('01_01: archived', 'archived');

INSERT INTO scene(name, description)
VALUES ('01_03: Back home', 'Harry arrives at his family home, now a bleak reflection of itself in the Shadowlands. The front door is locked, forcing him to find another way inside by searching for a hidden key, forcing a window, climbing to an upstairs entrance, or overcoming similar physical obstacles. Once inside, encourage exploration room by room, with simple physical challenges to reach blocked spaces, unlock doors, or recover keepsakes. Every room should tell a story through ordinary details rather than exposition: unpaid bills and baby bottles clutter the kitchen, the living room shows the slow collapse of daily life, Bethany''s bedroom remains untouched as though waiting for her return, Kaethlyn''s nursery is still actively used, and the master bedroom quietly reflects Christine''s grief. Use brief emotional echoes to reveal moments of Christine caring for Kaethlyn, crying alone, or struggling through everyday routines, but never provide complete flashbacks. The emotional focus of the scene is Harry witnessing the life his family continues to live without him. Near the end, Christine returns home carrying Kaethlyn, revealing that the baby survived and remains in her care, though Christine appears exhausted and emotionally broken. Bethany''s whereabouts must remain completely unknown; the house offers no answers, only silence. Throughout the scene, the Shadow should relentlessly twist every discovery into guilt, resentment, and despair, insisting Harry failed his family and that they will eventually move on without him. The scene should end with Harry leaving the house understanding only one thing with certainty: Kaethlyn lives, and his family home has become one of his strongest Fetters.');

INSERT INTO scene(name, description)
VALUES ('01_04: Elias ambushed', 'Harry returns to Elias'' shack near the abandoned construction site expecting safety, but instead finds it surrounded by armed Ash Wardens. They are conducting an organized search, questioning nearby wraiths, inspecting the shack, and watching the surrounding ruins for anyone attempting to approach. Their goal is to find Elias and detain anyone connected to him. The AI should present this as a tense, open-ended encounter where stealth is the safest option, but deception, negotiation, or direct confrontation remain viable. The Wardens behave like disciplined enforcers: they coordinate patrols, react intelligently to suspicious activity, and pose a serious threat if engaged. The construction site and surrounding ruins should provide opportunities to hide, observe, and outmaneuver them. Elias is still nearby but has anticipated the raid. The AI should place subtle clues—hidden messages, disturbed belongings, or traces of his escape—that reward careful exploration and eventually lead Harry to him. The scene ends when Harry finds Elias, is captured by the Ash Wardens, or is forced to retreat.');

INSERT INTO scene(name, description)
VALUES ('01_05: Constrution site', 'Harry has decided that the abandoned construction site where he died will become his Haunt. The unfinished skyscraper stands like a rusting skeleton against the sky, its concrete floors exposed, rebar jutting from broken columns, scaffolding hanging loose, and rainwater collecting in dark pits. The place is saturated with fear, anger, and abandoned ambition. Every accident, every corner cut, every worker who cursed the project has left scars in the Shadowlands. The Haunt is not empty—it has been claimed by warped, bestial horrors born from violence and neglect. Elias has made it clear: if Harry wants this place, he must drive them out himself. There will be no negotiation, only force. The objective of the scene is to reach the heart of the construction site and destroy or scatter the creatures that have nested there, proving Harry is strong enough to claim the ruin. Run this scene as an action-horror sequence with constant movement and environmental hazards. Focus on brutal melee combat, desperate improvisation, collapsing floors, swinging chains, flying debris, unstable scaffolding, and shattered concrete. Encourage Harry to use the construction site itself as a weapon—throwing monsters through walls, pushing them down elevator shafts, smashing them with loose beams, or bringing sections of the structure down on top of them. The monsters should be aggressive, physical, and relentless rather than intelligent, forcing Harry to keep advancing instead of hiding. By the end of the scene, the surviving horrors should flee into the darkness, leaving the silent skeleton of the skyscraper to Harry alone, marking the first place in the Shadowlands he can truly call his own.');

INSERT INTO scene(name, description)
VALUES ('01_06: Hospital', 'This scene takes place in the county hospital where Christine works. Harry''s goal is to find her and learn what happened after the crash, especially Bethany''s fate. The hospital is crowded with Quick—doctors, nurses, patients, families, alarms, and constant activity—while the Shadowlands version feels cold, muted, and emotionally heavy. The Shroud is strong enough that ordinary attempts to communicate fail. Harry can search the hospital, observe Christine, and experiment with shouting, touching, moving small objects, or spending Pathos, but any success should be subtle: a chill, flickering lights, or Christine briefly sensing that someone is nearby. Christine knows the truth: Kaethlyn survived the accident, but Bethany did not. Harry cannot ask her directly, so he must discover this by witnessing conversations, paperwork, or moments when Christine breaks down in private. The revelation should be unmistakable and emotionally devastating. The player should leave with certainty about Bethany''s death, not ambiguity. The Shadow should exploit Harry''s grief and frustration throughout the scene, urging him to force the living to notice him through anger, destruction, or fear. Other ghosts may briefly appear to reinforce that hospitals attract the newly dead, but they should remain background elements. The focus of the scene is Harry confronting the painful reality that his family is moving forward in a world he can no longer truly touch.');

ALTER TABLE scene
ADD COLUMN IF NOT EXISTS setup text;

ALTER TABLE scene
ADD COLUMN IF NOT EXISTS escalation text;

ALTER TABLE scene
ADD COLUMN IF NOT EXISTS payoff text;

-- drop column description
ALTER TABLE scene
DROP COLUMN description;

