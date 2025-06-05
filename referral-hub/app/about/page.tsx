export default function AboutPage() {
  return (
    <main className="p-8">
      <section className="max-w-4xl mx-auto mb-8 bg-white/80 rounded-2xl shadow border border-blue-100 p-6 animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700 mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m4 0h-1v-4h-1m4 0h-1v-4h-1m4 0h-1v-4h-1" /></svg>
          Discover & Share Referrals
        </h1>
        <p className="text-gray-700 mb-4 text-base md:text-lg">
          Find, share, and benefit from referral programs across a wide range of categories. Whether you want to earn rewards or help others save, ReferralHub is your go-to place for trusted referral links.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💳</span>
            <div>
              <span className="font-semibold">Credit Card</span>
              <div className="text-gray-600 text-sm">Earn bonus points or cashback by referring credit cards.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🏦</span>
            <div>
              <span className="font-semibold">Bank / Investment</span>
              <div className="text-gray-600 text-sm">Refer friends to open bank accounts, stock or crypto platforms.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📶</span>
            <div>
              <span className="font-semibold">Mobile / Internet</span>
              <div className="text-gray-600 text-sm">Share deals from mobile carriers, home internet, or eSIM services.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🛒</span>
            <div>
              <span className="font-semibold">Shopping / Cashback</span>
              <div className="text-gray-600 text-sm">Refer people to platforms like Rakuten, Honey, or Ibotta.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <span className="font-semibold">Subscriptions</span>
              <div className="text-gray-600 text-sm">Include meal kits, pet boxes, streaming or digital tools.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">✈️</span>
            <div>
              <span className="font-semibold">Travel & Transport</span>
              <div className="text-gray-600 text-sm">Earn rewards by referring Airbnb, Uber, car rentals, and airlines.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🧘</span>
            <div>
              <span className="font-semibold">Health & Fitness</span>
              <div className="text-gray-600 text-sm">Refer gym memberships, fitness apps, or mental health platforms.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎓</span>
            <div>
              <span className="font-semibold">Education</span>
              <div className="text-gray-600 text-sm">Invite others to learning platforms like Coursera, Duolingo, LeetCode.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🧰</span>
            <div>
              <span className="font-semibold">Apps & Tools</span>
              <div className="text-gray-600 text-sm">General tech or productivity apps like Notion, Canva, Dropbox.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🌀</span>
            <div>
              <span className="font-semibold">Others</span>
              <div className="text-gray-600 text-sm">Any referrals that don’t fit above — clubs, memberships, etc.</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}