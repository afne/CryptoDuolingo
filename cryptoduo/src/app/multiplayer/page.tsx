"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/NavBar";
import MultiplayerGame from "../../components/MultiplayerGame";
import MultiplayerHost from "../../components/MultiplayerHost";
import { createClient } from "../../utils/supabase/server";

// Types
interface Game {
  id: string;
  code: string;
  created_by: string;
  started: boolean;
  phase?: 'lobby' | 'quiz' | 'result';
  current_question_sequence?: number;
  is_answer_revealed?: boolean;
  question_start_time?: string;
}
interface Player {
  id: string;
  user_id: string;
  game_id: string;
  joined_at: string;
  user_email?: string;
  user_profile?: {
    first_name: string;
    last_name: string;
    experience_level: string;
  };
}

export default function MultiplayerPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchPlayersFn, setFetchPlayersFn] = useState<(() => void) | null>(null);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  // Leaderboard state
  const [quizStarted, setQuizStarted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const log = (...args: unknown[]) => { if (typeof window !== 'undefined') console.log(...args); };

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

  const removeStalePlayerEntry = async (supabase: any, userId: string) => {
    const { data: playerEntry } = await supabase
      .from("game_players")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (playerEntry) {
      const { data: stillValidGame } = await supabase
        .from("games")
        .select("id")
        .eq("id", playerEntry.game_id)
        .maybeSingle();

      if (!stillValidGame) {
        await supabase.from("game_players").delete().eq("user_id", userId);
      }
    }
  };

  // Move handleExit out and rename to handleExitGame
  const handleExitGame = async () => {
    const supabase = createClient();
    if (!user || !game) return;

    try {
      if (user.id === game.created_by) {
        await supabase.from("game_players").delete().eq("game_id", game.id);
        await supabase.from("games").delete().eq("id", game.id);
      } else {
        await supabase.from("game_players").delete().match({ user_id: user.id, game_id: game.id });
      }
    } catch (err) {
      console.error("Error during exit (unload):", err);
    }
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleExitGame);
    return () => {
      handleExitGame();
      window.removeEventListener("beforeunload", handleExitGame);
    };
  }, [user, game]);

  useEffect(() => {
    const handleRouteChange = () => {
      handleExitGame();
    };

    // Remove router.events usage since AppRouterInstance does not have events
    // Instead, you may need to use a different approach for route change cleanup in Next.js App Router
    // For now, comment out the following lines to avoid errors
    // router.events?.on("routeChangeStart", handleRouteChange);
    // return () => {
    //   router.events?.off("routeChangeStart", handleRouteChange);
    // };
    // If you want to handle route changes, consider using useRouter's hooks or context
  }, [user, game]);

  const handleStartGame = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();

    await removeStalePlayerEntry(supabase, user.id);

    const { data: existing } = await supabase
      .from("game_players")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) {
      setJoinError("You are already in a game. Exit first.");
      setLoading(false);
      return;
    }

    let code = "";
    let tries = 0;
    while (tries < 5) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      const { data: exists } = await supabase.from("games").select("*").eq("code", code).maybeSingle();
      if (!exists) break;
      tries++;
    }
    if (!code) {
      setJoinError("Failed to generate unique code.");
      setLoading(false);
      return;
    }

    const { data: newGame, error: gameError } = await supabase
      .from("games")
      .insert({ code, created_by: user.id })
      .select()
      .maybeSingle();
    if (gameError || !newGame) {
      setJoinError("Failed to create game.");
      setLoading(false);
      return;
    }

    await supabase.from("game_players").insert({ game_id: newGame.id, user_id: user.id });
    setGame(newGame);
    setLoading(false);
    setJoinError("");
  };

  const handleJoinGame = async () => {
    if (!user) return;
    setLoading(true);
    setJoinError("");
    const supabase = createClient();

    await removeStalePlayerEntry(supabase, user.id);

    const { data: existing } = await supabase
      .from("game_players")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) {
      setJoinError("You are already in a game. Exit first.");
      setLoading(false);
      return;
    }

    const { data: foundGame } = await supabase
      .from("games")
      .select("*")
      .eq("code", joinCode)
      .eq("started", false)
      .maybeSingle();
    if (!foundGame) {
      setJoinError("Game not found or already started.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("game_players").insert({ game_id: foundGame.id, user_id: user.id });
    if (insertError) {
      setJoinError("Failed to join game.");
      setLoading(false);
      return;
    }
    setGame(foundGame);
    setLoading(false);
  };

  // Helper to determine if user is host
  const isHost = user && game && user.id === game.created_by;

  // Leave game handler
  const handleLeaveGame = async () => {
    if (!user || !game) return;
    setLoading(true);
    const supabase = createClient();
    try {
      if (isHost) {
        await supabase.from("game_players").delete().eq("game_id", game.id);
        await supabase.from("games").delete().eq("id", game.id);
      } else {
        await supabase.from("game_players").delete().match({ user_id: user.id, game_id: game.id });
      }
      setGame(null);
      setPlayers([]);
      setJoinCode("");
      setJoinError("");
    } catch (err) {
      setJoinError("Failed to leave game.");
    }
    setLoading(false);
  };

  // Fetch leaderboard (top 10 scores)
  const fetchLeaderboard = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('leaderboard')
      .select('name, score, created_at')
      .order('score', { ascending: false })
      .limit(10);
    setLeaderboard(data || []);
    setShowLeaderboard(true);
  };

  // Game end callback for MultiplayerGame
  const handleGameEnd = async () => {
    let name = user?.email || 'Guest';
    let score = Number(localStorage.getItem('mp_points') || '0');
    // Insert score into Supabase leaderboard table
    const supabase = createClient();
    await supabase.from('leaderboard').insert({ name, score, created_at: new Date().toISOString() });
    // Fetch top scores for leaderboard
    await fetchLeaderboard();
  };

  // Allow player to start quiz
  const handlePlayerStartQuiz = () => {
    if (!game) return;
    // Set game phase to 'quiz' in DB
    const supabase = createClient();
    supabase.from('games').update({ phase: 'quiz', started: true }).eq('id', game.id);
    setGame({ ...game, phase: 'quiz', started: true });
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
    let name = user?.email || 'Guest';
    // Remove old score (delete all for this name)
    await supabase.from('leaderboard').delete().eq('name', name);
    setShowLeaderboard(false);
    setQuizStarted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <NavBar />
      <main className="ml-64 flex flex-col items-center justify-center min-h-screen p-8">
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
            <MultiplayerGame gameId={"single-session"} userId={user ? user.id : "local-user"} onGameEnd={handleGameEnd} />
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
