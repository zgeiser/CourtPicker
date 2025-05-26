/*
  # Simplify courts table structure

  1. Changes
    - Modify court_type to be an enum with specific values
    - Remove unnecessary columns
    - Keep only essential attributes

  2. Updates
    - Create new enum type for court surfaces
    - Modify courts table structure
    - Update constraints and defaults
*/

-- Create enum for court types
CREATE TYPE court_type AS ENUM (
  'outdoor_surface',
  'gym',
  'sport_court',
  'other'
);

-- Update courts table
ALTER TABLE courts
  -- Drop unused columns
  DROP COLUMN amenities,
  -- Modify court_type to use new enum
  ALTER COLUMN court_type TYPE court_type USING 
    CASE 
      WHEN court_type IS NULL THEN 'other'::court_type
      ELSE 'other'::court_type
    END,
  -- Make court_type required
  ALTER COLUMN court_type SET NOT NULL,
  -- Set default for court_type
  ALTER COLUMN court_type SET DEFAULT 'other'::court_type,
  -- Keep is_indoor as boolean
  ALTER COLUMN is_indoor SET DEFAULT false;

-- Add check constraint to ensure court_number is positive
ALTER TABLE courts
  ADD CONSTRAINT courts_court_number_check 
  CHECK (court_number > 0);

COMMENT ON COLUMN courts.court_type IS 'Type of court surface (outdoor_surface, gym, sport_court, other)';
COMMENT ON COLUMN courts.is_indoor IS 'Whether the court is indoor (true) or outdoor (false)';
COMMENT ON COLUMN courts.court_number IS 'Unique identifier for the court within a venue';