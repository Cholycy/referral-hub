/*
Copyright (c) 2025 cholycy@gmail.com
All rights reserved.
*/
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RequestSharePage() {
  const [request, setRequest] = useState({
    title: "",
    details: "",
    contact: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRequest({ ...request, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    // TODO: Replace with your backend logic to save the request
    try {
      // Example: Save to Supabase "share_requests" table
      // const { error } = await supabase.from("share_requests").insert([request]);
      // if (error) throw error;
      setSuccessMsg("Your request has been submitted!");
      setTimeout(() => router.push("/"), 1500);
    } catch (err: any) {
      setErrorMsg("Failed to submit request.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-2">
      <section className="w-full max-w-xl bg-white/70 rounded-3xl shadow-2xl border border-blue-100 p-8 md:p-12 flex flex-col gap-6 backdrop-blur-md animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700 mb-2 text-center flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Request a Sharing
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="title" className="block text-blue-800 font-semibold mb-1">What are you looking for?</label>
            <input
              id="title"
              name="title"
              type="text"
              className="w-full rounded-xl border border-blue-200 px-4 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm text-blue-900 placeholder:text-blue-500"
              placeholder="e.g. Best credit card deal"
              value={request.title}
              onChange={handleChange}
              required
              maxLength={80}
            />
          </div>
          <div>
            <label htmlFor="details" className="block text-blue-800 font-semibold mb-1">Details</label>
            <textarea
              id="details"
              name="details"
              rows={3}
              className="w-full rounded-xl border border-blue-200 px-4 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm resize-none text-blue-900 placeholder:text-blue-500"
              placeholder="Describe what you need or why"
              value={request.details}
              onChange={handleChange}
              required
              maxLength={500}
            />
          </div>
          <div>
            <label htmlFor="contact" className="block text-blue-800 font-semibold mb-1">Contact (optional)</label>
            <input
              id="contact"
              name="contact"
              type="text"
              className="w-full rounded-xl border border-blue-200 px-4 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm text-blue-900 placeholder:text-blue-500"
              placeholder="Email or social handle"
              value={request.contact}
              onChange={handleChange}
              maxLength={100}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition font-bold"
          >
            Submit Request
          </button>
          {successMsg && <div className="text-green-700 font-semibold">{successMsg}</div>}
          {errorMsg && <div className="text-red-700 font-semibold">{errorMsg}</div>}
        </form>
      </section>
    </main>
  );
}
