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
    expiration: "",
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
    if (name === "expiration") {
      setForm((prev) => ({ ...prev, expiration: value }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!form.title || !form.description || !form.category || !form.expiration || !form.link) {
      setErrorMsg("All fields are required.");
      return;
    }
    if (!user) {
      setErrorMsg("User not authenticated.");
      return;
    }
    setLoading(true);
    // Format expiration as 'YYYY-MM-DD HH:mm:00+00'
    let formattedExpiration = form.expiration;
    if (formattedExpiration.length === 16) {
      // If input is 'YYYY-MM-DDTHH:mm', convert to 'YYYY-MM-DD HH:mm:00+00'
      formattedExpiration = formattedExpiration.replace('T', ' ') + ':00+00';
    }
    const { error } = await supabase.from("referrals").insert([
      {
        title: form.title,
        description: form.description,
        category: form.category,
        expiration_date: formattedExpiration,
        url: form.link, // use 'url' instead of 'link'
        user_id: user.id,
      },
    ]);
    setLoading(false);
    if (error) {
      setErrorMsg("Failed to submit referral: " + error.message);
    } else {
      setSuccessMsg("Referral submitted successfully!");
      setForm({
        title: "",
        description: "",
        category: "credit card",
        expiration: "",
        link: "",
      });
      setTimeout(() => router.push("/"), 1200);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Submit New Referral</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        {errorMsg && <div className="text-red-600">{errorMsg}</div>}
        {successMsg && <div className="text-green-600">{successMsg}</div>}
        <input
          type="text"
          name="title"
          placeholder="Referral Title"
          value={form.title}
          onChange={handleChange}
          required
          maxLength={50}
          className="w-full p-2 border rounded"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
          maxLength={150}
          className="w-full p-2 border rounded"
        ></textarea>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="credit card">Credit Card</option>
          <option value="membership">Membership</option>
          <option value="others">Others</option>
        </select>
        <input
          type="datetime-local"
          name="expiration"
          value={form.expiration}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="link"
          placeholder="Referral Link"
          value={form.link}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded" disabled={loading}>
          {loading ? "Submitting..." : "Submit Referral"}
        </button>
      </form>
    </div>
  );
}
