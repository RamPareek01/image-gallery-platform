"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LikedPage() {
  const [images, setImages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  const fetchLikedImages = async (token) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/images/liked`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (res.ok) {
      setImages(data || []);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      const token = localStorage.getItem("token");

      if (!user || !token) {
        router.push("/");
        return;
      }

      setCurrentUser(user);
      await fetchLikedImages(token);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] text-white">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-10 py-6 border-b border-white/10 backdrop-blur-lg bg-white/5">
        <h1 className="text-2xl font-bold">Liked Images</h1>

        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg transition"
        >
          Back to Gallery
        </button>
      </nav>

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-10 mt-14">
        {images.length === 0 ? (
          <p className="text-center text-gray-400">
            You haven’t liked any images yet.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {images.map((img) => (
              <div
                key={img._id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl"
              >
                <img
                  src={img.url}
                  alt="Liked"
                  className="w-full h-60 object-cover"
                />

                <div className="p-5">
                  <p className="text-sm text-gray-300">
                    Uploaded by {img.uploadedBy?.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}