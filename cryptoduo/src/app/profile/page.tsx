"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/server";
import NavBar from "../../components/NavBar";

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  country: string;
  favorite_crypto: string;
  experience_level: string;
  bio: string;
  timezone: string;
  notification_preferences: boolean;
  created_at: string;
  updated_at: string;
}

const experienceLevels = [
  "Beginner",
  "Intermediate", 
  "Advanced",
  "Expert"
];

const popularCryptos = [
  "Bitcoin (BTC)",
  "Ethereum (ETH)",
  "Cardano (ADA)",
  "Solana (SOL)",
  "Polkadot (DOT)",
  "Chainlink (LINK)",
  "Polygon (MATIC)",
  "Avalanche (AVAX)",
  "Cosmos (ATOM)",
  "Uniswap (UNI)"
];

const countries = [
  "United States", "Canada", "United Kingdom", "Germany", "France", "Australia", "Japan", "South Korea", "India", "Brazil",
  "Mexico", "Argentina", "Chile", "Colombia", "Peru", "Venezuela", "Uruguay", "Paraguay", "Bolivia", "Ecuador",
  "Spain", "Italy", "Netherlands", "Belgium", "Switzerland", "Austria", "Sweden", "Norway", "Denmark", "Finland",
  "Poland", "Czech Republic", "Hungary", "Romania", "Bulgaria", "Greece", "Portugal", "Ireland", "New Zealand", "Singapore",
  "Hong Kong", "Taiwan", "Thailand", "Vietnam", "Malaysia", "Indonesia", "Philippines", "Pakistan", "Bangladesh", "Sri Lanka",
  "South Africa", "Nigeria", "Kenya", "Ghana", "Egypt", "Morocco", "Tunisia", "Algeria", "Ethiopia", "Uganda"
].sort();

// Function to get crypto emoji
const getCryptoEmoji = (cryptoName: string): string => {
  const cryptoEmojis: { [key: string]: string } = {
    "Bitcoin (BTC)": "₿",
    "Ethereum (ETH)": "Ξ",
    "Cardano (ADA)": "₳",
    "Solana (SOL)": "◎",
    "Polkadot (DOT)": "🔗",
    "Chainlink (LINK)": "🔗",
    "Polygon (MATIC)": "🔷",
    "Avalanche (AVAX)": "❄️",
    "Cosmos (ATOM)": "🌌",
    "Uniswap (UNI)": "🦄"
  };
  return cryptoEmojis[cryptoName] || "💰";
};

export default function ProfilePage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    country: "",
    favorite_crypto: "",
    experience_level: "Beginner",
    bio: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notification_preferences: true
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/auth");
      } else {
        setUser({ id: data.user.id, email: data.user.email });
        loadProfile(data.user.id);
      }
    });
  }, [router]);

  const loadProfile = async (userId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error("Error loading profile:", error);
    }

    if (data) {
      setProfile(data);
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        country: data.country || "",
        favorite_crypto: data.favorite_crypto || "",
        experience_level: data.experience_level || "Beginner",
        bio: data.bio || "",
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        notification_preferences: data.notification_preferences ?? true
      });
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage("");

    const supabase = createClient();
    
    const profileData = {
      user_id: user.id,
      ...formData,
      updated_at: new Date().toISOString()
    };

    let result;
    if (profile) {
      // Update existing profile
      result = await supabase
        .from("user_profiles")
        .update(profileData)
        .eq("user_id", user.id)
        .select()
        .maybeSingle();
    } else {
      // Create new profile
      result = await supabase
        .from("user_profiles")
        .insert(profileData)
        .select()
        .maybeSingle();
    }

    if (result.error) {
      setMessage("Error saving profile: " + result.error.message);
    } else {
      setProfile(result.data);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    }
    setSaving(false);
  };

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
        {!isEditing ? (
          // Display Profile View
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl mt-8 overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white text-center">
              <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                {profile?.favorite_crypto ? getCryptoEmoji(profile.favorite_crypto) : '👤'}
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}` 
                  : user?.email?.split('@')[0] || 'Crypto User'}
              </h1>
              <p className="text-blue-100 text-lg">
                {profile?.favorite_crypto || 'Crypto Enthusiast'}
              </p>
            </div>

            {/* Profile Stats */}
            <div className="flex justify-around py-6 border-b border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-gray-600 text-sm">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-gray-600 text-sm">Following</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{profile?.experience_level || 'Beginner'}</div>
                <div className="text-gray-600 text-sm">Level</div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">About</h2>
                <p className="text-gray-600 leading-relaxed">
                  {profile?.bio || "No bio yet. Tell us about yourself!"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Experience Level</div>
                  <div className="font-semibold text-blue-600">{profile?.experience_level || 'Beginner'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Favorite Crypto</div>
                  <div className="font-semibold text-blue-600">{profile?.favorite_crypto || 'Not set'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Country</div>
                  <div className="font-semibold text-blue-600">{profile?.country || 'Not set'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Timezone</div>
                  <div className="font-semibold text-blue-600">{profile?.timezone || 'Not set'}</div>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg transition-colors"
              >
                ✏️ Edit Profile
              </button>
            </div>
          </div>
        ) : (
          // Edit Profile View
          <div className="bg-gray-100 p-8 rounded-2xl flex flex-col gap-6 w-full max-w-2xl mt-8 border border-gray-200">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-blue-600 mb-2">Edit Profile</h1>
              <p className="text-blue-600">Update your personal information and preferences</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-blue-600 mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white"
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white"
                >
                  <option value="">Select your country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            {/* Crypto Preferences */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-blue-600 mb-4">Crypto Preferences</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Cryptocurrency</label>
                  <select
                    name="favorite_crypto"
                    value={formData.favorite_crypto}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white"
                  >
                    <option value="">Select your favorite crypto</option>
                    {popularCryptos.map(crypto => (
                      <option key={crypto} value={crypto}>{crypto}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                  <select
                    name="experience_level"
                    value={formData.experience_level}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white"
                  >
                    {experienceLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-blue-600 mb-4">Preferences</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white"
                  >
                    {Intl.supportedValuesOf('timeZone').map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="notification_preferences"
                    checked={formData.notification_preferences}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Receive email notifications
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 justify-center">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors"
              >
                Cancel
              </button>
            </div>

            {message && (
              <div className={`text-center p-3 rounded-lg ${
                message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}>
                {message}
              </div>
            )}
          </form>
        </div>
        )}
      </div>
    </div>
  );
} 