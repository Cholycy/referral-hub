// app/reset-password/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ResetPasswordPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

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

      // ✅ Now the user is logged in — safe to redirect
      if (type === 'recovery') {
        router.replace('/reset-password');
      } else {
        router.replace('/');
      }
    };

    handleAuth();
  }, [router, supabase]);

  return <p>Verifying token and signing in...</p>;
}
