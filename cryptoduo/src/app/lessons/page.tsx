'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavBar from '../../components/NavBar';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

const cryptoQuestions: Question[] = [
  {
    id: 1,
    question: "What is the maximum supply of Bitcoin?",
    options: ["21 million", "100 million", "1 billion", "Unlimited"],
    correctAnswer: 0,
    explanation: "Bitcoin has a fixed maximum supply of 21 million coins, making it deflationary by design.",
    category: "Bitcoin Basics"
  },
  {
    id: 2,
    question: "What does 'HODL' mean in crypto slang?",
    options: ["Hold On for Dear Life", "High Order Digital Ledger", "Hold", "High Output Digital Logic"],
    correctAnswer: 0,
    explanation: "HODL originated from a typo of 'HOLD' and now means 'Hold On for Dear Life' - a strategy of holding crypto long-term.",
    category: "Crypto Culture"
  },
  {
    id: 3,
    question: "Which consensus mechanism does Ethereum 2.0 use?",
    options: ["Proof of Work", "Proof of Stake", "Proof of Authority", "Proof of Space"],
    correctAnswer: 1,
    explanation: "Ethereum 2.0 uses Proof of Stake (PoS) which is more energy-efficient than Proof of Work.",
    category: "Blockchain Technology"
  },
  {
    id: 4,
    question: "What is a 'whale' in cryptocurrency?",
    options: ["A large fish", "Someone who owns a lot of crypto", "A type of mining rig", "A blockchain protocol"],
    correctAnswer: 1,
    explanation: "A 'whale' is someone who owns a large amount of cryptocurrency and can influence market prices.",
    category: "Trading Terms"
  },
  {
    id: 5,
    question: "What does 'DYOR' stand for?",
    options: ["Do Your Own Research", "Don't Yield On Returns", "Digital Yield Over Risk", "Decentralized Yield Options"],
    correctAnswer: 0,
    explanation: "DYOR means 'Do Your Own Research' - always research before investing in any cryptocurrency.",
    category: "Investment Tips"
  },
  {
    id: 6,
    question: "What is a 'smart contract'?",
    options: ["A legal document", "Self-executing code on blockchain", "A trading agreement", "A wallet feature"],
    correctAnswer: 1,
    explanation: "Smart contracts are self-executing programs that automatically enforce agreements when conditions are met.",
    category: "Blockchain Technology"
  },
  {
    id: 7,
    question: "What does 'FOMO' mean in crypto?",
    options: ["Fear Of Missing Out", "First Order Market Option", "Fast Order Market", "Future Order Market"],
    correctAnswer: 0,
    explanation: "FOMO means 'Fear Of Missing Out' - the anxiety that others are making money while you're not.",
    category: "Trading Psychology"
  },
  {
    id: 8,
    question: "What is 'DeFi' short for?",
    options: ["Decentralized Finance", "Digital Finance", "Direct Finance", "Dynamic Finance"],
    correctAnswer: 0,
    explanation: "DeFi stands for 'Decentralized Finance' - financial services built on blockchain without intermediaries.",
    category: "DeFi"
  }
];

export default function LessonsPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  const currentQuestion = cryptoQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / cryptoQuestions.length) * 100;

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && !showResults && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up - mark as answered without selecting an answer
            setIsAnswered(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLoading, showResults, timeLeft]);

  const handleAnswer = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < cryptoQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
    setTimeLeft(30);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-black">
          <div className="text-6xl mb-4">🚀</div>
          <div className="text-2xl font-bold mb-4">Loading Crypto Lessons...</div>
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = (score / cryptoQuestions.length) * 100;
    const getMessage = () => {
      if (percentage >= 80) return "🎉 Crypto Master!";
      if (percentage >= 60) return "👍 Great Job!";
      if (percentage >= 40) return "📚 Keep Learning!";
      return "💪 Don't Give Up!";
    };

    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="bg-gray-100 rounded-3xl p-8 max-w-md w-full text-center text-black border border-gray-200">
          <div className="text-6xl mb-4">{percentage >= 80 ? "🏆" : percentage >= 60 ? "🎯" : "📚"}</div>
          <h1 className="text-3xl font-bold mb-4">{getMessage()}</h1>
          <div className="text-6xl font-bold mb-4 text-blue-600">
            {score}/{cryptoQuestions.length}
          </div>
          <div className="text-xl mb-6">{percentage}%</div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
            <div className="h-3 rounded-full bg-blue-600" style={{ width: `${percentage}%` }}></div>
          </div>
          <div className="space-y-4">
            <button
              onClick={handleRestart}
              className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-full"
            >
              🔄 Try Again
            </button>
            <Link
              href="/"
              className="block w-full bg-gray-100 text-blue-600 font-bold py-3 px-6 rounded-full border border-blue-600"
            >
              🏠 Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <NavBar />
      <div className="max-w-4xl mx-auto pl-64">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-600">
            ← Back to Home
          </Link>
          <div className="text-blue-600 text-lg font-bold">
            Crypto Lessons
          </div>
          <div className="text-blue-600">
            Question {currentQuestionIndex + 1} of {cryptoQuestions.length}
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-blue-600 text-sm mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="h-3 rounded-full bg-blue-600"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        {/* Timer */}
        <div className="text-center mb-8">
          <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'}`}>⏱️ {timeLeft}s</div>
        </div>
        {/* Question Card */}
        <div className="bg-gray-100 rounded-3xl p-8 mb-8 border border-gray-200">
          <div className="text-center mb-6">
            <div className="text-sm text-blue-600 mb-2">{currentQuestion.category}</div>
            <h2 className="text-2xl md:text-3xl font-bold text-blue-600 mb-4">
              {currentQuestion.question}
            </h2>
          </div>
          {/* Answer Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isAnswered}
                className={`w-full p-4 rounded-2xl text-left border-2
                  ${isAnswered
                    ? index === currentQuestion.correctAnswer
                      ? 'bg-white text-blue-600 border-blue-600'
                      : index === selectedAnswer
                      ? 'bg-red-100 text-red-600 border-red-600'
                      : 'bg-gray-100 text-blue-600 border-transparent'
                    : selectedAnswer === index
                    ? 'bg-blue-100 text-blue-600 border-blue-600'
                    : 'bg-gray-100 text-blue-600 border-transparent'}
                `}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                    isAnswered
                      ? index === currentQuestion.correctAnswer
                        ? 'bg-blue-600 text-white'
                        : index === selectedAnswer
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-blue-600'
                      : 'bg-gray-200 text-blue-600'
                  }`}>
                    {isAnswered && index === currentQuestion.correctAnswer && '✓'}
                    {isAnswered && index === selectedAnswer && index !== currentQuestion.correctAnswer && '✗'}
                    {!isAnswered && String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
          {/* Explanation */}
          {isAnswered && (
            <div className="mt-6 p-4 bg-white rounded-2xl border border-gray-200">
              <div className="text-blue-600 font-semibold mb-2">💡 Explanation:</div>
              <div className="text-blue-600">{currentQuestion.explanation}</div>
            </div>
          )}
        </div>
        {/* Score */}
        <div className="text-center mb-8">
          <div className="text-blue-600 text-lg">
            Score: <span className="text-blue-600 font-bold">{score}</span> / {cryptoQuestions.length}
          </div>
        </div>
        {/* Next Button */}
        {isAnswered && (
          <div className="text-center">
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white font-bold py-4 px-8 rounded-full text-lg"
            >
              {currentQuestionIndex < cryptoQuestions.length - 1 ? 'Next Question →' : 'See Results'}
            </button>
          </div>
        )}
      </div>
      {/* Floating elements */}
      <div className="fixed top-20 right-10 text-4xl opacity-10">💎</div>
      <div className="fixed bottom-20 left-10 text-3xl opacity-10">⚡</div>
      <div className="fixed top-1/3 left-10 text-3xl opacity-10">🔄</div>
      <div className="fixed bottom-1/3 right-20 text-4xl opacity-10">📈</div>
    </div>
  );
} 