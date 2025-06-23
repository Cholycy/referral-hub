// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client using the request and response
  const supabase = createMiddlewareClient({ req, res });

  // Sync the session from the cookie (so it's available to the client)
  await supabase.auth.getSession();

  return res;
}

// Define matcher here, not in next.config.ts
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
