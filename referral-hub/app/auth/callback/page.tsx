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
      console.log('[DEBUG] Callback page href:', window.location.href);
      const hashParams = new URLSearchParams(window.location.hash.slice(1)); // get everything after #
      const access_token = hashParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token');
      const type = hashParams.get('type');
      console.log('[DEBUG] Extracted tokens:', { access_token, refresh_token, type });

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
        const redirectUrl = `/reset-password?access_token=${access_token}&refresh_token=${refresh_token}&type=recovery`;
        router.replace(redirectUrl);
      } else {
        router.replace('/');
      }
    };

    handleAuth();
  }, [router, supabase]);

  return <p>Verifying token and signing in...</p>;
}
