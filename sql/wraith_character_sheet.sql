CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS character_sheet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Attributes
    strength SMALLINT NOT NULL DEFAULT 0,
    dexterity SMALLINT NOT NULL DEFAULT 0,
    stamina SMALLINT NOT NULL DEFAULT 0,

    charisma SMALLINT NOT NULL DEFAULT 0,
    manipulation SMALLINT NOT NULL DEFAULT 0,
    appearance SMALLINT NOT NULL DEFAULT 0,

    perception SMALLINT NOT NULL DEFAULT 0,
    intelligence SMALLINT NOT NULL DEFAULT 0,
    wits SMALLINT NOT NULL DEFAULT 0,

    -- Talents
    alertness SMALLINT NOT NULL DEFAULT 0,
    athletics SMALLINT NOT NULL DEFAULT 0,
    awareness SMALLINT NOT NULL DEFAULT 0,
    brawl SMALLINT NOT NULL DEFAULT 0,
    empathy SMALLINT NOT NULL DEFAULT 0,
    expression SMALLINT NOT NULL DEFAULT 0,
    intimidation SMALLINT NOT NULL DEFAULT 0,
    persuasion SMALLINT NOT NULL DEFAULT 0,
    streetwise SMALLINT NOT NULL DEFAULT 0,
    subterfuge SMALLINT NOT NULL DEFAULT 0,

    -- Skills
    crafts SMALLINT NOT NULL DEFAULT 0,
    drive SMALLINT NOT NULL DEFAULT 0,
    etiquette SMALLINT NOT NULL DEFAULT 0,
    firearms SMALLINT NOT NULL DEFAULT 0,
    larceny SMALLINT NOT NULL DEFAULT 0,
    leadership SMALLINT NOT NULL DEFAULT 0,
    meditation SMALLINT NOT NULL DEFAULT 0,
    melee SMALLINT NOT NULL DEFAULT 0,
    performance SMALLINT NOT NULL DEFAULT 0,
    stealth SMALLINT NOT NULL DEFAULT 0,

    -- Knowledges
    academics SMALLINT NOT NULL DEFAULT 0,
    bureaucracy SMALLINT NOT NULL DEFAULT 0,
    computer SMALLINT NOT NULL DEFAULT 0,
    enigmas SMALLINT NOT NULL DEFAULT 0,
    investigation SMALLINT NOT NULL DEFAULT 0,
    medicine SMALLINT NOT NULL DEFAULT 0,
    occult SMALLINT NOT NULL DEFAULT 0,
    politics SMALLINT NOT NULL DEFAULT 0,
    science SMALLINT NOT NULL DEFAULT 0,
    technology SMALLINT NOT NULL DEFAULT 0,

    -- Advantages
    willpower SMALLINT NOT NULL DEFAULT 0
);

-- alter table add column rage
ALTER TABLE character_sheet
ADD COLUMN IF NOT EXISTS rage SMALLINT NOT NULL DEFAULT 0;

-- rename character_sheet to wraith_character_sheet
ALTER TABLE character_sheet RENAME TO wraith_character_sheet;

INSERT INTO character_sheet (
    name,
    strength, dexterity, stamina,
    charisma, manipulation, appearance,
    perception, intelligence, wits,
    alertness, athletics, awareness, brawl, empathy, expression, intimidation, persuasion, streetwise, subterfuge,
    crafts, drive, etiquette, firearms, larceny, leadership, meditation, melee, performance, stealth,
    academics, bureaucracy, computer, enigmas, investigation, medicine, occult, politics, science, technology,
    willpower
) VALUES (
    'Harry Baker',

    -- Attributes
    4, -- strength
    3, -- dexterity
    3, -- stamina

    3, -- charisma
    2, -- manipulation
    1, -- appearance

    2, -- perception
    2, -- intelligence
    4, -- wits

    -- Talents
    2, -- alertness
    2, -- athletics
    0, -- awareness
    2, -- brawl
    0, -- empathy
    0, -- expression
    2, -- intimidation
    1, -- persuasion
    0, -- streetwise
    0, -- subterfuge

    -- Skills
    3, -- crafts
    1, -- drive
    0, -- etiquette
    2, -- firearms
    1, -- larceny
    3, -- leadership
    0, -- meditation
    2, -- melee
    0, -- performance
    1, -- stealth

    -- Knowledges
    1, -- academics
    1, -- bureaucracy
    0, -- computer
    0, -- enigmas
    2, -- investigation
    0, -- medicine
    0, -- occult
    1, -- politics
    0, -- science
    0, -- technology

    -- Advantages
    0  -- willpower
);


INSERT INTO character_sheet (
    name,
    strength, dexterity, stamina,
    charisma, manipulation, appearance,
    perception, intelligence, wits,
    alertness, athletics, awareness, brawl, empathy, expression, intimidation, persuasion, streetwise, subterfuge,
    crafts, drive, etiquette, firearms, larceny, leadership, meditation, melee, performance, stealth,
    academics, bureaucracy, computer, enigmas, investigation, medicine, occult, politics, science, technology,
    willpower
) VALUES (
    'Terry Barns',

    -- Attributes
    4, -- strength
    3, -- dexterity
    3, -- stamina

    3, -- charisma
    2, -- manipulation
    1, -- appearance

    2, -- perception
    2, -- intelligence
    4, -- wits

    -- Talents
    2, -- alertness
    2, -- athletics
    0, -- awareness
    2, -- brawl
    0, -- empathy
    0, -- expression
    2, -- intimidation
    1, -- persuasion
    0, -- streetwise
    0, -- subterfuge

    -- Skills
    3, -- crafts
    1, -- drive
    0, -- etiquette
    2, -- firearms
    1, -- larceny
    3, -- leadership
    0, -- meditation
    2, -- melee
    0, -- performance
    1, -- stealth

    -- Knowledges
    1, -- academics
    1, -- bureaucracy
    0, -- computer
    0, -- enigmas
    2, -- investigation
    0, -- medicine
    0, -- occult
    1, -- politics
    0, -- science
    0, -- technology

    -- Advantages
    0  -- willpower
);