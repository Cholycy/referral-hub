/*
Copyright (c) 2025 cholycy@gmail.com
All rights reserved.
*/
"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white min-h-screen`}>
        <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-blue-700/80 via-blue-500/80 to-blue-400/80 backdrop-blur-md border-b border-blue-200/40 shadow-lg">
          <div className="max-w-5xl mx-auto flex items-center justify-between py-3 px-2 md:px-6 relative">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="rounded-full bg-white/30 border border-white/40 shadow-lg flex items-center justify-center w-12 h-12 md:w-16 md:h-16 transition-all group-hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-7 w-7 md:h-10 md:w-10 text-blue-700 group-hover:text-yellow-400 transition">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
              </span>
              <span className="text-2xl md:text-3xl font-extrabold text-white tracking-wide drop-shadow-lg group-hover:text-yellow-200 transition select-none">ShareHub</span>
            </Link>
            {/* Desktop nav links */}
            <div className="hidden md:flex gap-2 md:gap-4 items-center">
              <Link href="/about" className="rounded-lg px-3 py-1 text-white/90 text-lg md:text-xl font-bold hover:bg-white/20 hover:text-yellow-200 transition font-medium">About</Link>
              <Link href="/" className="rounded-lg px-3 py-1 text-white/90 text-lg md:text-xl font-bold hover:bg-white/20 hover:text-yellow-200 transition font-medium">Dashboard</Link>
              <Link href="/share" className="rounded-lg px-3 py-1 text-white/90 text-lg md:text-xl font-bold hover:bg-white/20 hover:text-yellow-200 transition font-medium">Share</Link>
              <Link href="/ask" className="rounded-lg px-3 py-1 text-white/90 text-lg md:text-xl font-bold hover:bg-white/20 hover:text-yellow-200 transition font-medium">Ask</Link>
              <Link href="/profile" className="rounded-lg px-3 py-1 text-white/90 text-lg md:text-xl font-bold hover:bg-white/20 hover:text-yellow-200 transition font-medium">Profile</Link>
              <button
                onClick={() => {
                  // Use window event to trigger login/logout logic in HomeContent
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('login-logout-click'));
                  }
                }}
                className="flex items-center gap-1 bg-white/20 text-white font-bold text-lg md:text-xl px-4 py-1 rounded-full shadow hover:bg-white/40 hover:text-blue-800 transition border border-white/30"
                style={{ backdropFilter: 'blur(2px)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
                Login / Logout
              </button>
            </div>
            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center px-2 py-2 border rounded text-white border-white/60 hover:bg-white/10 focus:outline-none"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Open navigation menu"
            >
              <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Mobile dropdown */}
            {mobileMenuOpen && (
              <div className="absolute top-16 right-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-blue-200 animate-fade-in md:hidden">
                <Link href="/about" className="block px-4 py-2 text-blue-700 font-semibold hover:bg-blue-50" onClick={() => setMobileMenuOpen(false)}>About</Link>
                <Link href="/" className="block px-4 py-2 text-blue-700 font-semibold hover:bg-blue-50" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <Link href="/share" className="block px-4 py-2 text-blue-700 font-semibold hover:bg-blue-50" onClick={() => setMobileMenuOpen(false)}>Share</Link>
                <Link href="/ask" className="block px-4 py-2 text-blue-700 font-semibold hover:bg-blue-50" onClick={() => setMobileMenuOpen(false)}>Ask</Link>
                <Link href="/profile" className="block px-4 py-2 text-blue-700 font-semibold hover:bg-blue-50" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                <button
                  className="block w-full text-left px-4 py-2 text-blue-700 font-semibold hover:bg-blue-50"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('login-logout-click'));
                    }
                  }}
                >Login / Logout</button>
              </div>
            )}
          </div>
        </nav>
        <div className="transition-opacity duration-300 ease-in-out opacity-100 w-full min-h-[calc(100vh-64px)] px-2 sm:px-4 md:px-0 max-w-5xl mx-auto">
          {children}
        </div>
      </body>
    </html>
  );
}
