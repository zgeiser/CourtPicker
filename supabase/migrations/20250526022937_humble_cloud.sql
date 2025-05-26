-- Add version column for optimistic locking
ALTER TABLE courts ADD COLUMN IF NOT EXISTS version bigint DEFAULT 1;

-- Remove the sequential court number constraint
DROP TRIGGER IF EXISTS ensure_sequential_court_numbers ON courts;
DROP FUNCTION IF EXISTS check_court_number_sequence();

-- Add a constraint to ensure court numbers are positive
ALTER TABLE courts ADD CONSTRAINT courts_court_number_check CHECK (court_number > 0);