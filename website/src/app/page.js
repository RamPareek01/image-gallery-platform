"use client";

import { useEffect, useState, useRef } from "react";
import { auth, provider } from "@/lib/firebase";
import {
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState("newest");

  const fileInputRef = useRef(null);

  /* ===============================
     Fetch Profile
  ============================== */
  const fetchProfile = async (token) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    setCurrentUser(data);
  };

  /* ===============================
     Fetch Images
  ============================== */
  const fetchImages = async (token, pageNumber = 1, sortOption = sort) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/images?page=${pageNumber}&limit=8&sort=${sortOption}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();

    if (res.ok) {
      setImages(data.images || []);
      setTotalPages(data.totalPages || 1);
    }
  };

  /* ===============================
     Auth + Redirect Handling
  ============================== */
  useEffect(() => {
    const handleRedirectLogin = async () => {
      try {
        const result = await getRedirectResult(auth);

        if (result) {
          const idToken = await result.user.getIdToken();

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken }),
            }
          );

          const data = await response.json();
          localStorage.setItem("token", data.token);

          await fetchProfile(data.token);
          await fetchImages(data.token, page, sort);
        }
      } catch (error) {
        console.error("Redirect login error:", error);
      }
    };

    handleRedirectLogin();

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      const token = localStorage.getItem("token");

      if (user && token) {
        await fetchProfile(token);
        await fetchImages(token, page, sort);
      } else {
        setCurrentUser(null);
        setImages([]);
      }
    });

    return () => unsubscribe();
  }, [page, sort]);

  /* ===============================
     Login
  ============================== */
  const handleGoogleLogin = async () => {
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  /* ===============================
     Logout
  ============================== */
  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem("token");
    setCurrentUser(null);
    setImages([]);
  };

  /* ===============================
     Upload
  ============================== */
  const handleUpload = async () => {
    if (!file) return alert("Select a file first");

    const token = localStorage.getItem("token");
    if (!token) return alert("Login first");

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/images/upload`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    setLoading(false);

    if (response.ok) {
      setPage(1);
      await fetchImages(token, 1, sort);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* ===============================
     Delete
  ============================== */
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/images/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.ok) {
      await fetchImages(token, page, sort);
    }
  };

  /* ===============================
     Like Toggle
  ============================== */
  const handleLike = async (id) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/images/${id}/like`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.ok) {
      await fetchImages(token, page, sort);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] text-white">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-10 py-6 border-b border-white/10 backdrop-blur-lg bg-white/5">
        <h1 className="text-2xl font-bold tracking-wide">
          Image Gallery
        </h1>

        <div className="flex items-center gap-6">
          {currentUser && (
            <select
              value={sort}
              onChange={(e) => {
                setPage(1);
                setSort(e.target.value);
              }}
              className="bg-gray-400 border border-white/20 px-4 py-2 rounded-lg text-sm text-black"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="popular">Most Popular</option>
            </select>
          )}

          {currentUser && (
            <button
              onClick={() => router.push("/liked")}
              className="bg-pink-600 hover:bg-pink-700 px-5 py-2 rounded-lg transition"
            >
              Liked Images
            </button>
          )}

          {!currentUser ? (
            <button
              onClick={handleGoogleLogin}
              className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg transition shadow-lg"
            >
              Login
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-lg transition"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* IMAGE GRID */}
      <div className="max-w-7xl mx-auto px-10 mt-14">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {images.map((img) => (
            <div
              key={img._id}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl"
            >
              <img
                src={img.url}
                alt="Uploaded"
                className="w-full h-60 object-cover"
              />

              {currentUser && (
                <button
                  onClick={() => handleLike(img._id)}
                  className="w-full bg-pink-600 py-2"
                >
                  ❤️ Like / Unlike
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}