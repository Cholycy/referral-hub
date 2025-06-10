// app/auth/callback/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleAuth = async () => {
      const url = new URL(window.location.href);
      const access_token = url.searchParams.get('access_token');
      const refresh_token = url.searchParams.get('refresh_token');
      const type = url.searchParams.get('type');

      if (!access_token || !refresh_token) {
        console.error('Missing token in URL');
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.error('Error setting session:', error.message);
        return;
      }

      // Redirect based on token type
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
