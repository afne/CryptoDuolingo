"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/server";
import NavBar from "@/components/NavBar";

interface Section {
  id: string;
  order_index: number;
  name: string;
}

interface Unit {
  id: string;
  order_index: number;
  name: string;
}

interface Lesson {
  id: string;
  name: string;
  is_unlocked: boolean;
  order_index: number;
}

export default function CryptoPathPage() {
  const [section, setSection] = useState<Section | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCryptoPath = async () => {
      const supabase = createClient();

      // Fetch section: Introduction
      const { data: sectionData } = await supabase
        .from("sections")
        .select("*")
        .eq("name", "Introduction")
        .single();

      setSection(sectionData);

      // Fetch unit: What is Cryptocurrency?
      const { data: unitData } = await supabase
        .from("units")
        .select("*")
        .eq("section_id", sectionData.id)
        .eq("name", "What Is Cryptocurrency?")
        .single();

      setUnit(unitData);

      // Fetch lessons
      const { data: lessonData } = await supabase
        .from("lessons")
        .select("*")
        .eq("unit_id", unitData.id)
        .order("order_index");

      setLessons(lessonData || []);
      setLoading(false);
    };

    fetchCryptoPath();
  }, []);

  return (
    <div>
      <NavBar />
      <main className="ml-64 min-h-screen flex bg-white">
        {/* Left Column - Banner and Quiz Path */}
        <div className="flex-1 flex flex-col items-center px-4 py-12">
          {loading ? (
            <p className="text-2xl text-blue-500">Loading...</p>
          ) : (
            <div className="flex flex-col items-center w-full max-w-2xl">
              {/* Section Header */}
              <div className="bg-[#7CD35E] text-white rounded-2xl px-6 py-6 mb-10 shadow flex items-center justify-between w-full max-w-screen-2xl min-h-[80px] relative">
                {/* Left Arrow + Section Info */}
                <div className="flex items-center gap-4">
                  <span className="text-white text-3xl">←</span>
                  <div>
                    <p className="text-lg font-bold uppercase text-white/80">
                      Section {section?.order_index}, Unit {unit?.order_index}
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-extrabold">
                      {unit?.name}
                    </h1>
                  </div>
                </div>

                {/* Guidebook Button */}
                <button className="flex items-center gap-2 border-2 border-white rounded-xl px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors text-white font-semibold">
                  <span className="text-lg">📘</span>
                  <span className="uppercase text-sm font-bold tracking-wide">Guidebook</span>
                </button>
              </div>

              {/* Lesson Path */}
              <div className="relative flex flex-col items-center gap-6 mt-8">
                {[...lessons, ...Array(3).fill({ extra: true })].map((lesson, idx) => {
                  // Zig-zag pattern: left, center, right, center, ...
                  const positions = ["-ml-32", "ml-0", "ml-32", "ml-0"];
                  const posClass = positions[idx % positions.length];
                  const isExtra = 'extra' in lesson;
                  return (
                    <div key={lesson.id || `extra-btc-${idx}`} className={`flex flex-col items-center ${posClass} relative`} style={{ minHeight: '8rem' }}>
                      {isExtra ? (
                        <div className="w-32 h-32 rounded-full flex items-center justify-center shadow bg-white">
                          <img 
                            src="/btc_non_hover.png" 
                            alt="Lesson" 
                            className="w-32 h-32 transition-all"
                            onMouseEnter={(e) => {
                              e.currentTarget.src = '/btc_hover.png';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.src = '/btc_non_hover.png';
                            }}
                          />
                        </div>
                      ) : (
                        <a
                          href={`/learn/lesson/${lesson.id}`}
                          className={`w-32 h-32 rounded-full flex items-center justify-center shadow transition-all ${
                            lesson.is_unlocked ? "" : "opacity-50 pointer-events-none"
                          }`}
                        >
                          {lesson.is_unlocked ? (
                            <img 
                              src="/btc_non_hover.png" 
                              alt="Lesson" 
                              className="w-32 h-32 hover:src='/btc_hover.png' transition-all"
                              onMouseEnter={(e) => {
                                e.currentTarget.src = '/btc_hover.png';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.src = '/btc_non_hover.png';
                              }}
                            />
                          ) : (
                            <span className="text-4xl">🔒</span>
                          )}
                        </a>
                      )}
                      {/* Trail lines removed */}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Quests */}
        <div className="w-[600px] bg-white border-l border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-black mb-4">Quests</h2>
          <p className="text-gray-700">Quest content coming soon...</p>
        </div>
      </main>
    </div>
  );
}
