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
  // 1️⃣ Blockchain Basics
  {
    id: 1,
    question: "What is a blockchain?",
    options: [
      "A centralized database",
      "A linked list of transaction blocks",
      "A type of cryptocurrency",
      "A digital wallet"
    ],
    correctAnswer: 1
  },
  // B. A blockchain is a decentralized, linked list of blocks containing transactions.

  // 2️⃣ Public vs. Private Key
  {
    id: 2,
    question: "Which key should you keep secret?",
    options: [
      "Public key",
      "Private key",
      "Both keys",
      "Neither key"
    ],
    correctAnswer: 1
  },
  // B. The private key must remain secret to authorize spending; the public key can be shared.

  // 3️⃣ Crypto Wallet
  {
    id: 3,
    question: "What does a crypto wallet store?",
    options: [
      "Actual coins",
      "Private keys",
      "Exchange passwords",
      "Transaction fees"
    ],
    correctAnswer: 1
  },
  // B. Wallets store your private keys, which prove ownership of on‑chain assets.

  // 4️⃣ Bitcoin Supply
  {
    id: 4,
    question: "What is the maximum supply of Bitcoin?",
    options: [
      "21 million",
      "100 million",
      "84 million",
      "Unlimited"
    ],
    correctAnswer: 0
  },
  // A. Bitcoin’s protocol caps total issuance at 21 million BTC.

  // 5️⃣ Stablecoin Purpose
  {
    id: 5,
    question: "What is a “stablecoin” designed to do?",
    options: [
      "Increase volatility",
      "Track the price of gold",
      "Maintain a stable value",
      "Mine new coins"
    ],
    correctAnswer: 2
  },
  // C. Stablecoins aim to peg their value to an asset (e.g., USD) for price stability.

  // 6️⃣ Smart Contract
  {
    id: 6,
    question: "What is a smart contract?",
    options: [
      "A self‑executing contract on a blockchain",
      "A traditional paper agreement",
      "A type of hardware wallet",
      "A centralized exchange order"
    ],
    correctAnswer: 0
  },
  // A. Smart contracts are code that automatically enforces terms on‑chain.

  // 7️⃣ Mining
  {
    id: 7,
    question: "In proof‑of‑work systems, what does “mining” do?",
    options: [
      "Validates and adds new blocks",
      "Prints physical coins",
      "Sends transactions off‑chain",
      "Creates smart contracts"
    ],
    correctAnswer: 0
  },
  // A. Miners solve cryptographic puzzles to validate transactions and add blocks.

  // 8️⃣ Transaction Confirmation
  {
    id: 8,
    question: "What confirms a crypto transaction on the network?",
    options: [
      "Wallet backup",
      "Block validation",
      "Email notification",
      "API request"
    ],
    correctAnswer: 1
  },
  // B. Once a block containing your transaction is validated, it’s confirmed on‑chain.

  // 9️⃣ Coin vs. Token
  {
    id: 9,
    question: "What’s the main difference between a “coin” and a “token”?",
    options: [
      "Coins have no value",
      "Tokens run on existing blockchains",
      "Tokens are physical",
      "Coins are only on Ethereum"
    ],
    correctAnswer: 1
  },
  // B. Coins are native to their own blockchain; tokens are built on top of another chain.

  // 🔟 NFT Meaning
  {
    id: 10,
    question: "NFT stands for:",
    options: [
      "Non‑Fungible Token",
      "New Financial Technology",
      "Network Fee Token",
      "Non‑Finance Token"
    ],
    correctAnswer: 0
  },
  // A. NFTs are unique, indivisible tokens representing one‑of‑a‑kind digital items.

  // Candlestick Clue
  {
    id: 11,
    question: "You spot a single candle with a small body at the top, long lower wick, and little or no upper wick after a downtrend. What does this “hammer” signal typically suggest?",
    options: [
      "Continuation of bearish trend",
      "Potential bullish reversal",
      "Market indecision",
      "Imminent price crash"
    ],
    correctAnswer: 1
  },
  // B. A hammer after a downtrend often indicates buyers stepping in—possible bullish reversal.

  // Overbought or Oversold?
  {
    id: 12,
    question: "The RSI on BTC climbs above 80. What’s the classic interpretation?",
    options: [
      "Strong bullish momentum",
      "Overbought—possible pullback",
      "Oversold—time to buy",
      "Trend is neutral"
    ],
    correctAnswer: 1
  },
  // B. RSI above 70–80 usually flags overbought conditions, hinting at a corrective pullback ahead.

  // MACD Magic
  {
    id: 13,
    question: "When the MACD line crosses above the signal line, it’s known as a:",
    options: [
      "Death Cross",
      "Divergence",
      "Golden Cross",
      "Volume Spike"
    ],
    correctAnswer: 2
  }
  // C. A MACD “golden cross” suggests bullish momentum building.
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