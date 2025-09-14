/*
Copyright (c) 2025 cholycy@gmail.com
All rights reserved.
*/
'use client';
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

export default function SubmitReferral() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "credit card",
    expiration: (() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today.toISOString().slice(0, 10); // YYYY-MM-DD
    })(),
    link: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/");
      else setUser(user);
    };
    fetchUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!form.title || !form.description || !form.category) {
      setErrorMsg("All fields are required.");
      return;
    }
    if (!user) {
      setErrorMsg("User not authenticated.");
      return;
    }
    setLoading(true);
    // Format expiration as 'YYYY-MM-DD 00:00:00+00'
    let formattedExpiration = form.expiration;
    if (formattedExpiration && formattedExpiration.length === 10) {
      formattedExpiration = formattedExpiration + ' 00:00:00+00';
    }

    // 1️⃣ Insert into posts table
    type PostRow = { id: number };
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .insert([
        {
          title: form.title,
          type: "sharing",
          description: form.description,
          category: form.category,
          user_id: user.id,
        },
      ])
      .select("id"); // Ensure 'id' is returned

    if (postError || !postData || postData.length === 0) {
      console.error("Error inserting into posts:", postError);
      return;
    }

    const postId = postData[0].id;

    // 2️⃣ Insert into sharing_details table
    const sharingDetails: any = {
      id: postId,
      url: form.link,
    };
    if (formattedExpiration) {
      sharingDetails.expiration_date = formattedExpiration;
    }
    const { error } = await supabase
      .from("sharing_details")
      .insert([sharingDetails]);

    setLoading(false);
    if (error) {
      setErrorMsg("Failed to submit sharing: " + error.message);
    } else {
      setSuccessMsg("Sharing submitted successfully!");
      setForm({
        title: "",
        description: "",
        category: "credit card",
        expiration: "",
        link: "",
      });
      
      setTimeout(() => router.push("/"), 3000);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-2">
      <section className="w-full max-w-xl bg-white/70 rounded-3xl shadow-2xl border border-blue-100 p-8 md:p-12 flex flex-col gap-6 backdrop-blur-md animate-fade-in">
        <h1 className="text-3xl md:text-3xl font-extrabold text-blue-700 mb-2 text-center flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Share a Deal You Love
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="title" className="block text-blue-800 font-semibold mb-1">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              className="w-full rounded-xl border border-blue-200 px-4 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm text-blue-900 placeholder:text-blue-500"
              placeholder="e.g. Chase Sapphire Preferred"
              value={form.title}
              onChange={handleChange}
              required
              maxLength={50}
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-blue-800 font-semibold mb-1">Why do you recommend this?</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full rounded-xl border border-blue-200 px-4 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm resize-none text-blue-900 placeholder:text-blue-500"
              placeholder="I use this because..."
              value={form.description}
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
              value={form.category}
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
            <label htmlFor="link" className="block text-blue-800 font-semibold mb-1">Benefit Link (optional)</label>
            <input
              id="link"
              name="link"
              type="url"
              className="w-full rounded-xl border border-blue-200 px-4 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm text-blue-900 placeholder:text-blue-500"
              value={form.link}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="expiration" className="block text-blue-800 font-semibold mb-1">Expiration Date (optional)</label>
            <input
              id="expiration"
              name="expiration"
              type="date"
              className="w-full rounded-xl border border-blue-200 px-4 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm text-blue-900 placeholder:text-blue-500"
              value={form.expiration}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className="mt-2 w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold py-3 rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-500 hover:scale-105 transition-all text-lg flex items-center justify-center gap-2"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            {loading ? "Submitting..." : "Submit Sharing"}
          </button>
        </form>
      </section>
    </main>
  );
}
