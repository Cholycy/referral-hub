// app/reset-password/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ResetPasswordPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string>('');
  const [user, setUser] = useState<any>(null);
useEffect(() => {
    const handleAuth = async () => {
      const url = new URL(window.location.href);
      const access_token = url.searchParams.get('access_token');
      const refresh_token = url.searchParams.get('refresh_token');
      const type = url.searchParams.get('type');

      if (!access_token || !refresh_token) {
        console.error('Missing access or refresh token');
        return;
      }

      // ✅ This sets the Supabase session
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.error('Failed to set session:', error.message);
        return;
      }

      // Fetch the user after setting the session
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // ✅ Now the user is logged in — safe to redirect
      if (type === 'recovery') {
        router.replace('/reset-password');
      } else {
        router.replace('/');
      }
    };

    handleAuth();
  }, [router, supabase]);

  const handlePasswordReset = async () => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Password updated successfully! You can now log in.');
    }
  };

  if (!user) return <p>{message || 'Loading...'}</p>;

  return (
    <div>
      <h1>Reset Your Password</h1>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="New password"
      />
      <button onClick={handlePasswordReset}>Update Password</button>
      {message && <p>{message}</p>}
    </div>
  );
}

