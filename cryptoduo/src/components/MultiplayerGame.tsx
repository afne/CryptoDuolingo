"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "../utils/supabase/server";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

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

interface MultiplayerGameProps {
  gameId: string;
  userId: string;
  onGameEnd: (winner: string) => void;
}

const cryptoQuestions: Question[] = [
  {
    id: 1,
    question: "What is the maximum supply of Bitcoin?",
    options: ["21 million", "100 million", "1 billion", "Unlimited"],
    correctAnswer: 0
  },
  {
    id: 2,
    question: "Who created Bitcoin?",
    options: ["Vitalik Buterin", "Satoshi Nakamoto", "Charlie Lee", "Roger Ver"],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "What consensus mechanism does Ethereum 2.0 use?",
    options: ["Proof of Work", "Proof of Stake", "Proof of Authority", "Delegated Proof of Stake"],
    correctAnswer: 1
  },
  {
    id: 4,
    question: "What is a smart contract?",
    options: ["A legal document", "Self-executing code on blockchain", "A cryptocurrency wallet", "A mining algorithm"],
    correctAnswer: 1
  },
  {
    id: 5,
    question: "What does 'HODL' mean in crypto slang?",
    options: ["Hold On for Dear Life", "High Order Digital Ledger", "Hold", "High Output Digital Logic"],
    correctAnswer: 0
  },
  {
    id: 6,
    question: "What is the purpose of a non-fungible token (NFT)?",
    options: ["To replace fiat currency", "To represent unique digital assets", "To mine cryptocurrency", "To secure transactions"],
    correctAnswer: 1
  },
  {
    id: 7,
    question: "What is the 'blockchain trilemma'?",
    options: ["Security, Scalability, Decentralization", "Speed, Cost, Privacy", "Mining, Staking, Trading", "Bitcoin, Ethereum, Altcoins"],
    correctAnswer: 0
  },
  {
    id: 8,
    question: "What is a 'whale' in cryptocurrency?",
    options: ["A large holder of cryptocurrency", "A type of mining rig", "A blockchain protocol", "A trading algorithm"],
    correctAnswer: 0
  },
  {
    id: 9,
    question: "What does 'FOMO' stand for in crypto?",
    options: ["Fear Of Missing Out", "First Order Market Order", "Fast Online Money Order", "Future Of Money Online"],
    correctAnswer: 0
  },
  {
    id: 10,
    question: "What is the purpose of a private key?",
    options: ["To encrypt transactions", "To prove ownership of cryptocurrency", "To mine blocks", "To validate transactions"],
    correctAnswer: 1
  }
];

const QUESTION_TIME = 20; // seconds per question

export default function MultiplayerGame({ gameId, userId, onGameEnd }: MultiplayerGameProps) {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'lobby',
    current_question_sequence: 0,
    is_answer_revealed: false
  });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress[]>([]);
  const [hasShownChoices, setHasShownChoices] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const supabase = createClient();
  const stateRef = useRef<{ selectedAnswer: number | null; hasAnswered: boolean }>({ selectedAnswer: null, hasAnswered: false });

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
      console.log('Initializing game:', gameId);
      
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

      console.log('Initial game data:', gameData);

      if (gameData) {
        const newGameState = {
          phase: gameData.phase || 'lobby',
          current_question_sequence: gameData.current_question_sequence || 0,
          is_answer_revealed: gameData.is_answer_revealed || false,
          question_start_time: gameData.question_start_time,
          choices_shown: gameData.choices_shown || false
        };
        
        console.log('Setting initial game state:', newGameState);
        setGameState(newGameState);

        // Fallback: If game is already in quiz phase and choices are shown, set hasShownChoices
        if (newGameState.phase === 'quiz' && newGameState.choices_shown && !newGameState.is_answer_revealed) {
          console.log('[FALLBACK] Setting hasShownChoices to true on initial load');
          setHasShownChoices(true);
          // Also reset answer state on initial load
          setSelectedAnswer(null);
          stateRef.current = { selectedAnswer: null, hasAnswered: false };
          console.log('[FALLBACK] Reset answer state on initial load');
        } else {
          console.log('[FALLBACK] Not setting hasShownChoices on initial load:', newGameState);
        }
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
      console.log('[PLAYER] Initialization complete');
    };

    initializeGame();
  }, [gameId, isInitialized]); // Add isInitialized to dependencies

  // Real-time game state updates
  useEffect(() => {
    console.log('Setting up real-time subscription for game:', gameId);
    
    const channel = supabase
      .channel("game_state")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        (payload) => {
          const newGameState = payload.new as GameState;
          console.log('Game state update received:', newGameState);
          console.log('Current game state:', gameState);
          
          const oldPhase = gameState.phase;
          const oldQuestionSequence = gameState.current_question_sequence;
          
          setGameState({
            phase: newGameState.phase || 'lobby',
            current_question_sequence: newGameState.current_question_sequence || 0,
            is_answer_revealed: newGameState.is_answer_revealed || false,
            question_start_time: newGameState.question_start_time,
            choices_shown: newGameState.choices_shown || false
          });

          // Game just started (phase changed from lobby to quiz)
          if (newGameState.phase === 'quiz' && oldPhase === 'lobby') {
            console.log('[REALTIME] Game started! Resetting state for first question...');
            setHasShownChoices(false);
            setTimeLeft(QUESTION_TIME);
            setSelectedAnswer(null);
            stateRef.current = { selectedAnswer: null, hasAnswered: false };
            console.log('[REALTIME] First question state reset complete');
          }

          // Reset state when new question starts
          if (newGameState.current_question_sequence !== oldQuestionSequence) {
            console.log('[REALTIME] New question starting, resetting state...');
            console.log(`[REALTIME] Question changed from ${oldQuestionSequence} to ${newGameState.current_question_sequence}`);
            setSelectedAnswer(null);
            setHasShownChoices(false);
            setTimeLeft(QUESTION_TIME);
            stateRef.current = { selectedAnswer: null, hasAnswered: false };
            console.log('[REALTIME] State reset complete');
          }

          // Show choices when server flag is set
          if (newGameState.choices_shown && !hasShownChoices && !newGameState.is_answer_revealed) {
            console.log('[REALTIME] Server flag shows choices should be visible, setting hasShownChoices to true');
            setHasShownChoices(true);
            // Ensure answer state is reset when choices are shown
            if (stateRef.current.hasAnswered) {
              console.log('[REALTIME] Resetting answer state when choices are shown');
              setSelectedAnswer(null);
              stateRef.current = { selectedAnswer: null, hasAnswered: false };
            }
          } else {
            console.log('[REALTIME] Not setting hasShownChoices:', { hasShownChoices, is_answer_revealed: newGameState.is_answer_revealed, choices_shown: newGameState.choices_shown });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [gameId]); // Remove dependencies that cause infinite loops

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
  }, [gameId, onGameEnd]); // Remove gameState.phase to prevent infinite loops

  // Timer countdown
  useEffect(() => {
    if (gameState.phase === 'quiz' && !gameState.is_answer_revealed && hasShownChoices && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameState.is_answer_revealed && hasShownChoices) {
      // Time's up - reveal answer
      handleTimeUp();
    }
  }, [timeLeft, gameState.phase, gameState.is_answer_revealed, hasShownChoices, handleTimeUp]);

  const handleAnswer = async (answerIndex: number) => {
    if (stateRef.current.hasAnswered || gameState.is_answer_revealed || !hasShownChoices) {
      console.log('[ANSWER] Blocked from answering:', { 
        hasAnswered: stateRef.current.hasAnswered, 
        is_answer_revealed: gameState.is_answer_revealed, 
        hasShownChoices 
      });
      return;
    }

    console.log(`[ANSWER] Player ${userId} answering question ${gameState.current_question_sequence + 1} with option ${answerIndex}`);
    
    setSelectedAnswer(answerIndex);
    stateRef.current = { selectedAnswer: answerIndex, hasAnswered: true };

    const currentQuestion = cryptoQuestions[gameState.current_question_sequence];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    console.log(`[ANSWER] Question: "${currentQuestion.question}"`);
    console.log(`[ANSWER] Selected: ${answerIndex}, Correct: ${currentQuestion.correctAnswer}, IsCorrect: ${isCorrect}`);

    // Calculate score based on time remaining
    const timeBonus = Math.round((timeLeft / QUESTION_TIME) * 100);
    const score = isCorrect ? 100 + timeBonus : 0;

    console.log(`[ANSWER] Player ${userId} answered: ${isCorrect ? 'CORRECT' : 'INCORRECT'}, Score: ${score}`);

    // Update local progress
    const currentPlayer = playerProgress.find(p => p.user_id === userId);
    const newScore = (currentPlayer?.score || 0) + (isCorrect ? 1 : 0);
    const newCurrentQuestion = (currentPlayer?.current_question || 0) + 1;

    console.log(`[ANSWER] Updating score from ${currentPlayer?.score || 0} to ${newScore}`);

    setPlayerProgress(prev => 
      prev.map(p => 
        p.user_id === userId 
          ? { ...p, score: newScore, current_question: newCurrentQuestion }
          : p
      )
    );

    // Save to database
    try {
      const { error } = await supabase.from("game_progress").upsert({
        game_id: gameId,
        user_id: userId,
        current_question: newCurrentQuestion,
        score: newScore,
        completed: newScore >= 10
      });

      if (error) {
        console.log('[ANSWER] Error saving progress:', error);
      } else {
        console.log('[ANSWER] Successfully saved progress to database');
      }
    } catch (err) {
      console.log('[ANSWER] Exception saving progress:', err);
    }
  };

  const currentQuestion = cryptoQuestions[gameState.current_question_sequence];

  // Lobby screen
  if (gameState.phase === 'lobby') {
    return (
      <div className="text-center p-8">
        <h2 className="text-3xl font-bold text-blue-600 mb-4">Waiting for host to start...</h2>
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-blue-600 mb-2">Players:</h3>
          {playerProgress.map((player) => (
            <div key={player.user_id} className="text-gray-700 py-1">
              {player.user_profile?.first_name && player.user_profile?.last_name
                ? `${player.user_profile.first_name} ${player.user_profile.last_name}`
                : player.user_id}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          Current phase: {gameState.phase} | Question: {gameState.current_question_sequence}
        </div>
        <button
          onClick={async () => {
            const { data, error } = await supabase
              .from("games")
              .select("*")
              .eq("id", gameId)
              .single();
            console.log('Manual refresh - Game data:', data, error);
            if (data) {
              setGameState({
                phase: data.phase || 'lobby',
                current_question_sequence: data.current_question_sequence || 0,
                is_answer_revealed: data.is_answer_revealed || false,
                question_start_time: data.question_start_time,
                choices_shown: data.choices_shown || false
              });
            }
          }}
          className="mt-2 text-sm text-blue-600 underline"
        >
          Refresh Game State
        </button>
      </div>
    );
  }

  // Quiz screen
  if (gameState.phase === 'quiz') {
    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header with timer and progress */}
        <div className="bg-blue-600 text-white p-4">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold">
              Question {gameState.current_question_sequence + 1} of {cryptoQuestions.length}
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

        {/* Question */}
        <div className="flex-1 p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Answer options */}
          {hasShownChoices && !gameState.is_answer_revealed && !stateRef.current.hasAnswered && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="p-4 text-left border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <div className="font-semibold text-blue-600 mb-1">
                    {String.fromCharCode(65 + index)}.
                  </div>
                  <div className="text-gray-800">{option}</div>
                </button>
              ))}
            </div>
          )}
          
          {/* Debug info */}
          <div className="mt-4 p-4 bg-gray-100 rounded text-xs">
            <div>Debug: hasShownChoices={hasShownChoices.toString()}</div>
            <div>Debug: is_answer_revealed={gameState.is_answer_revealed.toString()}</div>
            <div>Debug: hasAnswered={stateRef.current.hasAnswered.toString()}</div>
            <div>Debug: Question {gameState.current_question_sequence + 1}</div>
            <button
              onClick={() => {
                console.log('[DEBUG] Manual reset clicked');
                setSelectedAnswer(null);
                stateRef.current = { selectedAnswer: null, hasAnswered: false };
                console.log('[DEBUG] Manual reset complete');
              }}
              className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
            >
              Reset Answer State
            </button>
          </div>

          {/* Answer revealed */}
          {gameState.is_answer_revealed && (
            <div className="text-center">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">
                  {selectedAnswer === currentQuestion.correctAnswer ? '✅ Correct!' : '❌ Incorrect'}
                </h3>
                <p className="text-gray-600">
                  The correct answer was: {String.fromCharCode(65 + currentQuestion.correctAnswer)}. {currentQuestion.options[currentQuestion.correctAnswer]}
                </p>
              </div>
            </div>
          )}

          {/* Waiting for others */}
          {stateRef.current.hasAnswered && !gameState.is_answer_revealed && (
            <div className="text-center py-8">
              <div className="text-xl text-gray-600 mb-2">Waiting for others to answer...</div>
              <div className="text-sm text-gray-500">
                {playerProgress.length} players in game
              </div>
            </div>
          )}

          {/* Countdown before choices appear */}
          {!hasShownChoices && !gameState.is_answer_revealed && (
            <div className="text-center py-8">
              <div className="text-xl text-gray-600 mb-2">Get ready...</div>
              <div className="text-4xl font-bold text-blue-600">3</div>
            </div>
          )}
        </div>

        {/* Player progress */}
        <div className="bg-gray-50 p-4 border-t">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Players Progress</h3>
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
    );
  }

  // Results screen
  if (gameState.phase === 'result') {
    const sortedPlayers = [...playerProgress].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];
    const isWinner = winner?.user_id === userId;

    return (
      <div className="text-center p-8">
        <h2 className="text-3xl font-bold text-blue-600 mb-4">
          {isWinner ? "🎉 You Won!" : "Game Over"}
        </h2>
        <p className="text-xl text-gray-600 mb-6">
          {isWinner 
            ? "Congratulations! You reached 10 correct answers first!" 
            : `Better luck next time! ${winner?.user_profile?.first_name || 'Someone'} won with ${winner?.score || 0}/10!`
          }
        </p>
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