"use client";
import { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import MultiplayerGame from "../../components/MultiplayerGame";
import { createClient } from "../../utils/supabase/server";

export default function MultiplayerPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  // Leaderboard state
  const [quizStarted, setQuizStarted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number; created_at: string }[]>([]);
  const [userScore, setUserScore] = useState<{ name: string; score: number; created_at: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email });
      } else {
        // Check for guest login (firstName in localStorage)
        if (typeof window !== 'undefined') {
          const firstName = localStorage.getItem('firstName');
          if (firstName) {
            setUser({ id: 'guest', email: firstName });
          }
        }
      }
    });
  }, []);

  // Fetch leaderboard (top 10 scores + user's score if not in top 10)
  const fetchLeaderboard = async () => {
    const supabase = createClient();
    const { data: topScores } = await supabase
      .from('leaderboard')
      .select('name, score, created_at')
      .order('score', { ascending: false })
      .limit(10);
    setLeaderboard(topScores || []);
    // Fetch user's score if not in top 10
    const name = user?.email || 'Guest';
    if (topScores && !topScores.some(entry => entry.name === name)) {
      const { data: userEntry } = await supabase
        .from('leaderboard')
        .select('name, score, created_at')
        .eq('name', name)
        .order('score', { ascending: false })
        .limit(1)
        .maybeSingle();
      setUserScore(userEntry || null);
    } else {
      setUserScore(null);
    }
    setShowLeaderboard(true);
  };

  // Game end callback for MultiplayerGame
  const handleGameEnd = async () => {
    const name = user?.email || 'Guest';
    const score = Number(localStorage.getItem('mp_points') || '0');
    // Insert score into Supabase leaderboard table
    const supabase = createClient();
    await supabase.from('leaderboard').insert({ name, score, created_at: new Date().toISOString() });
    // Fetch top scores for leaderboard
    await fetchLeaderboard();
  };

  // Poll leaderboard for live updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (showLeaderboard) {
      fetchLeaderboard();
      interval = setInterval(fetchLeaderboard, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showLeaderboard]);

  // Improve score handler
  const handleImproveScore = async () => {
    const supabase = createClient();
    const name = user?.email || 'Guest';
    // Remove old score (delete all for this name)
    await supabase.from('leaderboard').delete().eq('name', name);
    setShowLeaderboard(false);
    setQuizStarted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <NavBar />
      <main className="md:ml-64 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center gap-8">
          {!user && <div className="text-xl text-blue-600">Loading user...</div>}
          {!quizStarted && !showLeaderboard && (
            <>
              <h2 className="text-3xl font-extrabold text-blue-700 mb-4">Multiplayer Quiz</h2>
              <div className="w-full mb-4 p-4 bg-blue-50 rounded-xl text-blue-700 font-semibold text-center">
                Your score will be recorded live to the leaderboard!
              </div>
              <button
                onClick={() => setQuizStarted(true)}
                className="bg-green-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow hover:bg-green-700 transition"
              >
                Start Quiz
              </button>
              <button
                onClick={fetchLeaderboard}
                className="mt-4 bg-blue-100 text-blue-700 px-6 py-2 rounded-full font-semibold hover:bg-blue-200 transition"
              >
                View Leaderboard
              </button>
            </>
          )}
          {quizStarted && !showLeaderboard && (
            <MultiplayerGame userId={user ? user.id : "local-user"} onGameEnd={handleGameEnd} />
          )}
          {showLeaderboard && (
            <div className="w-full mt-8">
              <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Live Leaderboard</h2>
              <div className="bg-white rounded-xl shadow p-6">
                <table className="w-full text-left text-black">
                  <thead className="bg-gray-100 text-black">
                    <tr>
                      <th className="py-2 px-4 text-black">Player</th>
                      <th className="py-2 px-4 text-black">Score</th>
                      <th className="py-2 px-4 text-black">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-black">
                    {leaderboard.map((entry, idx) => (
                      <tr key={idx} className={idx === 0 ? 'font-bold text-blue-700' : ''}>
                        <td className="py-2 px-4">{entry.name}</td>
                        <td className="py-2 px-4">{entry.score}</td>
                        <td className="py-2 px-4">{new Date(entry.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {userScore && (
                      <>
                        <tr><td colSpan={3} className="py-2 text-center text-gray-400">...</td></tr>
                        <tr className="font-bold text-green-700">
                          <td className="py-2 px-4">{userScore.name} (You)</td>
                          <td className="py-2 px-4">{userScore.score}</td>
                          <td className="py-2 px-4">{new Date(userScore.created_at).toLocaleString()}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
                <div className="flex flex-col md:flex-row gap-4 mt-6">
                  <button
                    onClick={() => setShowLeaderboard(false)}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition w-full md:w-auto"
                  >
                    Close Leaderboard
                  </button>
                  <button
                    onClick={handleImproveScore}
                    className="bg-green-100 text-green-700 px-6 py-2 rounded-full font-semibold hover:bg-green-200 transition w-full md:w-auto"
                  >
                    Improve My Score
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
