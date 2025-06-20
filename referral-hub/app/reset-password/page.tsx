'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ResetPassword() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        setError('You must be logged in to reset your password.');
      } else {
        setUser(data.user);
      }
      setLoading(false);
    });
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError('Failed to update password: ' + error.message);
    } else {
      setSuccess(true);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (error) return <div className="text-red-600">{error}</div>;

  if (success) return <div className="text-green-600">Password updated successfully! You can now log in.</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10">
      <h2 className="mb-4 text-xl font-semibold">Reset Password</h2>
      <label className="block mb-2">
        New Password:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-gray-300 rounded p-2 mt-1"
          minLength={6}
        />
      </label>
      <button
        type="submit"
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Update Password
      </button>
    </form>
  );
}
