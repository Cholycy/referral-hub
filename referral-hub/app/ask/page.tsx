/*
Copyright (c) 2025 cholycy@gmail.com
All rights reserved.
*/
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RequestSharePage() {
  const [request, setRequest] = useState({
    title: "",
    details: "",
    category: "",
    location: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error) setUser(user);
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setRequest({ ...request, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      // Step 1: Insert into posts table
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert([{ title: request.title, 
          type: "ask",
          description: request.details,
          category: request.category, // Provide a value or add to state if needed
          user_id: user?.id, // Ensure user is not null
        }])
        .select("id")
        .single();

      if (postError) throw postError;

      // Step 2: Insert into ask_details table
      const { error: detailsError } = await supabase
        .from("ask_details")
        .insert([{
          post_id: post.id,
          location: request.location,
        }]);

      if (detailsError) throw detailsError;

      setSuccessMsg("Your request has been submitted!");
      setTimeout(() => router.push("/"), 1500);
    } catch (err: any) {
      setErrorMsg("Failed to submit request with error: " + err.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-2">
      <section className="w-full max-w-xl bg-white/70 rounded-3xl shadow-2xl border border-blue-100 p-8 md:p-12 flex flex-col gap-6 backdrop-blur-md animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700 mb-2 text-center flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Request a Sharing
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="title" className="block text-blue-800 font-semibold mb-1">What are you looking for?</label>
            <input
              id="title"
              name="title"
              type="text"
              className="w-full rounded-xl border border-blue-200 px-4 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm text-blue-900 placeholder:text-blue-500"
              placeholder="e.g. Best credit card deal"
              value={request.title}
              onChange={handleChange}
              required
              maxLength={80}
            />
          </div>
          <div>
            <label htmlFor="details" className="block text-blue-800 font-semibold mb-1">Details</label>
            <textarea
              id="details"
              name="details"
              rows={3}
              className="w-full rounded-xl border border-blue-200 px-4 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm resize-none text-blue-900 placeholder:text-blue-500"
              placeholder="Describe what you need or why"
              value={request.details}
              onChange={handleChange}
              required
              maxLength={500}
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-blue-800 font-semibold mb-1">Category</label>
            <select
              id="category"
              name="category"
              className="w-full rounded-xl border border-blue-200 px-4 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm"
              value={request.category}
              onChange={handleChange}
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
            <label htmlFor="location" className="block text-blue-800 font-semibold mb-1">Location (optional)</label>
            <input
              id="location"
              name="location"
              type="text"
              className="w-full rounded-xl border border-blue-200 px-4 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm text-blue-900 placeholder:text-blue-500"
              placeholder="e.g. New York, Online"
              value={request.location}
              onChange={handleChange}
              maxLength={100}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition font-bold"
          >
            Submit Request
          </button>
          {successMsg && <div className="text-green-700 font-semibold">{successMsg}</div>}
          {errorMsg && <div className="text-red-700 font-semibold">{errorMsg}</div>}
        </form>
      </section>
    </main>
  );
}
