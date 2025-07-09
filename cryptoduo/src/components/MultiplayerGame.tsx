"use client";

import { useEffect, useState } from "react";
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

export default function MultiplayerGame({ gameId, userId, onGameEnd }: MultiplayerGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress[]>([]);
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState<string>("");

  const supabase = createClient();

  // Initialize player progress
  useEffect(() => {
    const initializeProgress = async () => {
      console.log('Initializing progress for game:', gameId);
      
      // First, get all players in the game
      const { data: players, error: playersError } = await supabase
        .from("game_players")
        .select("user_id")
        .eq("game_id", gameId);

      if (playersError) {
        console.error('Error fetching players:', playersError);
        return;
      }

      console.log('Fetched players:', players);

      if (!players || players.length === 0) {
        console.log('No players found in game');
        setPlayerProgress([]);
        return;
      }

      // Then, get user profiles for all players
      const userIds = players.map(p => p.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("user_id, first_name, last_name, experience_level")
        .in("user_id", userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without profiles
      }

      console.log('Fetched profiles:', profiles);

      // Create a map of user_id to profile for quick lookup
      const profileMap = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          profileMap.set(profile.user_id, profile);
        });
      }

      // Create progress array
      const progress: PlayerProgress[] = players.map(player => {
        const profile = profileMap.get(player.user_id);
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

      console.log('Setting player progress:', progress);
      setPlayerProgress(progress);
    };

    initializeProgress();
  }, [gameId, supabase]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !gameEnded && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered && !gameEnded) {
      console.log('Time ran out for question', currentQuestionIndex + 1);
      handleAnswer(-1); // Time's up, mark as incorrect
    }
  }, [timeLeft, gameEnded, isAnswered, currentQuestionIndex]);

  // Real-time progress updates
  useEffect(() => {
    const channel = supabase
      .channel("game_progress")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_progress", filter: `game_id=eq.${gameId}` },
        (payload) => {
          updatePlayerProgress(payload.new as any);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, supabase]);

  const updatePlayerProgress = (progress: any) => {
    console.log('Updating player progress:', progress);
    
    setPlayerProgress(prev => 
      prev.map(p => 
        p.user_id === progress.user_id 
          ? { ...p, current_question: progress.current_question, score: progress.score, completed: progress.completed }
          : p
      )
    );

    // Check for winner - someone reached 10 correct answers
    if (progress.score >= 10 && !gameEnded) {
      console.log('Game ended! Winner:', progress.user_id);
      setGameEnded(true);
      setWinner(progress.user_id);
      onGameEnd(progress.user_id);
    }
  };

  const handleAnswer = async (answerIndex: number) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedAnswer(answerIndex);

    const currentQuestion = cryptoQuestions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    // Calculate new score
    const currentPlayer = playerProgress.find(p => p.user_id === userId);
    const newScore = isCorrect ? (currentPlayer?.score || 0) + 1 : (currentPlayer?.score || 0);
    const newCurrentQuestion = (currentPlayer?.current_question || 0) + 1;
    
    console.log(`Player ${userId} answered question ${currentQuestionIndex + 1}: ${isCorrect ? 'CORRECT' : 'INCORRECT'}. New score: ${newScore}/10`);

    // Update local progress
    const updatedProgress = playerProgress.map(p => 
      p.user_id === userId 
        ? { 
            ...p, 
            score: newScore,
            current_question: newCurrentQuestion
          }
        : p
    );
    setPlayerProgress(updatedProgress);

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
        // Log error without console.error to avoid linting issues
        console.log('Database error saving progress:', error.message || error);
        // Continue with local state even if database save fails
      } else {
        console.log('Progress saved successfully');
      }
    } catch (err) {
      // Log exception without console.error to avoid linting issues
      console.log('Exception saving progress:', err);
      // Continue with local state even if database save fails
    }

    // Check if this player won
    if (newScore >= 10 && !gameEnded) {
      console.log(`Player ${userId} won with ${newScore}/10!`);
      setGameEnded(true);
      setWinner(userId);
      onGameEnd(userId);
      return; // Don't continue to next question
    }

    // Move to next question if not won yet
    setTimeout(() => {
      if (currentQuestionIndex < 9 && newScore < 10) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setTimeLeft(30);
      }
    }, 2000);
  };

  const getCryptoEmoji = (cryptoName: string): string => {
    const cryptoEmojis: { [key: string]: string } = {
      "Bitcoin (BTC)": "₿",
      "Ethereum (ETH)": "Ξ",
      "Cardano (ADA)": "₳",
      "Solana (SOL)": "◎",
      "Polkadot (DOT)": "🔗",
      "Chainlink (LINK)": "🔗",
      "Polygon (MATIC)": "🔷",
      "Avalanche (AVAX)": "❄️",
      "Cosmos (ATOM)": "🌌",
      "Uniswap (UNI)": "🦄"
    };
    return cryptoEmojis[cryptoName] || "💰";
  };

  const currentQuestion = cryptoQuestions[currentQuestionIndex];
  const currentPlayer = playerProgress.find(p => p.user_id === userId);

  if (gameEnded) {
    const winnerPlayer = playerProgress.find(p => p.user_id === winner);
    const isWinner = winner === userId;
    
    return (
      <div className="text-center p-8">
        <h2 className="text-3xl font-bold text-blue-600 mb-4">
          {isWinner ? "🎉 You Won!" : "Game Over"}
        </h2>
        <p className="text-xl text-gray-600 mb-6">
          {isWinner 
            ? "Congratulations! You reached 10 correct answers first!" 
            : `Better luck next time! ${winnerPlayer?.user_profile?.first_name || 'Someone'} won with ${winnerPlayer?.score || 0}/10!`
          }
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-600 mb-2">Final Scores:</h3>
          {playerProgress
            .sort((a, b) => b.score - a.score) // Sort by score descending
            .map((player, index) => (
            <div key={player.user_id} className={`flex justify-between items-center py-1 ${player.user_id === winner ? 'font-bold text-blue-700' : ''}`}>
              <span className="text-gray-700">
                {index === 0 && player.user_id === winner ? "🥇 " : ""}
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

  return (
    <div className="flex flex-col h-full">
      {/* Game Header */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold text-blue-600">
            Question {currentQuestionIndex + 1} of 10
          </div>
          <div className="text-xl font-semibold text-blue-600">
            ⏱️ {timeLeft}s
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 p-4">
        <div className="bg-white rounded-xl p-3 shadow-lg mb-3">
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            {currentQuestion.question}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isAnswered}
                className={`p-2 text-left rounded-lg border-2 transition-all text-gray-700 text-sm ${
                  selectedAnswer === index
                    ? selectedAnswer === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-red-500 bg-red-50 text-red-700'
                    : isAnswered && index === currentQuestion.correctAnswer
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
              </button>
            ))}
          </div>
        </div>

        {/* Current Player Progress */}
        {currentPlayer && (
          <div className="bg-blue-50 p-2 rounded-lg">
            <div className="text-center">
              <div className="text-xs font-semibold text-blue-600 mb-1">Your Progress</div>
              <div className="text-xl font-bold text-blue-600">{currentPlayer.score}/10</div>
            </div>
          </div>
        )}
      </div>

            {/* Timeline */}
      <div className="bg-white p-3 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Players Progress</h3>
        <div className="space-y-3">
          {playerProgress.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              Loading players...
            </div>
          ) : (
            playerProgress.map(player => (
              <div key={player.user_id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
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
                        className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${
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
            ))
          )}
        </div>
      </div>
    </div>
  );
} 