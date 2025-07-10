-- Update games table to support Kahoot-style game phases
ALTER TABLE games ADD COLUMN IF NOT EXISTS phase TEXT DEFAULT 'lobby' CHECK (phase IN ('lobby', 'quiz', 'result'));
ALTER TABLE games ADD COLUMN IF NOT EXISTS current_question_sequence INTEGER DEFAULT 0;
ALTER TABLE games ADD COLUMN IF NOT EXISTS is_answer_revealed BOOLEAN DEFAULT false;
ALTER TABLE games ADD COLUMN IF NOT EXISTS question_start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE games ADD COLUMN IF NOT EXISTS choices_shown BOOLEAN DEFAULT false;

-- Create game_progress table
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_game_progress_game_id ON game_progress(game_id);
CREATE INDEX IF NOT EXISTS idx_game_progress_user_id ON game_progress(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read game progress
CREATE POLICY "Users can view game progress" ON game_progress
    FOR SELECT USING (true);

-- Create policy to allow users to insert their own progress
CREATE POLICY "Users can insert own progress" ON game_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own progress
CREATE POLICY "Users can update own progress" ON game_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Create simple trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_game_progress_updated_at 
    BEFORE UPDATE ON game_progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 