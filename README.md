# referral-hub

A website for users to share or get referrals from others
## 1. create a new Next.js project:
```bash
npx create-next-app@latest referral-hub --typescript
cd referral-hub
```

## 2. install dependencies
```bash
npm install @supabase/supabase-js tailwindcss postcss autoprefixer 
npm install @supabase/auth-helpers-nextjs

```
## 3. Create a .env.local file in your project root:
```bash
touch .env.local
```
## 4. add your supabase credentials to .env.local:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```