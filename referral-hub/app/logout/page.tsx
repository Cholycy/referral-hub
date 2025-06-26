/*
Copyright (c) 2025 cholycy@gmail.com
All rights reserved.
*/
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function LogoutPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const logout = async () => {
      // Clear cached email on logout
      if (typeof window !== 'undefined') localStorage.removeItem('referralhub_email');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.auth.signOut();
        }
      }
      // Redirect to home with login/signup section open
      router.replace('/?showLogin=1');
    };
    logout();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-gray-700">Logging you out...</div>
    </div>
  );
}
