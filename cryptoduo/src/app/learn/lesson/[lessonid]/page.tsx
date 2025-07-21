"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import NavBar from "@/components/NavBar";

interface Lesson {
  id: string;
  name: string;
  description?: string;
  content?: string;
}

export default function LessonPage() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lessonId) {
      console.warn("No lessonId in URL");
      return;
    }
  
    const fetchLesson = async () => {
      const supabase = createClient();
      console.log("Fetching lesson with ID:", lessonId);
  
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();
  
      if (error) {
        console.error("Error from Supabase:", error);
      } else if (!data) {
        console.warn("No lesson found with that ID.");
      } else {
        console.log("Lesson found:", data);
      }
  
      setLesson(data);
      setLoading(false);
    };
  
    fetchLesson();
  }, [lessonId]);
  

  return (
    <div>
      <NavBar />
      <main className="ml-64 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-8">
        {loading ? (
          <p className="text-2xl text-blue-500">Loading lesson...</p>
        ) : lesson ? (
          <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center gap-6">
            {/* Gamified Header */}
            <div className="w-full flex flex-col items-center gap-2 mb-2">
              <span className="text-5xl">📘</span>
              <h1 className="text-3xl font-extrabold text-blue-700 mb-1">{lesson.name}</h1>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-500 text-lg">⭐</span>
                <span className="text-sm font-semibold text-gray-700">XP Progress</span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-2 bg-yellow-400 rounded-full" style={{ width: '40%' }} />
                </div>
                <span className="text-xs font-bold text-yellow-600 ml-2">40/100 XP</span>
              </div>
            </div>
            {/* Lesson Content Placeholder */}
            <div className="w-full bg-blue-50 rounded-xl p-6 text-center text-lg text-gray-700 min-h-[120px] flex items-center justify-center">
              Lesson content coming soon...
            </div>
            <button className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-full font-bold text-lg shadow hover:bg-blue-700 transition">Start Lesson</button>
          </div>
        ) : (
          <p className="text-red-500">Lesson not found.</p>
        )}
      </main>
    </div>
  );
}
