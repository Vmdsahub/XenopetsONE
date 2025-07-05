/*
  # Create World Interactive Points Table

  This migration creates a table to store interactive points on planet images that are invisible to regular users
  but visible and editable by administrators.
*/

-- Create table for world interactive points
CREATE TABLE IF NOT EXISTS world_interactive_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id TEXT NOT NULL REFERENCES world_positions(id) ON DELETE CASCADE,
  x_percent REAL NOT NULL CHECK (x_percent >= 0 AND x_percent <= 100),
  y_percent REAL NOT NULL CHECK (y_percent >= 0 AND y_percent <= 100),
  width_percent REAL NOT NULL DEFAULT 10 CHECK (width_percent > 0 AND width_percent <= 100),
  height_percent REAL NOT NULL DEFAULT 10 CHECK (height_percent > 0 AND height_percent <= 100),
  title TEXT NOT NULL,
  description TEXT,
  action_type TEXT NOT NULL DEFAULT 'dialog' CHECK (action_type IN ('dialog', 'shop', 'minigame', 'quest', 'teleport')),
  action_data JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Create index on world_id for better performance
CREATE INDEX IF NOT EXISTS idx_world_interactive_points_world_id ON world_interactive_points(world_id);
CREATE INDEX IF NOT EXISTS idx_world_interactive_points_active ON world_interactive_points(is_active);

-- Enable RLS
ALTER TABLE world_interactive_points ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active points, only admins can modify
CREATE POLICY "Allow read access to active interactive points" ON world_interactive_points
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin full access to interactive points" ON world_interactive_points
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_world_interactive_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_world_interactive_points_updated_at_trigger
    BEFORE UPDATE ON world_interactive_points
    FOR EACH ROW
    EXECUTE FUNCTION update_world_interactive_points_updated_at();
