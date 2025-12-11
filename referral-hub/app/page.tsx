/*
Copyright (c) 2025, Yu Chen, cholycy@gmail.com
All rights reserved.
*/
// This is a simple share hub application using Next.js and Supabase.
// It allows users to log in, view sharings, and submit new sharings.
// Users can also reset their passwords and manage their profiles.
// The application uses Supabase for authentication and database management.
// The code is structured to handle user authentication, share fetching, and UI rendering.
// The main page includes a header with navigation links, a login form, and a section to display sharings.

'use client';
import React, { useEffect, useState, Suspense, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Category mapping with icons
const CATEGORIES = {
  'credit card': { icon: '💳', label: 'Credit Card' },
  'bank / investment': { icon: '🏦', label: 'Bank / Investment' },
  'mobile / internet': { icon: '📶', label: 'Mobile / Internet' },
  'shopping / cashback': { icon: '🛒', label: 'Shopping / Cashback' },
  'subscriptions': { icon: '📦', label: 'Subscriptions' },
  'travel & transport': { icon: '✈️', label: 'Travel & Transport' },
  'health & fitness': { icon: '🧘', label: 'Health & Fitness' },
  'education': { icon: '🎓', label: 'Education' },
  'apps & tools': { icon: '🧰', label: 'Apps & Tools' },
  'others': { icon: '🌀', label: 'Others' },
};

const CATEGORY_LIST = Object.entries(CATEGORIES).map(([key, value]) => ({
  key,
  icon: value.icon,
  label: value.label,
}));

function TruncatedDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const words = description.split(/\s+/);
  const isTruncated = words.length > 100;
  const displayText = expanded || !isTruncated ? description : words.slice(0, 100).join(' ') + '...';

  return (
    <div>
      <div className="text-gray-700 text-base mb-1">
        {displayText}
      </div>
      {isTruncated && (
        <button
          className="text-blue-700 underline text-xs mt-1"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [referrals, setReferrals] = useState<Array<{ id: string; title: string; type: String, url?: string; description?: string; category?: string; expiration_date?: string; location?: string }>>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");
  const [votes, setVotes] = useState<Record<string, { up: number; down: number }>>({});
  const [voteLoading, setVoteLoading] = useState<Record<string, boolean>>({});
  const [userVotes, setUserVotes] = useState<Record<string, "up" | "down" | null>>({});
  const [comments, setComments] = useState<Record<string, Array<{id: number, user_id: string, content: string, created_at: string}>>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [signUpMsg, setSignUpMsg] = useState("");
  
  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareForm, setShareForm] = useState({
    title: "",
    description: "",
    category: "credit card",
    expiration: "",
    link: "",
  });
  const [shareLoading, setShareLoading] = useState(false);
  const [shareErrorMsg, setShareErrorMsg] = useState("");
  const [shareSuccessMsg, setShareSuccessMsg] = useState("");

  // Ask modal state
  const [showAskModal, setShowAskModal] = useState(false);
  const [askForm, setAskForm] = useState({
    title: "",
    details: "",
    category: "",
    location: "",
  });
  const [askLoading, setAskLoading] = useState(false);
  const [askErrorMsg, setAskErrorMsg] = useState("");
  const [askSuccessMsg, setAskSuccessMsg] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loadedComments, setLoadedComments] = useState<Record<string, boolean>>({});
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchCategory(e.target.value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(e.target.value);
    }, 300);
  }, []);

  // Share form handlers
  const handleShareChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShareForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleShareSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShareErrorMsg("");
    setShareSuccessMsg("");
    if (!shareForm.title || !shareForm.description || !shareForm.category) {
      setShareErrorMsg("All fields are required.");
      return;
    }
    if (!user) {
      setShareErrorMsg("User not authenticated.");
      return;
    }
    setShareLoading(true);
    let formattedExpiration = shareForm.expiration;
    if (formattedExpiration && formattedExpiration.length === 10) {
      formattedExpiration = formattedExpiration + ' 00:00:00+00';
    }

    type PostRow = { id: number };
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .insert([
        {
          title: shareForm.title,
          type: "sharing",
          description: shareForm.description,
          category: shareForm.category,
          user_id: user.id,
        },
      ])
      .select("id");

    if (postError || !postData || postData.length === 0) {
      setShareErrorMsg("Error inserting sharing: " + postError?.message);
      setShareLoading(false);
      return;
    }

    const postId = postData[0].id;

    const sharingDetails: any = {
      id: postId,
      url: shareForm.link,
    };
    if (formattedExpiration) {
      sharingDetails.expiration_date = formattedExpiration;
    }
    const { error } = await supabase
      .from("sharing_details")
      .insert([sharingDetails]);

    setShareLoading(false);
    if (error) {
      setShareErrorMsg("Failed to submit sharing: " + error.message);
    } else {
      setShareSuccessMsg("Sharing submitted successfully!");
      setShareForm({
        title: "",
        description: "",
        category: "credit card",
        expiration: "",
        link: "",
      });
      setTimeout(() => {
        setShowShareModal(false);
        // Refresh referrals
        fetchReferrals();
      }, 1500);
    }
  };

  // Ask form handlers
  const handleAskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setAskForm({ ...askForm, [e.target.name]: e.target.value });
  };

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAskErrorMsg("");
    setAskSuccessMsg("");
    if (!user) {
      setAskErrorMsg("User not authenticated.");
      return;
    }
    setAskLoading(true);
    try {
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert([{
          title: askForm.title,
          type: "ask",
          description: askForm.details,
          category: askForm.category,
          user_id: user.id,
        }])
        .select("id")
        .single();

      if (postError) throw postError;

      const { error: detailsError } = await supabase
        .from("ask_details")
        .insert([{
          post_id: post.id,
          location: askForm.location,
        }]);

      if (detailsError) throw detailsError;

      setAskSuccessMsg("Your request has been submitted!");
      setAskForm({
        title: "",
        details: "",
        category: "",
        location: "",
      });
      setTimeout(() => {
        setShowAskModal(false);
        fetchReferrals();
      }, 1500);
    } catch (err: any) {
      setAskErrorMsg("Failed to submit request: " + err.message);
    } finally {
      setAskLoading(false);
    }
  };

  // Fetch referrals function
  const fetchReferrals = async () => {
    const { data, error } = await supabase
      .from("posts_full")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setReferrals(data);
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      if (!user || !referrals.length) return;
      // Only fetch comments for posts that have been explicitly expanded
      const postsToLoad = Object.keys(loadedComments).filter(id => loadedComments[id]);
      if (postsToLoad.length === 0) return;
      
      const { data, error } = await supabase
        .from("comments")
        .select("id, post_id, user_id, content, created_at")
        .in("post_id", postsToLoad)
        .order('created_at', { ascending: true });
      if (!error && data) {
        const grouped: Record<string, Array<any>> = {};
        data.forEach((c: any) => {
          if (!grouped[c.post_id]) grouped[c.post_id] = [];
          grouped[c.post_id].push(c);
        });
        setComments(prev => ({ ...prev, ...grouped }));
      }
    };
    fetchComments();
  }, [user, referrals, loadedComments]);

  const toggleComments = async (postId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    
    // Lazy load comments when expanding
    if (!loadedComments[postId] && !comments[postId]) {
      setLoadedComments(prev => ({ ...prev, [postId]: true }));
    }
  };

  const handleCommentInput = (postId: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!user) return;
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    // First, get the post details to know the owner
    const { data: postData, error: postError } = await supabase
      .from("posts_full")
      .select("user_id, title")
      .eq("id", postId)
      .single();

    if (postError) {
      console.error('Error fetching post details:', postError);
      return;
    }

    const { error } = await supabase
      .from("comments")
      .insert([{ 
        post_id: postId, 
        user_id: user.id, 
        content 
      }]);

    if (!error) {
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      // Refetch comments for this post
      const { data } = await supabase
        .from("comments")
        .select("id, user_id, content, created_at")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      setComments((prev) => ({ ...prev, [postId]: data || [] }));

      // Send email notification to post owner
      // Only send if the commenter is not the post owner
      if (postData.user_id !== user.id) {
        await sendCommentNotification(postData.user_id, postData.title, content);
      }
    }
  };

  useEffect(() => {
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

      const { data: votesData, error } = await supabase
        .from("referral_user_votes")
        .select("referral_id, vote_type, user_id");

      if (!error && votesData) {
        const voteMap: Record<string, { up: number; down: number }> = {};
        const userVoteMap: Record<string, "up" | "down" | null> = {};
        const currentUserId = user?.id; // Or use your auth logic

        votesData.forEach((v: any) => {
          // Track vote counts
          if (!voteMap[v.referral_id]) {
            voteMap[v.referral_id] = { up: 0, down: 0 };
          }
          if (v.vote_type === "up") voteMap[v.referral_id].up += 1;
          if (v.vote_type === "down") voteMap[v.referral_id].down += 1;

          // Track user's vote per referral
          if (v.user_id === currentUserId) {
            userVoteMap[v.referral_id] = v.vote_type;
          }
        });

        setVotes(voteMap);           // Global vote counts
        setUserVotes(userVoteMap);   // Current user’s votes
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

  const sendCommentNotification = async (postOwnerId: string, postTitle: string, commentContent: string) => {
    try {
      // Get the post owner's email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', postOwnerId)
        .single();

      if (userError || !userData?.email) {
        console.error('Error fetching user email:', userError);
        return;
      }

      // Send the email notification
      const { error: emailError } = await supabase.functions.invoke('send-email-notification', {
        body: {
          to: userData.email,
          subject: 'New Comment on Your Post',
          content: `Someone left a comment on your post "${postTitle}":\n\n${commentContent}`
        }
      });

      if (emailError) {
        console.error('Error sending email notification:', emailError);
      }
    } catch (error) {
      console.error('Error in sendCommentNotification:', error);
    }
  };

  const handleVote = async (referralId: string, type: "up" | "down") => {
    if (!user) return;
    setVoteLoading((prev) => ({ ...prev, [referralId]: true }));
    const currentVote = userVotes[referralId] || null;
    const updatedVotes = { ...votes[referralId] || { up: 0, down: 0 } };
    let newUserVote: "up" | "down" | null = type;
    try {
      if (currentVote === type) {
        const { error } = await supabase.from("referral_user_votes").delete().eq("referral_id", referralId).eq("user_id", user.id);
        if (error) throw error;

        updatedVotes[type] = Math.max(0, (updatedVotes[type] || 1) - 1);
        newUserVote = null; // Double click: revert vote
      } else {
        const { error } = await supabase.from("referral_user_votes").upsert([{
          referral_id: referralId,
          user_id: user.id,
          vote_type: type,
        },
        ], {
          onConflict: 'referral_id, user_id', // Ensure we don't duplicate votes  
        });
        if (error) throw error;
        if (currentVote) {
          updatedVotes[currentVote] = Math.max(0, (updatedVotes[currentVote] || 1) - 1);
        }
        updatedVotes[type] = (updatedVotes[type] || 0) + 1; // Increment the new vote type
      }

      setVotes((prev) => ({ ...prev, [referralId]: { up: updatedVotes.up || 0, down: updatedVotes.down || 0 } }));
      setUserVotes((prev) => ({ ...prev, [referralId]: newUserVote }));
    } catch (error) {
      console.error("Vote failed:", error);
    } finally {
      setVoteLoading((prev) => ({ ...prev, [referralId]: false }));
    }
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

  const filteredReferrals = useMemo(() => {
    let filtered = referrals;
    
    // Filter by selected category
    if (selectedCategory) {
      filtered = filtered.filter((ref) => 
        ref.category && ref.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Filter by search query
    if (debouncedSearchQuery) {
      filtered = filtered.filter((ref) => {
        const q = debouncedSearchQuery.toLowerCase();
        return (
          (ref.title && ref.title.toLowerCase().includes(q)) ||
          (ref.description && ref.description.toLowerCase().includes(q)) ||
          (ref.category && ref.category.toLowerCase().includes(q)) ||
          (ref.url && ref.url.toLowerCase().includes(q))
        );
      });
    }
    
    return filtered;
  }, [referrals, debouncedSearchQuery, selectedCategory]);



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

      <main className="p-4 sm:p-8">
        {/* About Section */}
        <section className="relative overflow-hidden mb-16">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 opacity-90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?w=1920')] bg-cover bg-center mix-blend-overlay opacity-20" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight flex items-center justify-center gap-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="h-12 w-12 text-white/90 animate-bounce"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                    />
                  </svg>
                  ShareHub
                </h1>
                <p className="text-lg sm:text-2xl md:text-3xl font-medium max-w-2xl mx-auto mb-4 text-white/90">
                  Explore, share, and support your favorite finds in the world's go-to sharing community!
                </p>
                <p className="text-blue-100/90 text-base sm:text-lg md:text-xl font-light max-w-xl mx-auto mb-8">
                  Real people. Real picks. All in one place.
                </p>
                
                {/* Action Buttons */}
                {user && (
                  <div className="flex flex-wrap gap-4 justify-center">
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Share a Deal
                    </button>
                    <button
                      onClick={() => setShowAskModal(true)}
                      className="bg-amber-400 text-white px-8 py-3 rounded-lg font-bold hover:bg-amber-500 transition shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Ask for a Deal
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Wave decoration */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248 250 252)" />
              </svg>
            </div>
          </section>

        {/* Dashboard Section */}
        <section className="bg-white p-4 sm:p-8 rounded-2xl shadow-xl max-w-4xl mx-auto border border-blue-100 animate-fade-in">
          <h2 className="text-xl sm:text-3xl font-extrabold mb-4 sm:mb-6 text-blue-700 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
              />
            </svg>
            Real Deals from Real People
          </h2>

        {user && (
          <>
            <input
              type="text"
              placeholder="Search by keyword..."
              value={searchCategory}
              onChange={handleSearchChange}
              className="w-full sm:w-64 p-2 border rounded focus:ring-2 focus:ring-blue-300 text-blue-900 placeholder:text-blue-500"
            />
            <div className="h-4 sm:h-6" />
            
            {/* Category Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  selectedCategory === "" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All Categories
              </button>
              {CATEGORY_LIST.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1 rounded-full text-sm transition flex items-center gap-1 ${
                    selectedCategory === cat.key
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="hidden sm:inline">{cat.label}</span>
                </button>
              ))}
            </div>
            </>
          )}

          {user ? (
            <>
              <div className="flex flex-col divide-y divide-gray-200">
                {filteredReferrals.slice(0, visibleCount).map((ref) => (
                  <div
                    key={ref.id}
                    className="flex gap-2 sm:gap-4 py-4 hover:bg-gray-50 transition"
                  >
                    {/* Voting column */}
                    <div className="flex flex-col items-center w-10 sm:w-12 shrink-0">
                      <button
                        className={`p-1 text-gray-500 hover:text-green-600 disabled:opacity-50 
                    ${userVotes[ref.id] === "up" ? "text-green-600 font-bold" : ""}`}
                        onClick={() => handleVote(ref.id, "up")}
                        disabled={voteLoading[ref.id]}
                        aria-label="Upvote"
                      >
                        ▲
                      </button>
                      <span className="text-xs sm:text-sm font-medium">
                        {(votes[ref.id]?.up || 0) - (votes[ref.id]?.down || 0)}
                      </span>
                      <button
                        className={`p-1 text-gray-500 hover:text-red-600 disabled:opacity-50 
                    ${userVotes[ref.id] === "down" ? "text-red-600 font-bold" : ""}`}
                        onClick={() => handleVote(ref.id, "down")}
                        disabled={voteLoading[ref.id]}
                        aria-label="Downvote"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Post content */}
                    <div className="flex flex-col flex-1">
                      {/* Header */}
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                        <span
                          className={`text-xs sm:text-sm font-bold uppercase ${ref.type === "ask" ? "text-pink-600" : "text-blue-600"
                            }`}
                        >
                          {ref.type === "ask" ? "[Ask]" : "[Share]"}
                        </span>
                        <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                          {ref.title}
                        </h2>
                        {ref.category && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700 flex items-center gap-1">
                            <span>{(CATEGORIES as Record<string, { icon: string; label: string }>)[ref.category.toLowerCase()]?.icon || "🌀"}</span>
                            {ref.category.charAt(0).toUpperCase() + ref.category.slice(1)}
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      {ref.type === "ask" ? (
                        <div className="text-sm text-gray-700 space-y-1">
                          {ref.description && <p>{ref.description}</p>}
                          {ref.location && (
                            <span className="text-gray-500 text-xs">📍 {ref.location}</span>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-700 space-y-1">
                          {ref.description && (
                            <TruncatedDescription description={ref.description} />
                          )}
                          {ref.expiration_date && (
                            <span className="text-xs text-gray-500">
                              ⏳ Expires:{" "}
                              {new Date(
                                ref.expiration_date.replace(" ", "T")
                              ).toLocaleDateString()}
                            </span>
                          )}
                          {ref.url && (
                            <a
                              href={ref.url}
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs"
                            >
                              🔗{" "}
                              {(() => {
                                try {
                                  const u = new URL(ref.url);
                                  const path =
                                    u.pathname.length > 12
                                      ? u.pathname.slice(0, 12) + "..."
                                      : u.pathname;
                                  return `${u.hostname}${path}`;
                                } catch {
                                  return ref.url.length > 24
                                    ? ref.url.slice(0, 24) + "..."
                                    : ref.url;
                                }
                              })()}
                            </a>
                          )}
                        </div>
                      )}

                      {/* Comments Section */}
                      <div className="mt-4 bg-gray-50 rounded-lg p-3">
                        <div className="mb-2 flex justify-between items-center">
                          <span className="font-semibold text-xs text-gray-600">
                            Comments {comments[ref.id]?.length > 0 && `(${comments[ref.id].length})`}
                          </span>
                          <button
                            onClick={() => toggleComments(ref.id)}
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            {expandedComments[ref.id] ? (
                              <>
                                <span>Hide</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                              </>
                            ) : (
                              <>
                                <span>Show</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </>
                            )}
                          </button>
                        </div>
                        
                        {expandedComments[ref.id] && (
                          <>
                            <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
                              {comments[ref.id]?.map((comment) => (
                                <div key={comment.id} className="text-xs text-gray-800 border-b border-gray-100 pb-2">
                                  <div className="flex justify-between items-start">
                                    <span className="font-bold text-blue-700">{comment.user_id.slice(0, 6)}</span>
                                    <span className="text-gray-400 text-[10px]">{new Date(comment.created_at).toLocaleString()}</span>
                                  </div>
                                  <p className="mt-1">{comment.content}</p>
                                </div>
                              ))}
                              {(!comments[ref.id] || comments[ref.id].length === 0) && (
                                <div className="text-xs text-gray-400">No comments yet</div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <textarea
                                className="flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:ring-2 focus:ring-blue-200 resize-none"
                                rows={1}
                                placeholder="Add a comment..."
                                value={commentInputs[ref.id] || ""}
                                onChange={(e) => handleCommentInput(ref.id, e.target.value)}
                                maxLength={200}
                              />
                              <button
                                className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-600 disabled:opacity-50"
                                disabled={!commentInputs[ref.id]?.trim()}
                                onClick={() => handleCommentSubmit(ref.id)}
                                type="button"
                              >
                                Post
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Show more */}
                {referrals.length > visibleCount && (
                  <div className="flex justify-center py-4">
                    <button
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                      onClick={() => setVisibleCount((c) => c + 12)}
                    >
                      Show more
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-700 text-base sm:text-lg text-center">
              Sign in to view what others are sharing.
            </p>
          )}
        </section>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8 border border-blue-100 animate-fade-in overflow-y-auto max-h-screen">
            <h2 className="text-2xl font-extrabold text-blue-700 mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Share a Deal You Love
            </h2>
            <form onSubmit={handleShareSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="share-title" className="block text-blue-800 font-semibold mb-1">Title</label>
                <input
                  id="share-title"
                  name="title"
                  type="text"
                  className="w-full rounded-lg border border-blue-200 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm text-blue-900 placeholder:text-blue-500"
                  placeholder="e.g. Chase Sapphire Preferred"
                  value={shareForm.title}
                  onChange={handleShareChange}
                  required
                  maxLength={50}
                />
              </div>
              <div>
                <label htmlFor="share-description" className="block text-blue-800 font-semibold mb-1">Why do you recommend this?</label>
                <textarea
                  id="share-description"
                  name="description"
                  rows={3}
                  className="w-full rounded-lg border border-blue-200 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm resize-none text-blue-900 placeholder:text-blue-500"
                  placeholder="I use this because..."
                  value={shareForm.description}
                  onChange={handleShareChange}
                  required
                  maxLength={500}
                />
              </div>
              <div>
                <label htmlFor="share-category" className="block text-blue-800 font-semibold mb-1">Category</label>
                <select
                  id="share-category"
                  name="category"
                  className="w-full rounded-lg border border-blue-200 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm"
                  value={shareForm.category}
                  onChange={handleShareChange}
                  required
                >
                  <option value="credit card">Credit Card</option>
                  <option value="bank / investment">Bank / Investment</option>
                  <option value="mobile / internet">Mobile / Internet</option>
                  <option value="shopping / cashback">Shopping / Cashback</option>
                  <option value="subscriptions">Subscriptions</option>
                  <option value="travel & transport">Travel & Transport</option>
                  <option value="health & fitness">Health & Fitness</option>
                  <option value="education">Education</option>
                  <option value="apps & tools">Apps & Tools</option>
                  <option value="others">Others</option>
                </select>
              </div>
              <div>
                <label htmlFor="share-link" className="block text-blue-800 font-semibold mb-1">Benefit Link (optional)</label>
                <input
                  id="share-link"
                  name="link"
                  type="url"
                  className="w-full rounded-lg border border-blue-200 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm text-blue-900 placeholder:text-blue-500"
                  value={shareForm.link}
                  onChange={handleShareChange}
                />
              </div>
              <div>
                <label htmlFor="share-expiration" className="block text-blue-800 font-semibold mb-1">Expiration Date (optional)</label>
                <input
                  id="share-expiration"
                  name="expiration"
                  type="date"
                  className="w-full rounded-lg border border-blue-200 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm text-blue-900 placeholder:text-blue-500"
                  value={shareForm.expiration}
                  onChange={handleShareChange}
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={shareLoading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {shareLoading ? "Submitting..." : "Submit Sharing"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
              {shareErrorMsg && <div className="text-red-600 font-semibold bg-red-50 p-3 rounded">{shareErrorMsg}</div>}
              {shareSuccessMsg && <div className="text-green-600 font-semibold bg-green-50 p-3 rounded">{shareSuccessMsg}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Ask Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8 border border-blue-100 animate-fade-in overflow-y-auto max-h-screen">
            <h2 className="text-2xl font-extrabold text-purple-700 mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Request a Deal
            </h2>
            <form onSubmit={handleAskSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="ask-title" className="block text-purple-800 font-semibold mb-1">What are you looking for?</label>
                <input
                  id="ask-title"
                  name="title"
                  type="text"
                  className="w-full rounded-lg border border-purple-200 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition shadow-sm text-purple-900 placeholder:text-purple-500"
                  placeholder="e.g. Best credit card deal"
                  value={askForm.title}
                  onChange={handleAskChange}
                  required
                  maxLength={80}
                />
              </div>
              <div>
                <label htmlFor="ask-details" className="block text-purple-800 font-semibold mb-1">Details</label>
                <textarea
                  id="ask-details"
                  name="details"
                  rows={3}
                  className="w-full rounded-lg border border-purple-200 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition shadow-sm resize-none text-purple-900 placeholder:text-purple-500"
                  placeholder="Describe what you need or why"
                  value={askForm.details}
                  onChange={handleAskChange}
                  required
                  maxLength={500}
                />
              </div>
              <div>
                <label htmlFor="ask-category" className="block text-purple-800 font-semibold mb-1">Category</label>
                <select
                  id="ask-category"
                  name="category"
                  className="w-full rounded-lg border border-purple-200 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition shadow-sm"
                  value={askForm.category}
                  onChange={handleAskChange}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="credit card">Credit Card</option>
                  <option value="bank / investment">Bank / Investment</option>
                  <option value="mobile / internet">Mobile / Internet</option>
                  <option value="shopping / cashback">Shopping / Cashback</option>
                  <option value="subscriptions">Subscriptions</option>
                  <option value="travel & transport">Travel & Transport</option>
                  <option value="health & fitness">Health & Fitness</option>
                  <option value="education">Education</option>
                  <option value="apps & tools">Apps & Tools</option>
                  <option value="others">Others</option>
                </select>
              </div>
              <div>
                <label htmlFor="ask-location" className="block text-purple-800 font-semibold mb-1">Location (optional)</label>
                <input
                  id="ask-location"
                  name="location"
                  type="text"
                  className="w-full rounded-lg border border-purple-200 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition shadow-sm text-purple-900 placeholder:text-purple-500"
                  placeholder="e.g. New York, Online"
                  value={askForm.location}
                  onChange={handleAskChange}
                  maxLength={100}
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={askLoading}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {askLoading ? "Submitting..." : "Submit Request"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
              {askErrorMsg && <div className="text-red-600 font-semibold bg-red-50 p-3 rounded">{askErrorMsg}</div>}
              {askSuccessMsg && <div className="text-green-600 font-semibold bg-green-50 p-3 rounded">{askSuccessMsg}</div>}
            </form>
          </div>
        </div>
      )}

      <footer className="text-center text-xs sm:text-sm text-gray-500 p-4 sm:p-6 mt-4 sm:mt-8">
        © 2025 ShareHub. All rights reserved.
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
