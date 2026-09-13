CREATE TABLE IF NOT EXISTS llm_request_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    duration NUMERIC,
    agent TEXT,
    max_tokens NUMERIC,
    context_size NUMERIC
);

ALTER TABLE llm_request_logs
ADD COLUMN IF NOT EXISTS model TEXT;