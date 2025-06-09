"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
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

    // Try to sign up; if already registered, Supabase returns an error
    const { error } = await supabase.auth.signUp({ email });
    if (error) {
      if (error.message.includes("already registered") || error.message.includes("User already registered")) {
        setReminder("You are already registered. Please log in.");
      } else {
        setReminder(error.message);
      }
      setLoading(false);
      return;
    }
    setReminder("Check your email for a confirmation link!");
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSignUp}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl mb-4 font-bold">Sign Up</h2>
        <input
          type="email"
          className="border p-2 w-full mb-4"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        {reminder && (
          <div className="mt-4 text-red-600">{reminder}</div>
        )}
        <p className="mt-4">
          Already have an account?{" "}
          <a href="/?showLogin=1" className="text-blue-600 underline" onClick={e => { e.preventDefault(); router.replace('/?showLogin=1'); }}>
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}
