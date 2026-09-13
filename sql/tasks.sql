CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (scene_id) REFERENCES scene(id)
);

ALTER TABLE tasks DROP COLUMN name;

ALTER TABLE tasks ADD COLUMN name TEXT;

-- Alter table, add two columns: revealed and completed. Both on boolean values, false by default
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS revealed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Change column name to goal
ALTER TABLE tasks
RENAME COLUMN name TO goal;

-- Change column description to resolution
ALTER TABLE tasks
RENAME COLUMN description TO resolution;

-- Drop column status
ALTER TABLE tasks
DROP COLUMN status;

ALTER TABLE tasks
DROP CONSTRAINT tasks_scene_id_fkey;

ALTER TABLE tasks
ADD CONSTRAINT fk_scene_id
FOREIGN KEY (scene_id)
REFERENCES scene(id)
ON DELETE CASCADE;