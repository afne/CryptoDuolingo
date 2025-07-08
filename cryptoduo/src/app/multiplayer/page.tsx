"use client";
import { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import { createClient } from "../../utils/supabase/server";

// Types
interface Game {
  id: string;
  code: string;
  created_by: string;
  started: boolean;
}
interface Player {
  id: string;
  user_id: string;
  game_id: string;
  joined_at: string;
  user_email?: string;
}

export default function MultiplayerPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchPlayersFn, setFetchPlayersFn] = useState<(() => void) | null>(null);

  // Helper: log errors
  const log = (...args: unknown[]) => { if (typeof window !== 'undefined') console.log(...args); };

  // Get current user
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email });
      }
    });
  }, []);

  // Remove user from game on exit
  useEffect(() => {
    const handleExit = async () => {
      if (user && game) {
        const supabase = createClient();
        await supabase.from("game_players").delete().match({ user_id: user.id, game_id: game.id });
      }
    };
    window.addEventListener("beforeunload", handleExit);
    return () => {
      handleExit();
      window.removeEventListener("beforeunload", handleExit);
    };
  }, [user, game]);

  // Real-time player list and game status updates
  useEffect(() => {
    if (!game) return;
    const supabase = createClient();

    // Fetch players
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from("game_players")
        .select("*")
        .eq("game_id", game.id);
      if (error) log('fetchPlayers error:', error);
      log('Fetched players:', data);
      setPlayers((data as Player[]) || []);
    };
    setFetchPlayersFn(() => fetchPlayers);
    fetchPlayers();

    // Fetch game (for started status)
    const fetchGame = async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", game.id)
        .maybeSingle();
      if (error) log('fetchGame error:', error);
      if (data) setGame(data as Game);
    };

    // Subscribe to player changes
    const playerChannel = supabase
      .channel("game_players_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_players", filter: `game_id=eq.${game.id}` },
        (_payload: unknown) => {
          log('Realtime event');
          fetchPlayers();
        }
      )
      .subscribe();

    // Subscribe to game changes (for started status)
    const gameChannel = supabase
      .channel("games_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games", filter: `id=eq.${game.id}` },
        fetchGame
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playerChannel);
      supabase.removeChannel(gameChannel);
    };
  }, [game]);

  // Start Game
  const handleStartGame = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();
    // Check if already in a game
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
    // Generate unique 6-digit code
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
    // Create game
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
    // Add self to game_players
    await supabase.from("game_players").insert({ game_id: newGame.id, user_id: user.id });
    setGame(newGame);
    setLoading(false);
    setJoinError("");
  };

  // Join Game
  const handleJoinGame = async () => {
    if (!user) return;
    setLoading(true);
    setJoinError("");
    const supabase = createClient();
    // Check if already in a game
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
    // Find game by code
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
    // Add to game_players
    await supabase.from("game_players").insert({ game_id: foundGame.id, user_id: user.id });
    setGame(foundGame);
    setLoading(false);
  };

  // Exit Game
  const handleExitGame = async () => {
    if (!user || !game) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("game_players").delete().match({ user_id: user.id, game_id: game.id });
    if (error) log('Exit error:', error);
    setGame(null);
    setPlayers([]);
    setJoinError("");
    setLoading(false);
  };

  // UI
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <div className="flex flex-col items-center justify-center min-h-screen pl-64 bg-blue-50">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 mt-12 mb-12 border border-blue-100">
          <h1 className="text-4xl font-extrabold text-blue-700 mb-6 tracking-tight">Multiplayer</h1>
          {!user && <p className="text-lg text-gray-700 mb-8">Sign in to play.</p>}
          {user && !game && (
            <>
              <div className="flex flex-col gap-6 mb-8">
                <button
                  className="bg-blue-600 hover:bg-blue-700 transition text-white font-bold py-3 px-8 rounded-full text-lg shadow-md"
                  onClick={handleStartGame}
                  disabled={loading}
                >
                  Start Game
                </button>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleJoinGame();
                  }}
                  className="flex gap-2 items-center justify-center"
                >
                  <input
                    type="text"
                    maxLength={6}
                    minLength={6}
                    pattern="[0-9]{6}"
                    placeholder="Enter code"
                    className="border border-blue-300 rounded-full px-4 py-2 text-lg text-blue-700 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 w-36 text-center tracking-widest"
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    className="bg-white text-blue-600 font-bold py-2 px-6 rounded-full text-lg border border-blue-600 hover:bg-blue-50 transition shadow-sm"
                    disabled={loading}
                  >
                    Join Game
                  </button>
                </form>
              </div>
              {joinError && <div className="text-red-600 mb-4 font-semibold">{joinError}</div>}
            </>
          )}
          {user && game && (
            <>
              <div className="mb-6">
                <div className="text-lg text-gray-700">Game Code:</div>
                <div className="text-5xl font-mono font-extrabold text-blue-700 tracking-widest mb-2 bg-blue-100 rounded-xl py-2 select-all">
                  {game.code}
                </div>
                <button
                  className="text-sm text-blue-600 underline mb-2 hover:text-blue-800"
                  onClick={() => {
                    navigator.clipboard.writeText(game.code);
                  }}
                >
                  Copy Code
                </button>
              </div>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg text-gray-700 font-semibold">Players</div>
                  {fetchPlayersFn && (
                    <button
                      className="text-blue-600 underline text-sm hover:text-blue-800"
                      onClick={() => fetchPlayersFn()}
                    >
                      Refresh
                    </button>
                  )}
                </div>
                <ul className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex flex-col gap-2">
                  {players.length === 0 && (
                    <li className="text-gray-400 italic">No players yet</li>
                  )}
                  {players.map(p => (
                    <li key={p.id} className="text-blue-700 font-semibold flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                      <span className="break-all">{p.user_id}</span>
                      {p.user_id === game.created_by && <span className="ml-2 text-xs text-white bg-blue-600 rounded-full px-2 py-0.5">Host</span>}
                    </li>
                  ))}
                </ul>
              </div>
              {user.id === game.created_by && !game.started && (
                <button
                  className="bg-green-600 hover:bg-green-700 transition text-white font-bold py-2 px-6 rounded-full text-lg mb-4 shadow-md"
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.from("games").update({ started: true }).eq("id", game.id);
                    setGame({ ...game, started: true });
                  }}
                >
                  Start Game
                </button>
              )}
              {game.started && (
                <div className="text-green-600 font-bold mb-4 text-lg">Game has started!</div>
              )}
              <button
                className="bg-red-500 hover:bg-red-600 transition text-white font-bold py-2 px-6 rounded-full text-lg shadow-md"
                onClick={handleExitGame}
                disabled={loading}
              >
                Exit Game
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 