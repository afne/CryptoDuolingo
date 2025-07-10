-- Update games table to support Kahoot-style game phases
ALTER TABLE games ADD COLUMN IF NOT EXISTS phase TEXT DEFAULT 'lobby' CHECK (phase IN ('lobby', 'quiz', 'result'));
ALTER TABLE games ADD COLUMN IF NOT EXISTS current_question_sequence INTEGER DEFAULT 0;
ALTER TABLE games ADD COLUMN IF NOT EXISTS is_answer_revealed BOOLEAN DEFAULT false;
ALTER TABLE games ADD COLUMN IF NOT EXISTS question_start_time TIMESTAMP WITH TIME ZONE;

-- Update existing games to have the lobby phase
UPDATE games SET phase = 'lobby' WHERE phase IS NULL;

-- Create game_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS game_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    current_question INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id, user_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_game_progress_game_id ON game_progress(game_id);
CREATE INDEX IF NOT EXISTS idx_game_progress_user_id ON game_progress(user_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view games" ON games;
DROP POLICY IF EXISTS "Users can create games" ON games;
DROP POLICY IF EXISTS "Users can update own games" ON games;

DROP POLICY IF EXISTS "Users can view game players" ON game_players;
DROP POLICY IF EXISTS "Users can join games" ON game_players;
DROP POLICY IF EXISTS "Users can leave games" ON game_players;

DROP POLICY IF EXISTS "Users can view game progress" ON game_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON game_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON game_progress;

-- Create policies for games table
CREATE POLICY "Users can view games" ON games FOR SELECT USING (true);
CREATE POLICY "Users can create games" ON games FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own games" ON games FOR UPDATE USING (auth.uid() = created_by);

-- Create policies for game_players table
CREATE POLICY "Users can view game players" ON game_players FOR SELECT USING (true);
CREATE POLICY "Users can join games" ON game_players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave games" ON game_players FOR DELETE USING (auth.uid() = user_id);

-- Create policies for game_progress table
CREATE POLICY "Users can view game progress" ON game_progress FOR SELECT USING (true);
CREATE POLICY "Users can insert own progress" ON game_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON game_progress FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for game_progress table
DROP TRIGGER IF EXISTS update_game_progress_updated_at ON game_progress;
CREATE TRIGGER update_game_progress_updated_at 
    BEFORE UPDATE ON game_progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable real-time for all tables (ignore if already enabled)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE games;
    EXCEPTION
        WHEN duplicate_object THEN
            -- Table already in publication, ignore
            NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE game_players;
    EXCEPTION
        WHEN duplicate_object THEN
            -- Table already in publication, ignore
            NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE game_progress;
    EXCEPTION
        WHEN duplicate_object THEN
            -- Table already in publication, ignore
            NULL;
    END;
END $$; 