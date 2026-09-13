CREATE TABLE IF NOT EXISTS campaign (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO campaign (name) VALUES ('Harry Baker Wraith') ON CONFLICT DO NOTHING;
INSERT INTO campaign (name) VALUES ('Werewolf 5e') ON CONFLICT DO NOTHING;

ALTER TABLE character_sheet ADD COLUMN campaign_id UUID;
ALTER TABLE character_sheet ADD CONSTRAINT fk_campaign_id FOREIGN KEY (campaign_id) REFERENCES campaign(id);

ALTER TABLE context_manager_logs ADD COLUMN campaign_id UUID;
ALTER TABLE context_manager_logs ADD CONSTRAINT fk_campaign_id FOREIGN KEY (campaign_id) REFERENCES campaign(id);

ALTER TABLE enemies ADD COLUMN campaign_id UUID;
ALTER TABLE enemies ADD CONSTRAINT fk_campaign_id FOREIGN KEY (campaign_id) REFERENCES campaign(id);

ALTER TABLE llm_request_logs ADD COLUMN campaign_id UUID;
ALTER TABLE llm_request_logs ADD CONSTRAINT fk_campaign_id FOREIGN KEY (campaign_id) REFERENCES campaign(id);

ALTER TABLE location ADD COLUMN campaign_id UUID;
ALTER TABLE location ADD CONSTRAINT fk_campaign_id FOREIGN KEY (campaign_id) REFERENCES campaign(id);

ALTER TABLE lore ADD COLUMN campaign_id UUID;
ALTER TABLE lore ADD CONSTRAINT fk_campaign_id FOREIGN KEY (campaign_id) REFERENCES campaign(id);

ALTER TABLE npcs ADD COLUMN campaign_id UUID;
ALTER TABLE npcs ADD CONSTRAINT fk_campaign_id FOREIGN KEY (campaign_id) REFERENCES campaign(id);

ALTER TABLE quick_action ADD COLUMN campaign_id UUID;
ALTER TABLE quick_action ADD CONSTRAINT fk_campaign_id FOREIGN KEY (campaign_id) REFERENCES campaign(id);

ALTER TABLE scene ADD COLUMN campaign_id UUID;
ALTER TABLE scene ADD CONSTRAINT fk_campaign_id FOREIGN KEY (campaign_id) REFERENCES campaign(id);

ALTER TABLE tasks ADD COLUMN campaign_id UUID;
ALTER TABLE tasks ADD CONSTRAINT fk_campaign_id FOREIGN KEY (campaign_id) REFERENCES campaign(id);

ALTER TABLE turns ADD COLUMN campaign_id UUID;
ALTER TABLE turns ADD CONSTRAINT fk_campaign_id FOREIGN KEY (campaign_id) REFERENCES campaign(id);
