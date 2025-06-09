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
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    // Check for access_token in URL (new Supabase flow)
    const access_token = searchParams.get("access_token");
    const refresh_token = searchParams.get("refresh_token");
    if (access_token && refresh_token) {
      supabase.auth
        .setSession({
          access_token,
          refresh_token,
        })
        .then(({ error }) => {
          if (!error) setTokenReady(true);
          else setMessage("Invalid or expired reset link.");
        });
    } else {
      // Fallback: check if session exists
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setTokenReady(true);
        else setMessage("Invalid or expired reset link.");
      });
    }
  }, [searchParams]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setMessage("Error resetting password: " + error.message);
    } else {
      setMessage("Password updated! You will be redirected to login.");
      setTimeout(() => router.replace("/login"), 3000);
    }

    setLoading(false);
  };

  if (!tokenReady) {
    return <p className="text-center mt-10 text-gray-600">Verifying reset token...</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Reset Your Password</h2>
      <form onSubmit={handleReset}>
        <input
          type="password"
          className="w-full p-2 mb-4 border rounded"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Updating..." : "Set New Password"}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-blue-600">{message}</p>}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
