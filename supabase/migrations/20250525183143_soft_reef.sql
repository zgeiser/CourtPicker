/*
  # Update courts table constraints

  1. Changes
    - Add version column for optimistic locking
    - Ensure court numbers are sequential per venue
    - Maintain unique constraint on venue_id and court_number combination

  2. Security
    - Maintain existing RLS policies
*/

-- Add version column for optimistic locking
ALTER TABLE courts ADD COLUMN IF NOT EXISTS version bigint DEFAULT 1;

-- Create a function to validate court numbers are sequential
CREATE OR REPLACE FUNCTION check_court_number_sequence()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the court number is sequential
  IF NEW.court_number <= 0 THEN
    RAISE EXCEPTION 'Court number must be positive';
  END IF;

  -- Check if this is the next sequential number for this venue
  IF NEW.court_number > (
    SELECT COALESCE(MAX(court_number), 0) + 1
    FROM courts
    WHERE venue_id = NEW.venue_id
  ) THEN
    RAISE EXCEPTION 'Court numbers must be sequential';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for court number validation
DROP TRIGGER IF EXISTS ensure_sequential_court_numbers ON courts;
CREATE TRIGGER ensure_sequential_court_numbers
  BEFORE INSERT OR UPDATE ON courts
  FOR EACH ROW
  EXECUTE FUNCTION check_court_number_sequence();