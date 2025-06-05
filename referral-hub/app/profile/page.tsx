"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", category: "credit card", expiration: "", url: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchUserAndReferrals = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/?showLogin=1");
        return;
      }
      setUser(user);
      const { data, error } = await supabase.from("referrals").select("*").eq("user_id", user.id).order("expiration_date", { ascending: false });
      if (error) setErrorMsg(error.message);
      else setReferrals(data || []);
      setLoading(false);
    };
    fetchUserAndReferrals();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this referral?")) return;
    setLoading(true);
    const { error } = await supabase.from("referrals").delete().eq("id", id);
    if (error) setErrorMsg(error.message);
    else setReferrals(referrals.filter((r) => r.id !== id));
    setLoading(false);
  };

  const handleEdit = (ref: any) => {
    setEditId(ref.id);
    setEditForm({
      title: ref.title,
      description: ref.description,
      category: ref.category,
      expiration: ref.expiration_date ? ref.expiration_date.replace(" ", "T").slice(0, 16) : "",
      url: ref.url || "",
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    let formattedExpiration = editForm.expiration;
    if (formattedExpiration.length === 16) {
      formattedExpiration = formattedExpiration.replace('T', ' ') + ':00+00';
    }
    const { error } = await supabase.from("referrals").update({
      title: editForm.title,
      description: editForm.description,
      category: editForm.category,
      expiration_date: formattedExpiration,
      url: editForm.url,
    }).eq("id", editId!);
    if (error) setErrorMsg(error.message);
    else {
      setSuccessMsg("Referral updated!");
      setReferrals(referrals.map((r) => r.id === editId ? { ...r, ...editForm, expiration_date: formattedExpiration } : r));
      setEditId(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-white min-h-screen rounded-xl shadow-xl">
      <h2 className="text-3xl font-extrabold mb-6 text-blue-700 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 4.797.607 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        My Referrals
      </h2>
      {errorMsg && <div className="text-red-600 mb-2 font-semibold bg-red-100 p-2 rounded">{errorMsg}</div>}
      {successMsg && <div className="text-green-600 mb-2 font-semibold bg-green-100 p-2 rounded">{successMsg}</div>}
      {referrals.length === 0 ? (
        <div className="text-gray-600 bg-white rounded p-6 shadow text-center">You have not submitted any referrals yet.</div>
      ) : (
        <div className="space-y-6">
          {referrals.map((ref) => (
            <div key={ref.id} className="bg-white border border-blue-100 rounded-xl shadow-md p-6 flex flex-col gap-2 hover:shadow-lg transition-shadow">
              {editId === ref.id ? (
                <form onSubmit={handleUpdate} className="space-y-3">
                  <input type="text" name="title" value={editForm.title} onChange={handleEditChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300" maxLength={50} />
                  <textarea name="description" value={editForm.description} onChange={handleEditChange} required maxLength={150} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300" />
                  <select name="category" value={editForm.category} onChange={handleEditChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300">
                    <option value="credit card">Credit Card</option>
                    <option value="membership">Membership</option>
                    <option value="others">Others</option>
                  </select>
                  <input type="datetime-local" name="expiration" value={editForm.expiration} onChange={handleEditChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300" />
                  <input type="text" name="url" value={editForm.url} onChange={handleEditChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300" placeholder="Referral Link" />
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Save</button>
                    <button type="button" className="bg-gray-300 px-4 py-2 rounded shadow hover:bg-gray-400" onClick={() => setEditId(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-blue-700">{ref.title}</div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">{ref.category}</span>
                  </div>
                  <div className="text-gray-700 text-base mb-1">{ref.description}</div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                    {ref.expiration_date && <span className="px-2 py-1 bg-gray-200 rounded">Expires: {ref.expiration_date}</span>}
                  </div>
                  {ref.url && (
                    <a href={ref.url} className="text-blue-600 underline break-all font-mono" target="_blank" rel="noopener noreferrer">{ref.url}</a>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button className="bg-yellow-500 text-white px-3 py-1 rounded shadow hover:bg-yellow-600" onClick={() => handleEdit(ref)}>Edit</button>
                    <button className="bg-red-600 text-white px-3 py-1 rounded shadow hover:bg-red-700" onClick={() => handleDelete(ref.id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
