"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../utils/supabase/server";
import NavBar from "../../components/NavBar";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Simulated progress data
  const progress = {
    lessonsCompleted: 3,
    totalLessons: 8,
    streak: 2,
    lastLesson: 'Bitcoin Basics',
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/auth");
      } else {
        setUser(data.user);
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <NavBar />
      <div className="flex flex-col items-center justify-center pt-16">
        <div className="bg-white/10 p-8 rounded-2xl shadow-lg flex flex-col gap-4 w-full max-w-xl text-center mt-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.email}!</h1>
          <p className="text-white mb-4">Access your learning modules and track your progress here.</p>
          <div className="flex flex-col md:flex-row gap-6 justify-center mb-6">
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl p-4 text-white shadow-xl flex-1">
              <div className="text-lg font-bold mb-1">Lessons Completed</div>
              <div className="text-2xl">{progress.lessonsCompleted} / {progress.totalLessons}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl p-4 text-white shadow-xl flex-1">
              <div className="text-lg font-bold mb-1">Current Streak</div>
              <div className="text-2xl">🔥 {progress.streak} days</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 text-white shadow-xl flex-1">
              <div className="text-lg font-bold mb-1">Last Lesson</div>
              <div className="text-2xl">{progress.lastLesson}</div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-4">
            <Link href="/lessons" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 px-6 rounded-full mb-2 md:mb-0">
              🚀 Continue Learning
            </Link>
            <Link href="/notes" className="bg-white/20 text-white font-bold py-3 px-6 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300">
              📝 My Notes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 