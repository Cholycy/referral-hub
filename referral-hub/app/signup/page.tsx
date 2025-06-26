/*
Copyright (c) 2025 cholycy@gmail.com
All rights reserved.
*/

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reminder, setReminder] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setReminder("");

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      if (error.message.includes("already registered") || error.message.includes("User already registered")) {
        setReminder("You are already registered. Please log in.");
      } else {
        setReminder(error.message);
      }
      setLoading(false);
      return;
    }
    setReminder("Check your email. If you've already signed up, use the login option or reset your password.");
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="w-full max-w-md">
        <form 
          onSubmit={handleSignUp}
          className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100 space-y-6"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-blue-700">Create Account</h2>
            <p className="text-gray-600 mt-2">Join ReferralHub today</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                placeholder="Create a strong password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>

          {reminder && (
            <div className={`p-4 rounded-lg ${reminder.includes("error") ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
              {reminder}
            </div>
          )}

          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button 
                onClick={() => router.replace('/?showLogin=1')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Log in
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
