Copyright (c) 2025 cholycy@gmail.com

All rights reserved.


# Referral-hub

A website for users to share or get referrals from others, setup steps:
## 1. Create a new Next.js project:
```bash
npx create-next-app@latest referral-hub --typescript
cd referral-hub
```

## 2. Install dependencies
```bash
npm install @supabase/supabase-js tailwindcss postcss autoprefixer 
npm install @supabase/auth-helpers-nextjs

```
## 3. Create a .env.local file in your project root:
```bash
touch .env.local
```
## 4. Add your supabase credentials to .env.local:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```


## License
This project is licensed under a proprietary license.  **All rights reserved.** You may view the source code, but you may not use, copy, modify, or distribute it without explicit permission from the author. See the [LICENSE](./LICENSE) file for more details.
