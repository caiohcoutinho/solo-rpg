CREATE TABLE IF NOT EXISTS character_sheet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    strength SMALLINT NOT NULL DEFAULT 0,
    dexterity SMALLINT NOT NULL DEFAULT 0,
    stamina SMALLINT NOT NULL DEFAULT 0,
    charisma SMALLINT NOT NULL DEFAULT 0,
    manipulation SMALLINT NOT NULL DEFAULT 0,
    composure SMALLINT NOT NULL DEFAULT 0,
    intelligence SMALLINT NOT NULL DEFAULT 0,
    wits SMALLINT NOT NULL DEFAULT 0,
    resolve SMALLINT NOT NULL DEFAULT 0,
    athletics SMALLINT NOT NULL DEFAULT 0,
    brawl SMALLINT NOT NULL DEFAULT 0,
    craft SMALLINT NOT NULL DEFAULT 0,
    driving SMALLINT NOT NULL DEFAULT 0,
    firearms SMALLINT NOT NULL DEFAULT 0,
    larceny SMALLINT NOT NULL DEFAULT 0,
    melee SMALLINT NOT NULL DEFAULT 0,
    stealth SMALLINT NOT NULL DEFAULT 0,
    survival SMALLINT NOT NULL DEFAULT 0,
    animal_ken SMALLINT NOT NULL DEFAULT 0,
    etiquette SMALLINT NOT NULL DEFAULT 0,
    insight SMALLINT NOT NULL DEFAULT 0,
    intimidation SMALLINT NOT NULL DEFAULT 0,
    leadership SMALLINT NOT NULL DEFAULT 0,
    performance SMALLINT NOT NULL DEFAULT 0,
    persuasion SMALLINT NOT NULL DEFAULT 0,
    streetwise SMALLINT NOT NULL DEFAULT 0,
    subterfuge SMALLINT NOT NULL DEFAULT 0,
    academics SMALLINT NOT NULL DEFAULT 0,
    awareness SMALLINT NOT NULL DEFAULT 0,
    finance SMALLINT NOT NULL DEFAULT 0,
    investigation SMALLINT NOT NULL DEFAULT 0,
    medicine SMALLINT NOT NULL DEFAULT 0,
    occult SMALLINT NOT NULL DEFAULT 0,
    politics SMALLINT NOT NULL DEFAULT 0,
    science SMALLINT NOT NULL DEFAULT 0,
    technology SMALLINT NOT NULL DEFAULT 0,
    willpower SMALLINT NOT NULL DEFAULT 0,
    rage SMALLINT NOT NULL DEFAULT 0,
    harano SMALLINT NOT NULL DEFAULT 0,
    hauglosk SMALLINT NOT NULL DEFAULT 0
);

-- add campaign_id column
ALTER TABLE character_sheet ADD COLUMN campaign_id UUID;
ALTER TABLE character_sheet ADD CONSTRAINT fk_campaign_id FOREIGN KEY (campaign_id) REFERENCES campaign(id);

-- add column healt of type smallint not null default 0
ALTER TABLE character_sheet ADD COLUMN health SMALLINT NOT NULL DEFAULT 0;

INSERT INTO character_sheet (
    name, campaign_id, 
    -- Attributes
    strength, dexterity, stamina,
    charisma, manipulation, composure,
    intelligence, wits, resolve,
    -- Physical Skills
    athletics, brawl, craft, driving,
    firearms, larceny, melee, stealth, survival,
    -- Social Skills
    animal_ken, etiquette, insight, intimidation,
    leadership, performance, persuasion, streetwise, subterfuge,
    -- Mental Skills
    academics, awareness, finance, investigation,
    medicine, occult, politics, science, technology,
    -- Other
    willpower, rage, harano, hauglosk
) VALUES (
    'Terry Barns', '8a62b1b6-7689-40a6-9114-72c30ae364b0',
    -- Attributes
    3, 4, 2,  -- Physical: Strength 3, Dexterity 4, Stamina 2
    2, 3, 1,  -- Social: Charisma 2, Manipulation 3, Composure 1
    2, 3, 2,  -- Mental: Intelligence 2, Wits 3, Resolve 2
    -- Physical Skills
    3, 2, 0, 0,
    1, 4, 2, 3, 1,
    -- Social Skills
    0, 0, 0, 0,
    0, 0, 0, 1, 0,
    -- Mental Skills
    0, 2, 0, 3,
    0, 0, 0, 0, 0,
    -- Trackers
    3, -- Willpower (3 maximum tracker boxes filled)
    0, -- Rage (not shown in sheet, defaults to 0)
    0, -- Harano (defaults to 0)
    0  -- Hauglosk (defaults to 0)
);

INSERT INTO character_sheet (
    name, campaign_id, 
    -- Attributes
    strength, dexterity, stamina,
    charisma, manipulation, composure,
    intelligence, wits, resolve,
    -- Physical Skills
    athletics, brawl, craft, driving,
    firearms, larceny, melee, stealth, survival,
    -- Social Skills
    animal_ken, etiquette, insight, intimidation,
    leadership, performance, persuasion, streetwise, subterfuge,
    -- Mental Skills
    academics, awareness, finance, investigation,
    medicine, occult, politics, science, technology,
    -- Other
    willpower, rage, harano, hauglosk
) VALUES (
    'Viccy Knowles', '8a62b1b6-7689-40a6-9114-72c30ae364b0',
    -- Attributes
    1, 2, 2,  -- Physical: Strength 1, Dexterity 2, Stamina 2
    3, 2, 2,  -- Social: Charisma 3, Manipulation 2, Composure 2
    4, 3, 3,  -- Mental: Intelligence 4, Wits 3, Resolve 3
    -- Physical Skills
    0, 0, 0, 0,
    0, 0, 0, 0, 1,
    -- Social Skills
    0, 0, 3, 0,
    0, 0, 2, 0, 0,
    -- Mental Skills
    1, 3, 0, 3,
    2, 4, 0, 2, 1,
    -- Trackers
    5, -- Willpower (5 maximum tracker boxes filled)
    0, -- Rage (defaults to 0)
    0, -- Harano (defaults to 0)
    0  -- Hauglosk (defaults to 0)
);