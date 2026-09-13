CREATE TABLE IF NOT EXISTS context_manager_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    system_actual_size NUMERIC,
    system_clipped_size NUMERIC,
    lore_actual_size NUMERIC,
    lore_clipped_size NUMERIC,
    active_scene_actual_size NUMERIC,
    active_scene_clipped_size NUMERIC,
    recent_turns_actual_size NUMERIC,
    recent_turns_clipped_size NUMERIC,
    misc_actual_size NUMERIC,
    misc_clipped_size NUMERIC,
    system_element_count NUMERIC,
    lore_element_count NUMERIC,
    active_scene_element_count NUMERIC,
    recent_turns_element_count NUMERIC,
    mist_element_count NUMERIC
);

ALTER TABLE context_manager_logs
RENAME COLUMN mist_element_count TO misc_element_count;