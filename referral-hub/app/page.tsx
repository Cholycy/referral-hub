'use client';
// This is a simple referral hub application using Next.js and Supabase.
// It allows users to log in, view referrals, and submit new referrals.
// Users can also reset their passwords and manage their profiles.
// The application uses Supabase for authentication and database management.
// The code is structured to handle user authentication, referral fetching, and UI rendering.
// The main page includes a header with navigation links, a login form, and a section to display referrals.
// The application is styled using Tailwind CSS for a clean and modern look.

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(false);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">ReferralHub</h1>
        <nav className="space-x-4">
          <Link href="/">
            <a className="text-gray-700 hover:text-blue-600">Home
            </a>
          </Link>
          {user && (
            <>
              <Link href="/submit">
                <a className="text-gray-700 hover:text-blue-600">Submit</a>
              </Link>
              <Link href="/profile">
                <a className="text-gray-700 hover:text-blue-600">Profile</a>
              </Link>
            </>
          )}
        </nav>
        {user ? (
          <button onClick={handleLogout} className="text-sm bg-red-500 text-white px-3 py-1 rounded">Logout</button>
        ) : (
          <button onClick={() => setShowLoginForm(!showLoginForm)} className="text-sm bg-blue-500 text-white px-3 py-1 rounded">Login</button>
        )}
      </header>

      {showLoginForm && (
        <div className="p-4 max-w-md mx-auto bg-white rounded shadow my-4">
          <h3 className="text-lg font-semibold mb-2">Login with Email</h3>
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-2 p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-2 p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-between">
            <button onClick={handleEmailLogin} className="bg-blue-600 text-white px-3 py-1 rounded">Login</button>
            <button onClick={handleForgotPassword} className="text-sm text-blue-600 underline">Forgot Password?</button>
          </div>
        </div>
      )}

      <main className="p-8">
        <section className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4">Welcome to ReferralHub</h2>
          {user ? (
            <>
              <p className="text-gray-700 mb-4">Here are some available referrals:</p>
              <ul className="list-disc list-inside">
                {referrals.map((ref) => (
                  <li key={ref.id}>{ref.title} - <a href={ref.link} className="text-blue-600 underline">{ref.link}</a></li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-gray-700">Please login to see available referrals.</p>
          )}
        </section>
      </main>

      <footer className="text-center text-sm text-gray-500 p-4">
        © 2025 ReferralHub. All rights reserved.
      </footer>
    </div>
  );
}
