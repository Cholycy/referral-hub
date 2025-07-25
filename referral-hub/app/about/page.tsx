/*
Copyright (c) 2025 cholycy@gmail.com
All rights reserved.
*/
'use client';
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  // Helper to handle category click
  const handleCategoryClick = (category: string) => {
    // Use encodeURIComponent for safety
    router.push(`/?category=${encodeURIComponent(category)}`);
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-0">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 py-10 px-2 sm:py-14 sm:px-4 md:px-0 flex flex-col items-center justify-center shadow-lg animate-fade-in">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4 flex items-center gap-2 sm:gap-4 tracking-tight animate-fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-8 w-8 sm:h-12 sm:w-12 text-white/90 animate-bounce">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
          </svg>
          ShareHub
        </h1>
        <p className="text-lg sm:text-2xl md:text-3xl font-medium max-w-xs sm:max-w-2xl text-center mb-2 animate-fade-in delay-100 text-white/90">
          Explore, share, and support your favorite finds in the world’s go-to sharing community!
        </p>
        <p className="text-blue-100/90 text-base sm:text-lg md:text-xl font-light max-w-xs sm:max-w-xl text-center animate-fade-in delay-200">
          Real people. Real picks. All in one place.
        </p>
        <p className="text-blue-100/90 text-xs sm:text-base md:text-lg font-light max-w-xs sm:max-w-xl text-center animate-fade-in delay-300 mt-2">
          <span className="font-semibold text-white/90">Author & Contact:</span> <a href="mailto:cholycy@gmail.com" className="underline hover:text-blue-200">cholycy@gmail.com</a><br />
        </p>
      </section>

      {/* Spacer for visual separation */}
      <div className="h-8 md:h-12" />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto flex flex-col gap-8 items-stretch px-4 md:px-0 -mt-16 z-10 relative">
        {/* Category Cards (now excludes Author & Contact as it's moved to hero section) */}
        <section className="w-full bg-white/60 rounded-3xl shadow-2xl border border-blue-100 p-10 animate-fade-in flex flex-col justify-center min-h-[520px] backdrop-blur-md mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-700 mb-8 flex items-center gap-3">
            <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-4 py-2 text-lg font-semibold shadow">Categories</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {/* Category Card Example */}
            <div className="flex items-start gap-4 bg-white/80 rounded-2xl shadow-lg p-5 border border-blue-100/40 backdrop-blur-md cursor-pointer hover:bg-blue-50 transition" onClick={() => handleCategoryClick('credit card')} tabIndex={0} role="button">
              <span className="text-3xl">💳</span>
              <div>
                <span className="font-semibold text-blue-800 text-lg">Credit Card</span>
                <div className="text-gray-600 text-sm">Share card picks that earn you points, perks, or cashback — and help others find great rewards too.</div>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/80 rounded-2xl shadow-lg p-5 border border-blue-100/40 backdrop-blur-md cursor-pointer hover:bg-blue-50 transition" onClick={() => handleCategoryClick('bank / investment')} tabIndex={0} role="button">
              <span className="text-3xl">🏦</span>
              <div>
                <span className="font-semibold text-blue-800 text-lg">Bank / Investment</span>
                <div className="text-gray-600 text-sm">Invite friends to banking apps or investment platforms you trust — from stocks to crypto.</div>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/80 rounded-2xl shadow-lg p-5 border border-blue-100/40 backdrop-blur-md cursor-pointer hover:bg-blue-50 transition" onClick={() => handleCategoryClick('mobile / internet')} tabIndex={0} role="button">
              <span className="text-3xl">📶</span>
              <div>
                <span className="font-semibold text-blue-800 text-lg">Mobile / Internet</span>
                <div className="text-gray-600 text-sm">Recommend mobile plans, eSIMs, or home internet services that worked well for you.</div>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/80 rounded-2xl shadow-lg p-5 border border-blue-100/40 backdrop-blur-md cursor-pointer hover:bg-blue-50 transition" onClick={() => handleCategoryClick('shopping / cashback')} tabIndex={0} role="button">
              <span className="text-3xl">🛒</span>
              <div>
                <span className="font-semibold text-blue-800 text-lg">Shopping / Cashback</span>
                <div className="text-gray-600 text-sm">From Rakuten to Ibotta — share smart ways to earn while you shop.</div>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/80 rounded-2xl shadow-lg p-5 border border-blue-100/40 backdrop-blur-md cursor-pointer hover:bg-blue-50 transition" onClick={() => handleCategoryClick('subscriptions')} tabIndex={0} role="button">
              <span className="text-3xl">📦</span>
              <div>
                <span className="font-semibold text-blue-800 text-lg">Subscriptions</span>
                <div className="text-gray-600 text-sm">Meal kits, streaming, pet boxes — let others know which subscriptions are actually worth it.</div>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/80 rounded-2xl shadow-lg p-5 border border-blue-100/40 backdrop-blur-md cursor-pointer hover:bg-blue-50 transition" onClick={() => handleCategoryClick('travel & transport')} tabIndex={0} role="button">
              <span className="text-3xl">✈️</span>
              <div>
                <span className="font-semibold text-blue-800 text-lg">Travel & Transport</span>
                <div className="text-gray-600 text-sm">Refer your favorite travel apps, flight deals, rideshare credits, or Airbnb discounts.</div>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/80 rounded-2xl shadow-lg p-5 border border-blue-100/40 backdrop-blur-md cursor-pointer hover:bg-blue-50 transition" onClick={() => handleCategoryClick('health & fitness')} tabIndex={0} role="button">
              <span className="text-3xl">🧘</span>
              <div>
                <span className="font-semibold text-blue-800 text-lg">Health & Fitness</span>
                <div className="text-gray-600 text-sm">Gym memberships, wellness apps, meditation tools — share what keeps you feeling your best.</div>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/80 rounded-2xl shadow-lg p-5 border border-blue-100/40 backdrop-blur-md cursor-pointer hover:bg-blue-50 transition" onClick={() => handleCategoryClick('education')} tabIndex={0} role="button">
              <span className="text-3xl">🎓</span>
              <div>
                <span className="font-semibold text-blue-800 text-lg">Education</span>
                <div className="text-gray-600 text-sm">From coding to languages, invite others to learn with platforms you’ve personally tried.</div>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/80 rounded-2xl shadow-lg p-5 border border-blue-100/40 backdrop-blur-md cursor-pointer hover:bg-blue-50 transition" onClick={() => handleCategoryClick('apps & tools')} tabIndex={0} role="button">
              <span className="text-3xl">🧰</span>
              <div>
                <span className="font-semibold text-blue-800 text-lg">Apps & Tools</span>
                <div className="text-gray-600 text-sm">Share must-have tools like Notion, Canva, or Dropbox — the ones that make life smoother.</div>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/80 rounded-2xl shadow-lg p-5 border border-blue-100/40 backdrop-blur-md col-span-1 sm:col-span-2 lg:col-span-1 cursor-pointer hover:bg-blue-50 transition" onClick={() => handleCategoryClick('others')} tabIndex={0} role="button">
              <span className="text-3xl">🌀</span>
              <div>
                <span className="font-semibold text-blue-800 text-lg">Others</span>
                <div className="text-gray-600 text-sm">Got something unique? Share cool finds — from niche clubs to exclusive memberships.</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}