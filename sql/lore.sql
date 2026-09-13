CREATE TABLE IF NOT EXISTS lore (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    active BOOLEAN NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL
);

-- default value for active is false
ALTER TABLE lore ALTER COLUMN active SET DEFAULT false;




INSERT INTO npcs (uuid, name, gender, portrait, in_scene, campaign_id, background)
VALUES (uuid_generate_v4(), 'Northex', 'M', 'northex.png', false, '8a62b1b6-7689-40a6-9114-72c30ae364b0', '
NORTHEX Materials is a regional chemical and energy conglomerate that presents itself as a clean, modern employer bringing jobs and infrastructure to the area. Its latest expansion is pushing roads, pipelines, storage facilities, and access corridors directly into the Blackpine Grove, steadily eating away at the Caern’s territory. Blackridge isn’t openly malicious; it is bureaucratic, well-funded, politically connected, and utterly convinced that the forest is simply land waiting to become productive. The stranger chemicals and spiritual corruption surrounding its operations are symptoms of something deeper—but the people running Blackridge mostly just see quarterly targets.