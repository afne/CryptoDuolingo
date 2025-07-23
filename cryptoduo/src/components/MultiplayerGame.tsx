"use client";

import { useState, useEffect, useCallback } from "react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface MultiplayerGameProps {
  userId: string;
  onGameEnd: (winner: string) => void;
}

const cryptoQuestions: Question[] = [
  {
    id: 1,
    question: "What is Bitcoin's maximum supply?",
    options: ["21 million", "100 million", "1 billion", "Unlimited"],
    correctAnswer: 0
  },
  {
    id: 2,
    question: "Who is the creator of Bitcoin?",
    options: ["Vitalik Buterin", "Satoshi Nakamoto", "Elon Musk", "Charlie Lee"],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "What does DeFi stand for?",
    options: ["Decentralized Finance", "Definite Finance", "Defined Funds", "Digital Fiat"],
    correctAnswer: 0
  },
  {
    id: 4,
    question: "Which blockchain introduced smart contracts?",
    options: ["Bitcoin", "Ethereum", "Dogecoin", "Litecoin"],
    correctAnswer: 1
  },
  {
    id: 5,
    question: "What is the native token of the Solana blockchain?",
    options: ["SOL", "ETH", "BTC", "ADA"],
    correctAnswer: 0
  },
  {
    id: 6,
    question: "Which consensus mechanism does Bitcoin use?",
    options: ["Proof of Stake", "Proof of Work", "Delegated Proof of Stake", "Proof of Authority"],
    correctAnswer: 1
  },
  {
    id: 7,
    question: "What is a private key used for?",
    options: ["To mine coins", "To sign transactions", "To view balances", "To create NFTs"],
    correctAnswer: 1
  },
  {
    id: 8,
    question: "Which of these is a stablecoin?",
    options: ["USDT", "BTC", "ETH", "SOL"],
    correctAnswer: 0
  },
  {
    id: 9,
    question: "What is the main purpose of an NFT?",
    options: ["Fungible currency", "Unique digital asset", "Mining", "Staking"],
    correctAnswer: 1
  },
  {
    id: 10,
    question: "Which network is known for low fees and fast transactions?",
    options: ["Ethereum", "Solana", "Bitcoin", "Dogecoin"],
    correctAnswer: 1
  }
];

const QUESTION_TIME = 10; // seconds per question

export default function MultiplayerGame({ userId, onGameEnd }: MultiplayerGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [quizEnded, setQuizEnded] = useState(false);
  const [lastPoints, setLastPoints] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);

  const handleAnswer = useCallback((answerIdx: number | null) => {
    if (quizEnded) return;
    const question = cryptoQuestions[currentQuestion];
    let points = 0;
    let newStreak = streak;
    let newMultiplier = multiplier;
    if (answerIdx !== null && answerIdx === question.correctAnswer) {
      // Increase streak and multiplier
      newStreak = streak + 1;
      newMultiplier = 1 + newStreak * 0.2;
      points = Math.max(0, Math.round((timeLeft / QUESTION_TIME) * 1000 * newMultiplier));
      setScore(s => s + points);
      setCorrectCount(c => c + 1);
      setStreak(newStreak);
      setMultiplier(newMultiplier);
    } else {
      // Reset streak and multiplier
      setStreak(0);
      setMultiplier(1);
    }
    setLastPoints(points);
    setSelectedAnswer(answerIdx);
    setTimeout(() => {
      setLastPoints(null);
      if (currentQuestion < cryptoQuestions.length - 1) {
        setCurrentQuestion(q => q + 1);
        setSelectedAnswer(null);
        setTimeLeft(QUESTION_TIME);
      } else {
        setQuizEnded(true);
      }
    }, 1200);
  }, [quizEnded, currentQuestion, timeLeft, streak, multiplier]);

  useEffect(() => {
    if (timeLeft > 0 && !quizEnded) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !quizEnded) {
      handleAnswer(null); // Time's up, no answer
    }
  }, [timeLeft, quizEnded, handleAnswer]);

  useEffect(() => {
    if (quizEnded) {
      // Store in localStorage
      localStorage.setItem('mp_points', String(score));
      localStorage.setItem('mp_correct', String(correctCount));
      // Optionally push to DB here
      if (onGameEnd) onGameEnd(userId);
    }
    // Always include userId in the dependency array, even if it is undefined
    // This ensures the array size/order is always the same
  }, [quizEnded, score, correctCount, onGameEnd, userId]);

  if (quizEnded || currentQuestion >= cryptoQuestions.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-6">
        <h2 className="text-3xl font-bold text-blue-700">Quiz Complete!</h2>
        <div className="text-xl">Score: <span className="font-bold">{score}</span></div>
        <div className="text-lg">Correct Answers: <span className="font-bold">{correctCount}</span> / {cryptoQuestions.length}</div>
      </div>
    );
  }

  const question = cryptoQuestions[currentQuestion];

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-6">
      <div className="w-full flex justify-between items-center mb-2">
        <span className="text-lg font-bold text-blue-700">Question {currentQuestion + 1} / {cryptoQuestions.length}</span>
        <span className="text-lg font-bold text-green-600">{timeLeft}s</span>
        <span className="ml-4 text-sm text-yellow-600 font-bold">Streak: {streak} | Multiplier: {multiplier.toFixed(1)}x</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">{question.question}</h2>
      <div className="w-full flex flex-col gap-4">
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            disabled={selectedAnswer !== null}
            onClick={() => handleAnswer(idx)}
            className={`w-full py-3 rounded-xl border text-lg font-semibold transition-all
              ${selectedAnswer === null ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900' :
                idx === question.correctAnswer ? 'bg-green-200 border-green-400 text-green-900' :
                selectedAnswer === idx ? 'bg-red-200 border-red-400 text-red-900' :
                'bg-gray-100 border-gray-200 text-gray-400'}`}
          >
            {opt}
          </button>
        ))}
      </div>
      {selectedAnswer !== null && (
        <div className="mt-4 text-lg font-bold text-gray-700">
          {selectedAnswer === question.correctAnswer ? (
            <>
              Correct!{' '}
              <span className="text-green-600">+{lastPoints} points</span>
              <span className="ml-2 text-yellow-600">(Streak: {streak}, {multiplier.toFixed(1)}x)</span>
            </>
          ) : (
            'Incorrect!'
          )}
        </div>
      )}
    </div>
  );
} 