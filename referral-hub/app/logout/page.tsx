"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        await supabase.auth.signOut();
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
