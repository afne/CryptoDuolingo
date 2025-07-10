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
      <main className="ml-64 min-h-screen flex flex-col items-center justify-center bg-white p-8">
        {loading ? (
          <p className="text-2xl text-blue-500">Loading lesson...</p>
        ) : lesson ? (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-700 mb-4">{lesson.name}</h1>
            <p className="text-gray-600">Lesson content coming soon...</p>
          </div>
        ) : (
          <p className="text-red-500">Lesson not found.</p>
        )}
      </main>
    </div>
  );
}
