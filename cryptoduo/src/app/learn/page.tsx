"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/server";
import NavBar from "@/components/NavBar";
import Image from 'next/image';

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

function isGuest() {
  if (typeof window === 'undefined') return false;
  const firstName = localStorage.getItem('firstName');
  return !!firstName;
}

export default function CryptoPathPage() {
  const [section, setSection] = useState<Section | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const [guestName, setGuestName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const firstName = localStorage.getItem('firstName');
      setGuestName(firstName);
      if (isGuest()) {
        setShowGuestPopup(true);
      }
    }
  }, []);

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

  // Hardcoded quests for gamified quest bar
  const quests = [
    {
      id: 1,
      title: "Complete Your First Lesson",
      description: "Finish any lesson to earn 10 XP.",
      icon: "🎯",
      progress: 1,
      total: 1,
      reward: "+10 XP",
      completed: true
    },
    {
      id: 2,
      title: "Daily Streak",
      description: "Log in and complete a lesson today.",
      icon: "🔥",
      progress: 1,
      total: 1,
      reward: "+5 XP",
      completed: true
    },
    {
      id: 3,
      title: "Answer 5 Questions Correctly",
      description: "Get 5 questions right in any lesson.",
      icon: "✅",
      progress: 3,
      total: 5,
      reward: "+15 XP",
      completed: false
    },
    {
      id: 4,
      title: "Invite a Friend",
      description: "Invite a friend to join DeCrypto.",
      icon: "🤝",
      progress: 0,
      total: 1,
      reward: "+20 XP",
      completed: false
    }
  ];

  return (
    <div className="overflow-x-hidden w-full min-h-screen bg-white">
      <NavBar />
      {/* Guest Greeting Popup */}
      {showGuestPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center animate-fade-in">
            <div className="text-5xl mb-4">👋</div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Welcome{guestName ? `, ${guestName}` : ''}!</h2>
            <p className="text-gray-700 text-center mb-6">We&apos;re excited to have you on DeCrypto.<br/>Start your journey with the Multiplayer Quiz!</p>
            <button
              onClick={() => { setShowGuestPopup(false); window.location.href = '/multiplayer'; }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg w-full mb-2"
            >
              🚀 Go to Multiplayer Quiz
            </button>
            <button
              onClick={() => setShowGuestPopup(false)}
              className="text-gray-500 text-sm mt-2 hover:underline"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
      <main className="flex flex-col md:flex-row min-h-screen bg-white w-full max-w-full overflow-x-hidden">
        {/* Left Column - Banner and Quiz Path */}
        <div className="flex-1 flex flex-col items-center px-2 sm:px-4 py-8 md:py-12 w-full max-w-full overflow-x-hidden">
          {loading ? (
            <p className="text-2xl text-blue-500">Loading...</p>
          ) : (
            <div className="flex flex-col items-center w-full max-w-2xl">
              {/* Section Header */}
              <div className="bg-[#7CD35E] text-white rounded-2xl px-2 sm:px-6 py-6 mb-10 shadow flex flex-col sm:flex-row items-center sm:justify-between w-full max-w-full min-h-[80px] relative overflow-x-auto">
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
                          <Image 
                            src="/btc_non_hover.png" 
                            alt="Lesson" 
                            width={128}
                            height={128}
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
                            <Image 
                              src="/btc_non_hover.png" 
                              alt="Lesson" 
                              width={128}
                              height={128}
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
        <div className="w-full md:w-[400px] lg:w-[600px] bg-white border-t md:border-t-0 md:border-l border-gray-200 p-4 md:p-8 max-w-full overflow-x-hidden overflow-y-auto" style={{maxHeight: '100vh'}}>
          <h2 className="text-2xl font-bold text-black mb-4">Quests</h2>
          <div className="flex flex-col gap-6">
            {quests.map(quest => (
              <div
                key={quest.id}
                className={`flex items-center gap-4 p-4 rounded-2xl shadow-sm border transition-all duration-200
                  ${quest.completed ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200 hover:shadow-md'}`}
              >
                <span className="text-4xl">{quest.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg ${quest.completed ? 'text-green-700' : 'text-blue-700'}`}>{quest.title}</span>
                    {quest.completed && <span className="ml-2 px-2 py-0.5 text-xs bg-green-200 text-green-800 rounded-full font-bold">Completed</span>}
                  </div>
                  <div className="text-gray-600 text-sm mb-2">{quest.description}</div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-3 rounded-full ${quest.completed ? 'bg-green-400' : 'bg-blue-400'}`}
                        style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{quest.progress}/{quest.total}</span>
                    <span className="ml-auto text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">{quest.reward}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
