"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState("");

  useEffect(() => {
    const t = searchParams.get("type");
    setType(t);
    if (!t) return;
    switch (t) {
      case "signup":
        setInfoMsg("✅ Welcome! Your email has been confirmed.");
        break;
      case "recovery":
        setInfoMsg("🔐 Please set your new password below.");
        break;
      case "magiclink":
        setInfoMsg("🔓 You’ve been logged in via magic link.");
        break;
      default:
        setInfoMsg("🔔 You’ve been logged in.");
    }
  }, [searchParams]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (!password || !confirm) {
      setMsg("Please fill in both fields.");
      return;
    }
    if (password !== confirm) {
      setMsg("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setMsg("Error: " + error.message);
    } else {
      setMsg("Password updated! You can now log in.");
      setTimeout(() => router.push("/"), 1500);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-2">
      <section className="w-full max-w-md bg-white/80 rounded-3xl shadow-2xl border border-blue-100 p-8 flex flex-col gap-6 backdrop-blur-md animate-fade-in">
        <h1 className="text-2xl font-extrabold text-blue-700 mb-2 text-center">Authentication</h1>
        <div className="text-center mb-4 text-blue-700 text-lg">{infoMsg}</div>
        {type === "recovery" && (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="New password"
              className="w-full rounded-xl border border-blue-200 px-4 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm text-blue-900 placeholder:text-blue-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-blue-200 px-4 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm text-blue-900 placeholder:text-blue-500"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all text-lg" disabled={loading}>
              {loading ? "Updating..." : "Set Password"}
            </button>
            {msg && <div className="text-center text-blue-700 mt-2">{msg}</div>}
          </form>
        )}
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
