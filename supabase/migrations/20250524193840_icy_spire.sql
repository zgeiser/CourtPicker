/*
  # Initial database schema for PickleRater

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `username` (text)
      - `full_name` (text)
      - `avatar_url` (text)
      - `updated_at` (timestamp)
    - `venues`
      - `id` (uuid, primary key)
      - `name` (text)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `zip` (text)
      - `image_url` (text)
      - `description` (text)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)
    - `courts`
      - `id` (uuid, primary key)
      - `venue_id` (uuid, foreign key)
      - `court_number` (integer)
      - `court_type` (text)
      - `is_indoor` (boolean)
      - `amenities` (text array)
      - `image_url` (text)
      - `created_at` (timestamp)
    - `ratings`
      - `id` (uuid, primary key)
      - `court_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `overall_rating` (integer)
      - `surface_rating` (integer)
      - `net_rating` (integer)
      - `lighting_rating` (integer)
      - `comment` (text)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ
);

-- Create venues table
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create courts table
CREATE TABLE IF NOT EXISTS courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues ON DELETE CASCADE,
  court_number INTEGER NOT NULL,
  court_type TEXT,
  is_indoor BOOLEAN DEFAULT false,
  amenities TEXT[],
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(venue_id, court_number)
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID NOT NULL REFERENCES courts ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  surface_rating INTEGER CHECK (surface_rating BETWEEN 1 AND 5),
  net_rating INTEGER CHECK (net_rating BETWEEN 1 AND 5),
  lighting_rating INTEGER CHECK (lighting_rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(court_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Profiles security policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Venues security policies
CREATE POLICY "Venues are viewable by everyone" 
  ON venues FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create venues" 
  ON venues FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Users can update venues they created" 
  ON venues FOR UPDATE 
  USING (auth.uid() = user_id);

-- Courts security policies
CREATE POLICY "Courts are viewable by everyone" 
  ON courts FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create courts" 
  ON courts FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Venue owners can update courts" 
  ON courts FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM venues 
      WHERE venues.id = courts.venue_id 
      AND venues.user_id = auth.uid()
    )
  );

-- Ratings security policies
CREATE POLICY "Ratings are viewable by everyone" 
  ON ratings FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create ratings" 
  ON ratings FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
  ON ratings FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" 
  ON ratings FOR DELETE 
  USING (auth.uid() = user_id);

-- Create sample data for demo purposes
INSERT INTO venues (name, address, city, state, zip, image_url, description)
VALUES 
('Lakeside Pickleball Center', '123 Main St', 'Seattle', 'WA', '98101', 
 'https://images.pexels.com/photos/6511705/pexels-photo-6511705.jpeg', 
 'Premier pickleball facility with 8 dedicated courts and professional instruction.'),
('Downtown Recreation Center', '456 Park Ave', 'Portland', 'OR', '97205',
 'https://images.pexels.com/photos/3689177/pexels-photo-3689177.jpeg',
 'Multi-sport facility featuring 4 indoor pickleball courts.'),
('Sunshine Pickleball Club', '789 Beach Rd', 'San Diego', 'CA', '92101',
 'https://images.pexels.com/photos/6883828/pexels-photo-6883828.jpeg',
 'Outdoor pickleball paradise with 6 courts and ocean views.');

-- Add courts to each venue
-- Lakeside Pickleball Center
INSERT INTO courts (venue_id, court_number, court_type, is_indoor, amenities, image_url)
SELECT 
  id, 
  court_number,
  'Pro Surface', 
  false,
  ARRAY['Lighting', 'Water Station', 'Seating'],
  'https://images.pexels.com/photos/6511705/pexels-photo-6511705.jpeg'
FROM 
  venues,
  unnest(ARRAY[1, 2, 3, 4, 5, 6, 7, 8]) as court_number
WHERE 
  name = 'Lakeside Pickleball Center';

-- Downtown Recreation Center
INSERT INTO courts (venue_id, court_number, court_type, is_indoor, amenities, image_url)
SELECT 
  id, 
  court_number,
  'Sport Court', 
  true,
  ARRAY['Air Conditioning', 'Pro Shop', 'Locker Rooms'],
  'https://images.pexels.com/photos/3689177/pexels-photo-3689177.jpeg'
FROM 
  venues,
  unnest(ARRAY[1, 2, 3, 4]) as court_number
WHERE 
  name = 'Downtown Recreation Center';

-- Sunshine Pickleball Club
INSERT INTO courts (venue_id, court_number, court_type, is_indoor, amenities, image_url)
SELECT 
  id, 
  court_number,
  'Cushioned Surface', 
  false,
  ARRAY['Shade Covers', 'Pro Instruction', 'Ball Machine'],
  'https://images.pexels.com/photos/6883828/pexels-photo-6883828.jpeg'
FROM 
  venues,
  unnest(ARRAY[1, 2, 3, 4, 5, 6]) as court_number
WHERE 
  name = 'Sunshine Pickleball Club';