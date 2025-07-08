"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/server";
import NavBar from "../../components/NavBar";

type User = { email?: string } | null;

export default function Dashboard() {
  const [user, setUser] = useState<User>(null);
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-black text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <div className="flex flex-col items-center justify-center pt-16 pl-64">
        <div className="bg-gray-100 p-8 rounded-2xl flex flex-col gap-4 w-full max-w-xl text-center mt-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Welcome, {user?.email}!</h1>
          <p className="text-blue-600 mb-4">Access your learning modules and track your progress here.</p>
          <div className="flex flex-col md:flex-row gap-6 justify-center mb-6">
            <div className="bg-white rounded-2xl p-4 text-blue-600 flex-1 border border-gray-200">
              <div className="text-lg font-bold mb-1">Lessons Completed</div>
              <div className="text-2xl">{progress.lessonsCompleted} / {progress.totalLessons}</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-blue-600 flex-1 border border-gray-200">
              <div className="text-lg font-bold mb-1">Current Streak</div>
              <div className="text-2xl">🔥 {progress.streak} days</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-blue-600 flex-1 border border-gray-200">
              <div className="text-lg font-bold mb-1">Last Lesson</div>
              <div className="text-2xl">{progress.lastLesson}</div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-4">
          </div>
        </div>
      </div>
    </div>
  );
} 