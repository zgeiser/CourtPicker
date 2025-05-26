/*
  # Add tier column to profiles table

  1. Changes
    - Add tier column to profiles table with default value 'free'
    - Add check constraint to ensure valid tier values
*/

ALTER TABLE profiles
ADD COLUMN tier text NOT NULL DEFAULT 'free'
CHECK (tier IN ('free', 'tier1', 'tier2'));