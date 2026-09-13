CREATE TABLE IF NOT EXISTS game_state (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL,
    value TEXT NOT NULL
);
