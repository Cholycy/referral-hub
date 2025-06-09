'use client';
// This is a simple referral hub application using Next.js and Supabase.
// It allows users to log in, view referrals, and submit new referrals.
// Users can also reset their passwords and manage their profiles.
// The application uses Supabase for authentication and database management.
// The code is structured to handle user authentication, referral fetching, and UI rendering.
// The main page includes a header with navigation links, a login form, and a section to display referrals.
// The application is styled using Tailwind CSS for a clean and modern look.

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function HomeContent() {
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
  const [votes, setVotes] = useState<Record<string, { up: number; down: number }>>({});
  const [voteLoading, setVoteLoading] = useState<Record<string, boolean>>({});
  const [userVotes, setUserVotes] = useState<Record<string, "up" | "down" | null>>({});
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [signUpMsg, setSignUpMsg] = useState("");

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

  useEffect(() => {
    const fetchVotes = async () => {
      if (!referrals.length) return;
      const { data, error } = await supabase
        .from("referral_votes")
        .select("referral_id, up, down");
      if (!error && data) {
        const voteMap: Record<string, { up: number; down: number }> = {};
        data.forEach((v: any) => {
          voteMap[v.referral_id] = { up: v.up, down: v.down };
        });
        setVotes(voteMap);
      }
    };
    fetchVotes();
  }, [referrals]);

  // Fetch user votes for all referrals
  useEffect(() => {
    const fetchUserVotes = async () => {
      if (!user || !referrals.length) return;
      const { data, error } = await supabase
        .from("referral_user_votes")
        .select("referral_id, vote_type")
        .eq("user_id", user.id);
      if (!error && data) {
        const voteMap: Record<string, "up" | "down" | null> = {};
        data.forEach((v: any) => {
          voteMap[v.referral_id] = v.vote_type;
        });
        setUserVotes(voteMap);
      }
    };
    fetchUserVotes();
  }, [user, referrals]);

  useEffect(() => {
    // Prefill email from localStorage if available
    const cachedEmail = typeof window !== 'undefined' ? localStorage.getItem('referralhub_email') : null;
    if (cachedEmail) setEmail(cachedEmail);
  }, []);

  const handleEmailLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert("Login error: " + error.message);
    } else {
      if (typeof window !== 'undefined') localStorage.setItem('referralhub_email', email);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setShowLoginForm(false);
    }
  };

  const handleSignUp = async () => {
    setSignUpMsg("");
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setSignUpMsg("Signup error: " + error.message);
    } else if (data?.user?.email_confirmed_at) {
      setSignUpMsg("Signup successful and confirmed. You can now log in.");
    } else if (data?.user?.identities?.length === 0) {
      // This means Supabase attempted to sign up, but user already exists
      setSignUpMsg("This email is already registered. Please log in instead.");
    } else {
      setSignUpMsg("Signup successful! Check your email to confirm.");
    }
  };

  const handleForgotPassword = async () => {
    setShowResetForm(true);
    setResetEmail(email);
    setResetMsg("");
  };

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMsg("");
    if (!resetEmail) {
      setResetMsg("Please enter your email.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) {
      setResetMsg("Error: " + error.message);
    } else {
      setResetMsg("Password reset link sent to your email.");
    }
  };

  const handleVote = async (referralId: string, type: "up" | "down") => {
    if (!user) return;
    setVoteLoading((prev) => ({ ...prev, [referralId]: true }));
    const currentVote = userVotes[referralId] || null;
    let newVotes = { ...votes[referralId] };
    let newUserVote: "up" | "down" | null = type;
    if (currentVote === type) {
      // Double click: revert vote
      newVotes[type] = (newVotes[type] || 1) - 1;
      newUserVote = null;
      await supabase.from("referral_user_votes").delete().eq("referral_id", referralId).eq("user_id", user.id);
    } else {
      // Remove previous vote if exists
      if (currentVote) {
        newVotes[currentVote] = (newVotes[currentVote] || 1) - 1;
      }
      newVotes[type] = (newVotes[type] || 0) + 1;
      await supabase.from("referral_user_votes").upsert({
        referral_id: referralId,
        user_id: user.id,
        vote_type: type,
      });
    }
    // Update aggregate votes table
    await supabase.from("referral_votes").upsert({
      referral_id: referralId,
      up: newVotes.up || 0,
      down: newVotes.down || 0,
    });
    setVotes((prev) => ({ ...prev, [referralId]: { up: newVotes.up || 0, down: newVotes.down || 0 } }));
    setUserVotes((prev) => ({ ...prev, [referralId]: newUserVote }));
    setVoteLoading((prev) => ({ ...prev, [referralId]: false }));
  };

  const handleLoginLogout = () => {
    if (user) {
      // If logged in, log out and redirect
      router.push('/logout');
    } else {
      // If not logged in, show login form
      setShowLoginForm(true);
    }
  };

  useEffect(() => {
    // Listen for login-logout-click event from nav
    const handler = () => handleLoginLogout();
    window.addEventListener('login-logout-click', handler);
    return () => window.removeEventListener('login-logout-click', handler);
  }, [user]);

  const filteredReferrals = searchCategory
    ? referrals.filter((ref) => {
      const q = searchCategory.toLowerCase();
      return (
        (ref.title && ref.title.toLowerCase().includes(q)) ||
        (ref.description && ref.description.toLowerCase().includes(q)) ||
        (ref.category && ref.category.toLowerCase().includes(q)) ||
        (ref.url && ref.url.toLowerCase().includes(q))
      );
    })
    : referrals;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Reset Password Modal */}
      {showResetForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-fade-in border border-blue-100">
            <h2 className="text-xl font-bold mb-3 text-blue-700">Reset Password</h2>
            <form onSubmit={handleSendReset} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 text-blue-900 placeholder:text-blue-500"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                required
              />
              <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-bold hover:bg-blue-700">Send Reset Link</button>
              <button type="button" className="text-blue-600 underline mt-1" onClick={() => setShowResetForm(false)}>Cancel</button>
              {resetMsg && <div className="text-sm text-center mt-2 text-blue-700">{resetMsg}</div>}
            </form>
          </div>
        </div>
      )}
      {showLoginForm && (
        <div className="p-6 max-w-md mx-auto bg-white rounded-2xl shadow-lg my-8 border border-blue-100 animate-fade-in">
          <h3 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-6 w-6 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
            </svg>
            {isSignUp ? "Sign Up" : "Login"} with Email
          </h3>

          <input
            type="email"
            placeholder="Email"
            className="w-full mb-2 p-2 border rounded focus:ring-2 focus:ring-blue-300 text-blue-900 placeholder:text-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-2 p-2 border rounded focus:ring-2 focus:ring-blue-300 text-blue-900 placeholder:text-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex flex-wrap gap-2 items-center mb-2">
            {isSignUp ? (
              <button
                onClick={handleSignUp}
                disabled={!email || !password}
                className={`bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 ${(!email || !password) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Sign Up
              </button>
            ) : (
              <button
                onClick={handleEmailLogin}
                disabled={!email || !password}
                className={`bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 ${(!email || !password) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Login
              </button>
            )}

            <button onClick={handleForgotPassword} className="text-sm text-blue-600 underline">
              Forgot Password?
            </button>

            {isSignUp ? (
              <button
                onClick={() => setIsSignUp(false)}
                className="text-sm text-gray-700 underline"
              >
                Already have an account? Login
              </button>
            ) : (
              <button
                onClick={() => router.push('/signup')}
                className="text-sm text-blue-600 underline"
              >
                New user? Sign up
              </button>
            )}
          </div>

          {signUpMsg && (
            <div className="text-center text-blue-700 mt-2">
              {signUpMsg}
            </div>
          )}
        </div>
      )}

      <main className="p-8">
        {/* Description Section removed and moved to About page */}
        <section className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl mx-auto border border-blue-100 animate-fade-in">
          <h2 className="text-3xl font-extrabold mb-6 text-blue-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-8 w-8 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
            </svg>
            Welcome to ReferralHub
          </h2>
          {user && (
            <div className="mb-6 flex flex-col md:flex-row gap-2 md:items-center">
              <input
                type="text"
                placeholder="Search by keyword..."
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="w-full md:w-64 p-2 border rounded focus:ring-2 focus:ring-blue-300 text-blue-900 placeholder:text-blue-500"
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
                      {ref.category && (
                        <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs font-semibold">
                          {ref.category.charAt(0).toUpperCase() + ref.category.slice(1)}
                        </span>
                      )}
                    </div>
                    {ref.description && (
                      <div className="text-gray-700 text-base mb-1">{ref.description}</div>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                      {ref.expiration_date && (
                        <span className="px-2 py-1 bg-gray-200 rounded">
                          Expires: {new Date(ref.expiration_date.replace(' ', 'T')).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {ref.url && (
                      <a href={ref.url} className="text-blue-600 underline break-all font-mono" target="_blank" rel="noopener noreferrer">{ref.url}</a>
                    )}
                    <div className="flex gap-4 mt-2 items-center">
                      <button
                        className={`flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 ${userVotes[ref.id] === 'up' ? 'ring-2 ring-green-400' : ''}`}
                        onClick={() => handleVote(ref.id, 'up')}
                        onDoubleClick={() => handleVote(ref.id, 'up')}
                        disabled={voteLoading[ref.id]}
                        aria-label="Upvote"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        {votes[ref.id]?.up || 0}
                      </button>
                      <button
                        className={`flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 ${userVotes[ref.id] === 'down' ? 'ring-2 ring-red-400' : ''}`}
                        onClick={() => handleVote(ref.id, 'down')}
                        onDoubleClick={() => handleVote(ref.id, 'down')}
                        disabled={voteLoading[ref.id]}
                        aria-label="Downvote"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        {votes[ref.id]?.down || 0}
                      </button>
                    </div>
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

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
