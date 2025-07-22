"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "../utils/supabase/server";

interface PlayerProgress {
  user_id: string;
  current_question: number;
  score: number;
  completed: boolean;
  user_profile?: {
    first_name: string;
    last_name: string;
    experience_level: string;
  };
}

interface GameState {
  phase: 'lobby' | 'quiz' | 'result';
  current_question_sequence: number;
  is_answer_revealed: boolean;
  question_start_time?: number;
  choices_shown?: boolean;
}

interface MultiplayerHostProps {
  gameId: string;
  userId: string;
  onGameEnd: (winner: string) => void;
}

const QUESTION_TIME = 20; // seconds per question

export default function MultiplayerHost({ gameId, onGameEnd }: MultiplayerHostProps) {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'lobby',
    current_question_sequence: 0,
    is_answer_revealed: false
  });
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [hasShownChoices, setHasShownChoices] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const supabase = createClient();
  const stateRef = useRef<{ hasShownChoices: boolean }>({ hasShownChoices: false });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTimeUp = useCallback(async () => {
    console.log('Time up for question', gameState.current_question_sequence + 1);
    
    // Update game to reveal answer
    const { error } = await supabase
      .from("games")
      .update({ is_answer_revealed: true })
      .eq("id", gameId);

    if (error) {
      console.log('Error revealing answer:', error);
    }
  }, [gameId, gameState.current_question_sequence, supabase]);

  // Initialize game state
  useEffect(() => {
    if (isInitialized) return; // Prevent multiple initializations
    
    const initializeGame = async () => {
      console.log('Initializing host game:', gameId);
      
      // Get current game state
      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (gameError) {
        console.log('Error fetching game:', gameError);
        return;
      }

      if (gameData) {
        setGameState({
          phase: gameData.phase || 'lobby',
          current_question_sequence: gameData.current_question_sequence || 0,
          is_answer_revealed: gameData.is_answer_revealed || false,
          question_start_time: gameData.question_start_time,
          choices_shown: gameData.choices_shown || false
        });
      }

      // Get all players
      const { data: players, error: playersError } = await supabase
        .from("game_players")
        .select("user_id")
        .eq("game_id", gameId);

      if (playersError) {
        console.log('Error fetching players:', playersError);
        return;
      }

      // Get user profiles
      const userIds = players?.map(p => p.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("user_id, first_name, last_name, experience_level")
        .in("user_id", userIds);

      if (profilesError) {
        console.log('Error fetching profiles:', profilesError);
      }

      // Create progress array
      const progress: PlayerProgress[] = (players || []).map(player => {
        const profile = profiles?.find(p => p.user_id === player.user_id);
        return {
          user_id: player.user_id,
          current_question: 0,
          score: 0,
          completed: false,
          user_profile: profile ? {
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            experience_level: profile.experience_level || 'Beginner'
          } : undefined
        };
      });

      setPlayerProgress(progress);
      setIsInitialized(true);
      console.log('[HOST] Initialization complete');
    };

    initializeGame();
  }, [gameId, isInitialized, supabase]); // Add isInitialized to dependencies

  // Real-time game state updates
  useEffect(() => {
    const channel = supabase
      .channel("game_state")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        (payload) => {
          const newGameState = payload.new as GameState;
          console.log('[HOST] Game state update received:', newGameState);
          
          setGameState({
            phase: newGameState.phase || 'lobby',
            current_question_sequence: newGameState.current_question_sequence || 0,
            is_answer_revealed: newGameState.is_answer_revealed || false,
            question_start_time: newGameState.question_start_time,
            choices_shown: newGameState.choices_shown || false
          });

          // Reset state when new question starts
          if (newGameState.current_question_sequence !== gameState.current_question_sequence) {
            console.log('[HOST] New question starting, resetting state...');
            setHasShownChoices(false);
            setTimeLeft(QUESTION_TIME);
            stateRef.current = { hasShownChoices: false };
          }

          // Show choices when server flag is set
          if (newGameState.choices_shown && !hasShownChoices) {
            console.log('[HOST] Server flag shows choices should be visible, setting hasShownChoices to true');
            setHasShownChoices(true);
            stateRef.current = { hasShownChoices: true };
          } else {
            console.log('[HOST] Not setting hasShownChoices:', { hasShownChoices, is_answer_revealed: newGameState.is_answer_revealed, choices_shown: newGameState.choices_shown });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, hasShownChoices, gameState.current_question_sequence]); // Remove dependencies that cause infinite loops

  // Real-time progress updates
  useEffect(() => {
    const channel = supabase
      .channel("game_progress")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_progress", filter: `game_id=eq.${gameId}` },
        (payload) => {
          const progress = payload.new as PlayerProgress;
          console.log('Progress update:', progress);
          
          setPlayerProgress(prev => 
            prev.map(p => 
              p.user_id === progress.user_id 
                ? { ...p, current_question: progress.current_question, score: progress.score, completed: progress.completed }
                : p
            )
          );

          // Check for winner
          if (progress.score >= 10 && gameState.phase === 'quiz') {
            console.log('Winner found:', progress.user_id);
            onGameEnd(progress.user_id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, onGameEnd, gameState.phase]); // Remove gameState.phase to prevent infinite loops

  // Timer countdown for host
  useEffect(() => {
    if (gameState.phase === 'quiz' && !gameState.is_answer_revealed && hasShownChoices && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameState.is_answer_revealed && hasShownChoices) {
      // Time's up - reveal answer
      handleTimeUp();
    }
  }, [timeLeft, gameState.phase, gameState.is_answer_revealed, hasShownChoices, handleTimeUp]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        console.log('[HOST] Cleaning up timeout on unmount');
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const startGame = async () => {
    console.log('[HOST] Starting game...');
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    const { error } = await supabase
      .from("games")
      .update({ 
        phase: 'quiz',
        current_question_sequence: 0,
        is_answer_revealed: false,
        choices_shown: false,
        question_start_time: new Date().toISOString()
      })
      .eq("id", gameId);

    if (error) {
      console.log('[HOST] Error starting game:', error);
      return;
    }

    console.log('[HOST] Game started successfully, setting up 2-second timeout...');

    // Show choices after 2 seconds
    console.log('[HOST] Timeout created, will fire in 2 seconds');
    timeoutRef.current = setTimeout(async () => {
      console.log('[HOST] 2-second timeout fired! Setting choices_shown to true');
      const { error: updateError } = await supabase
        .from("games")
        .update({ choices_shown: true })
        .eq("id", gameId);

      if (updateError) {
        console.log('[HOST] Error showing choices:', updateError);
      } else {
        console.log('[HOST] Successfully set choices_shown to true automatically');
        // Immediately update local state to avoid race condition
        setHasShownChoices(true);
        stateRef.current = { hasShownChoices: true };
      }
      timeoutRef.current = null;
    }, 2000);
  };

  const nextQuestion = async () => {
    const nextSequence = gameState.current_question_sequence + 1;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (nextSequence >= 10) {
      // Game finished
      const { error } = await supabase
        .from("games")
        .update({ phase: 'result' })
        .eq("id", gameId);

      if (error) {
        console.log('[HOST] Error ending game:', error);
      }
    } else {
      // Next question
      const { error } = await supabase
        .from("games")
        .update({ 
          current_question_sequence: nextSequence,
          is_answer_revealed: false,
          choices_shown: false,
          question_start_time: new Date().toISOString()
        })
        .eq("id", gameId);

      if (error) {
        console.log('[HOST] Error moving to next question:', error);
        return;
      }

      console.log('[HOST] Next question started, setting up 2-second timeout...');

      // Show choices after 2 seconds for new question
      console.log('[HOST] Timeout created for new question, will fire in 2 seconds');
      timeoutRef.current = setTimeout(async () => {
        console.log('[HOST] 2-second timeout fired for new question! Setting choices_shown to true');
        const { error: updateError } = await supabase
          .from("games")
          .update({ choices_shown: true })
          .eq("id", gameId);

        if (updateError) {
          console.log('[HOST] Error showing choices:', updateError);
        } else {
          console.log('[HOST] Successfully set choices_shown to true for new question automatically');
          // Immediately update local state to avoid race condition
          setHasShownChoices(true);
          stateRef.current = { hasShownChoices: true };
        }
        timeoutRef.current = null;
      }, 2000);
    }
  };

  // Lobby screen
  if (gameState.phase === 'lobby') {
    return (
      <div className="text-center p-8">
        <h2 className="text-3xl font-bold text-blue-600 mb-4">Game Lobby</h2>
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-600 mb-2">Players ({playerProgress.length}):</h3>
          {playerProgress.map((player) => (
            <div key={player.user_id} className="text-gray-700 py-1">
              {player.user_profile?.first_name && player.user_profile?.last_name
                ? `${player.user_profile.first_name} ${player.user_profile.last_name}`
                : player.user_id}
            </div>
          ))}
        </div>
        <button
          onClick={startGame}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg"
        >
          Start Game
        </button>
      </div>
    );
  }

  // Quiz screen
  if (gameState.phase === 'quiz') {
    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header with timer and controls */}
        <div className="bg-blue-600 text-white p-4">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold">
              Question {gameState.current_question_sequence + 1} of 10
            </div>
            <div className="text-2xl font-bold">
              {timeLeft}s
            </div>
          </div>
          <div className="mt-2 bg-blue-500 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft / QUESTION_TIME) * 100}%` }}
            />
          </div>
        </div>

        {/* Host controls */}
        <div className="p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Host Controls
            </h2>
            {!gameState.is_answer_revealed && hasShownChoices && (
              <button
                onClick={handleTimeUp}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
              >
                Reveal Answer Now
              </button>
            )}
            {gameState.is_answer_revealed && (
              <button
                onClick={nextQuestion}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
              >
                {gameState.current_question_sequence + 1 >= 10 ? 'End Game' : 'Next Question'}
              </button>
            )}
            {!gameState.choices_shown && (
              <div className="text-gray-600">
                Waiting for choices to appear...
                <button
                  onClick={async () => {
                    console.log('[HOST] Manual debug: Setting choices_shown to true');
                    const { error } = await supabase
                      .from("games")
                      .update({ choices_shown: true })
                      .eq("id", gameId);
                    if (error) {
                      console.log('[HOST] Manual debug error:', error);
                    } else {
                      console.log('[HOST] Manual debug: Successfully set choices_shown to true');
                    }
                  }}
                  className="ml-2 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                >
                  Force Show Choices
                </button>
              </div>
            )}
          </div>

          {/* Player progress */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Players Progress</h3>
            <div className="space-y-2">
              {playerProgress.map(player => (
                <div key={player.user_id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {player.user_profile?.first_name ? player.user_profile.first_name[0] : 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">
                        {player.user_profile?.first_name && player.user_profile?.last_name
                          ? `${player.user_profile.first_name} ${player.user_profile.last_name}`
                          : player.user_id}
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {player.score}/10
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full border border-white shadow-sm ${
                            i < player.current_question
                              ? 'bg-green-500'
                              : i < player.score
                              ? 'bg-yellow-500'
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (gameState.phase === 'result') {
    const sortedPlayers = [...playerProgress].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
      <div className="text-center p-8">
        <h2 className="text-3xl font-bold text-blue-600 mb-4">Game Results</h2>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-600 mb-2">Final Scores:</h3>
          {sortedPlayers.map((player, index) => (
            <div key={player.user_id} className={`flex justify-between items-center py-1 ${player.user_id === winner?.user_id ? 'font-bold text-blue-700' : ''}`}>
              <span className="text-gray-700">
                {index === 0 ? "🥇 " : index === 1 ? "🥈 " : index === 2 ? "🥉 " : ""}
                {player.user_profile?.first_name && player.user_profile?.last_name
                  ? `${player.user_profile.first_name} ${player.user_profile.last_name}`
                  : player.user_id}
              </span>
              <span className="font-semibold text-blue-600">{player.score}/10</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
} 