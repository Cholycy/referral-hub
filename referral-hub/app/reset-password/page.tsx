// app/reset-password/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ResetPasswordPage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        setMessage('User not logged in or token expired.');
      } else {
        setUser(user);
      }
    };

    fetchUser();
  }, [supabase]);

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
