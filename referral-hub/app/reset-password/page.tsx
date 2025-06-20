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
  const access_token = searchParams.get('access_token');
  const type = searchParams.get('type');
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    // Check for access_token in URL (new Supabase flow)
    if (access_token && type === 'recovery') {
      setLoading(false) // token is being verified by supabase automatically
    }}, [router]);

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
      setTimeout(() => router.push("/login"), 3000);
    }

    <div>
      {loading ? 'Verifying reset token...' : 'You can now reset your password.'}
    </div>
  };

  //if (!tokenReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-blue-100 text-center">
          <svg className="mx-auto mb-4 h-10 w-10 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600 text-lg font-medium">{message || "Verifying reset token..."}</p>
        </div>
      </div>
    );
  //}

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleReset} className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-blue-700">Reset Your Password</h2>
            <p className="text-gray-600 mt-2">Enter a new password for your account</p>
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              id="new-password"
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
              placeholder="Create a strong password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Updating...
              </span>
            ) : (
              "Set New Password"
            )}
          </button>
          {message && (
            <div className={`p-4 rounded-lg mt-2 ${message.includes("Error") ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
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
