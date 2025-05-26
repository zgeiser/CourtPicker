/*
  # Set default court type

  1. Changes
    - Set default court type to 'outdoor_surface' for all courts
    - Update existing null court types to 'outdoor_surface'
  
  2. Notes
    - Ensures all new courts will have a default type
    - Maintains data consistency for existing records
*/

-- Set default value for court_type column
ALTER TABLE courts 
ALTER COLUMN court_type SET DEFAULT 'outdoor_surface';

-- Update existing records with null court_type
UPDATE courts 
SET court_type = 'outdoor_surface' 
WHERE court_type IS NULL;