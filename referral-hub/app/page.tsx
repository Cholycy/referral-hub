'use client';
// This is a simple referral hub application using Next.js and Supabase.
// It allows users to log in, view referrals, and submit new referrals.
// Users can also reset their passwords and manage their profiles.
// The application uses Supabase for authentication and database management.
// The code is structured to handle user authentication, referral fetching, and UI rendering.
// The main page includes a header with navigation links, a login form, and a section to display referrals.
// The application is styled using Tailwind CSS for a clean and modern look.

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [referrals, setReferrals] = useState<Array<{ id: string; title: string; url: string; description?: string; category?: string; expiration_date?: string }>>([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchReferrals = async () => {
      const { data, error } = await supabase.from("referrals").select("*");
      if (data) setReferrals(data);
    };
    if (user) fetchReferrals();
  }, [user]);

  useEffect(() => {
    // Show login form if redirected from logout
    if (searchParams.get('showLogin') === '1') {
      setShowLoginForm(true);
    }
  }, [searchParams]);

  const handleEmailLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert("Login error: " + error.message);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setShowLoginForm(false);
    }
  };

  const handleSignUp = async () => {

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {

      alert("Signup error: " + error.message);

    } else {

      alert("Signup successful! Check your email to confirm.");

      setIsSignUp(false);

    }

  };

  const handleForgotPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Password reset link sent to your email.");
    }
  };

  const filteredReferrals = searchCategory
    ? referrals.filter((ref) =>
        ref.category && ref.category.toLowerCase().includes(searchCategory.toLowerCase())
      )
    : referrals;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {showLoginForm && (
        <div className="p-6 max-w-md mx-auto bg-white rounded-2xl shadow-lg my-8 border border-blue-100 animate-fade-in">
          <h3 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 01-8 0M12 3v4m0 0a4 4 0 01-8 0m8 0a4 4 0 018 0m-8 0v4m0 0a4 4 0 01-8 0m8 0a4 4 0 018 0" /></svg>
            {isSignUp ? "Sign Up" : "Login"} with Email
          </h3>
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-2 p-2 border rounded focus:ring-2 focus:ring-blue-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-2 p-2 border rounded focus:ring-2 focus:ring-blue-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 items-center mb-2">
            {isSignUp ? (
              <button onClick={handleSignUp} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">Sign Up</button>
            ) : (
              <button onClick={handleEmailLogin} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Login</button>
            )}
            <button onClick={handleForgotPassword} className="text-sm text-blue-600 underline">Forgot Password?</button>
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-gray-700 underline">
              {isSignUp ? "Already have an account? Login" : "New user? Sign up"}
            </button>
          </div>
        </div>
      )}
      <main className="p-8">
        <section className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl mx-auto border border-blue-100 animate-fade-in">
          <h2 className="text-3xl font-extrabold mb-6 text-blue-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m4 0h-1v-4h-1m4 0h-1v-4h-1m4 0h-1v-4h-1" /></svg>
            Welcome to ReferralHub
          </h2>
          {user && (
            <div className="mb-6 flex flex-col md:flex-row gap-2 md:items-center">
              <input
                type="text"
                placeholder="Search by category..."
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="w-full md:w-64 p-2 border rounded focus:ring-2 focus:ring-blue-300"
              />
            </div>
          )}
          {user ? (
            <>
              <p className="text-gray-700 mb-6 text-lg">Here are some available referrals:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredReferrals.slice(0, visibleCount).map((ref) => (
                  <div key={ref.id} className="bg-gradient-to-br from-blue-100 to-white border border-blue-200 rounded-xl shadow-md p-6 flex flex-col gap-2 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-xl font-bold text-blue-700">{ref.title}</div>
                      {ref.category && <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs font-semibold">{ref.category}</span>}
                    </div>
                    {ref.description && (
                      <div className="text-gray-700 text-base mb-1">{ref.description}</div>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                      {ref.expiration_date && <span className="px-2 py-1 bg-gray-200 rounded">Expires: {ref.expiration_date}</span>}
                    </div>
                    {ref.url && (
                      <a href={ref.url} className="text-blue-600 underline break-all font-mono" target="_blank" rel="noopener noreferrer">{ref.url}</a>
                    )}
                  </div>
                ))}
              </div>
              {referrals.length > visibleCount && (
                <div className="flex justify-center mt-6">
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
                    onClick={() => setVisibleCount((c) => c + 5)}
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-700 text-lg">Please login to see available referrals.</p>
          )}
        </section>
      </main>
      <footer className="text-center text-sm text-gray-500 p-6 mt-8">
        © 2025 ReferralHub. All rights reserved.
      </footer>
    </div>
  );
}
