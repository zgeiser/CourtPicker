/*
  # Remove Sequential Court Numbering

  1. Changes
    - Add version column for optimistic locking
    - Remove sequential court number constraint
    - Drop the existing constraint if it exists
    - Add new constraint to ensure court numbers are positive

  2. Notes
    - This migration removes the automatic sequential numbering of courts
    - Allows manual numbering of courts while ensuring numbers are positive
*/

-- Add version column for optimistic locking
ALTER TABLE courts ADD COLUMN IF NOT EXISTS version bigint DEFAULT 1;

-- Remove the sequential court number constraint
DROP TRIGGER IF EXISTS ensure_sequential_court_numbers ON courts;
DROP FUNCTION IF EXISTS check_court_number_sequence();

-- Drop the constraint if it exists
ALTER TABLE courts DROP CONSTRAINT IF EXISTS courts_court_number_check;

-- Add a constraint to ensure court numbers are positive
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'courts_court_number_check'
  ) THEN
    ALTER TABLE courts ADD CONSTRAINT courts_court_number_check CHECK (court_number > 0);
  END IF;
END $$;