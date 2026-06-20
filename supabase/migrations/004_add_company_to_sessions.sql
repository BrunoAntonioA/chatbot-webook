-- Scope chatbot sessions to a company (multi-tenant)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Backfill existing sessions with the first company (adjust if needed)
UPDATE sessions
SET company_id = (SELECT id FROM companies ORDER BY created_at LIMIT 1)
WHERE company_id IS NULL;

ALTER TABLE sessions ALTER COLUMN company_id SET NOT NULL;

-- Replace global phone unique constraint with per-company uniqueness
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_phone_number_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_company_phone
  ON sessions (company_id, phone_number);

CREATE INDEX IF NOT EXISTS idx_sessions_company_id ON sessions (company_id);
