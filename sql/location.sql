CREATE TABLE IF NOT EXISTS location (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portrait TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  background TEXT
);

ALTER TABLE location
ADD COLUMN IF NOT EXISTS name TEXT;

INSERT INTO location (name, portrait, background)
VALUES ('Pinewook County', 'pinewood_county.png', 'The Shadowlands version of Pinewood County lies in perfect, unsettling stillness. Once-familiar storefronts sag beneath decades of spectral decay, their windows shattered and signs faded into near illegibility, while rust, mold, and creeping ivy consume every surface. A cold blue haze hangs over the deserted streets, swallowing sound and softening the silhouettes of abandoned buildings, leaving only the distant church steeple to stand watch over a town that seems not merely abandoned, but quietly waiting for something to return.');

INSERT INTO location (name, portrait, background)
VALUES ('Family home', 'family_home.png', 'Harry''s family home is a modest two-story house tucked into a quiet borough street, its faded siding and sagging porch showing years of deferred repairs. The ground floor holds a cramped living room with an old couch, children''s toys scattered across a worn carpet, a small kitchen where unpaid bills pile beside the coffee maker, and a dining table scarred by years of family meals and angry fists. Upstairs are two small bedrooms—Bethany''s still filled with stuffed animals and colorful drawings, Kaetlyn''s nursery frozen in hopeful preparation—and the master bedroom, where sleepless nights and whispered arguments linger in the walls. In the Shadowlands, the house feels unnaturally still, wrapped in stale gray light. Every room echoes with memories that refuse to fade, making it impossible to tell whether the creaks in the floorboards come from settling timber or from ghosts walking the life they lost.');

INSERT INTO location (name, portrait, background)
VALUES ('Construction site', 'construction_site.png', 'The unfinished skyscraper rises over Pinewood County like a dead monument, its exposed concrete floors stacked beneath a forest of rusted rebar. Half-collapsed scaffolding clings to the exterior, elevator shafts yawn into darkness, and abandoned machinery sits where workers left it. Wind whistles through empty window frames, carrying the creaks of twisted steel and the distant drip of rainwater. In the Shadowlands, the entire structure feels bruised—scarred by fear, broken promises, and the violence that ended lives long before the project itself died.');

INSERT INTO location (name, portrait, background)
VALUES ('Hospital', 'hospital.png', 'Pinewood County General Hospital is a large, modern medical center that never truly sleeps. Bright fluorescent lights, polished floors, and the constant rhythm of rolling stretchers, ringing phones, and hurried conversations fill the Skinlands, while the Shadowlands reveal faded walls, dim corridors, and stains left by decades of pain, fear, and loss. Every wing carries a different emotional weight—from anxious waiting rooms to silent intensive care units—and countless living souls pass through its halls each day, making it one of the busiest and most emotionally charged locations in the county.');

INSERT INTO location (name, portrait, background)
VALUES ('Blackpine Grove Caern', 'blackpine_grove_caern.png', 'An old-growth hollow deep in the hills, protected by the Garou for generations. The Caern is small and isolated, centered around an enormous dead pine whose roots surround a cold spring. The forest has begun to feel subtly wrong: fewer animals, strange fungal growth, and an occasional chemical smell when the wind comes from the valley.');

INSERT INTO location (name, portrait, background)
VALUES ('NORTHEX''s shack', 'northex_shack.png', 'A battered prefab shack squats at the edge of the NORTHEX perimeter, half-swallowed by roots and mud. Inside, survey maps, equipment logs, and a locked steel box reveal how far the corporation intends to push into Blackpine Grove.');

INSERT INTO location (name, portrait, background)
VALUES ('Command Trailer', 'command_trailer.png', 'The NORTHEX command trailer is a battered mobile operations unit parked beside the drilling site, its cramped interior dominated by banks of monitors, control panels, and humming equipment. From here, operators remotely control the heavy drills boring dangerously close to the Caern, monitoring their depth and position with clinical precision.');

INSERT INTO location (name, portrait, background)
VALUES ('Pine Needle', 'pine_needle.jpeg', 'The local diner is a modest, well-worn roadside place that serves as one of the few gathering spots in the area, with faded booths, cracked vinyl seats, strong coffee, and a bell over the front door. It is the sort of place where locals know each other by name and NORTHEX workers stop in after a shift. Janice works here, giving her a steady connection to the community and a front-row seat to the rumors, complaints, and quiet tensions spreading through town.');

INSERT INTO location (campaign_id, name, portrait, background)
VALUES ('8a62b1b6-7689-40a6-9114-72c30ae364b0', 'The Third Eye', 'third_eye.jpeg', 'The Third Eye is a cramped, aging occult bookshop tucked away on a quiet side street, its windows crowded with faded signs, dried herbs, and curious trinkets. Inside, shelves sag beneath books on folklore, ritual, mythology, and the supernatural, while the faint smell of incense hangs permanently in the air. Viccy works here, surrounded by exactly the sort of obscure knowledge and strange customers that make the shop feel less like a business and more like a doorway into something hidden.');

INSERT INTO location (campaign_id, name, portrait, background)
VALUES ('8a62b1b6-7689-40a6-9114-72c30ae364b0', 'NORTHEX Sector 4', 'northex_sector_4.jpeg', 'NORTHEX Sector 4 Logistics Yard — A sprawling industrial staging yard where NORTHEX stores equipment, coordinates contractor convoys, and controls access to the expansion zone. Chain-link fences, prefab offices, chemical tankers, stacked pipes, and harsh security lights surround a weathered gatehouse, while cameras watch the cracked Route 9 access road disappearing into the surrounding pines.');

INSERT INTO location (campaign_id, name, portrait, background)
VALUES ('8a62b1b6-7689-40a6-9114-72c30ae364b0', 'Umbra', 'umbra.webp', 'The Umbra is the spirit world that lies alongside the physical realm, a vast and shifting dimension where every living thing, place, and emotion casts a spiritual reflection. Ancient spirits roam its forests, rivers, ruins, and endless wilderness, while the laws of reality bend beneath the weight of instinct, symbolism, and belief. To the Garou, the Umbra is both sacred homeland and dangerous frontier—a place of profound wisdom, strange allies, and things that should never be encountered.');

INSERT INTO location (campaign_id, name, portrait, background)
VALUES ('8a62b1b6-7689-40a6-9114-72c30ae364b0', 'Blackpine Town', 'blackpine_town.jpeg', 'Blackpine Town''s downtown is a short, weathered stretch of brick storefronts gathered along the main road, where independent shops, a diner, a hardware store, and a few locally owned businesses serve both the town and the surrounding wilderness communities. Old wooden signs creak above the sidewalks, pickup trucks line the street, and the storefront windows glow warmly against the ever-present gray skies and dark pine forests beyond town.');
