"use client";

import { useEffect, useState, useRef } from "react";
import { auth, provider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
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

  const fetchProfile = async (token) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return;
    const data = await res.json();
    setCurrentUser(data);
  };

  const fetchImages = async (token, pageNumber = 1, sortOption = sort) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/images?page=${pageNumber}&limit=8&sort=${sortOption}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return;
    const data = await res.json();
    setImages(data.images || []);
    setTotalPages(data.totalPages || 1);
  };

  useEffect(() => {
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

  const handleGoogleLogin = async () => {
    const result = await signInWithPopup(auth, provider);
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
    await fetchImages(data.token, 1, sort);
  };

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem("token");
    setCurrentUser(null);
    setImages([]);
  };

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

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/images/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (response.ok) await fetchImages(token, page, sort);
  };

  const handleLike = async (id) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/images/${id}/like`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (response.ok) await fetchImages(token, page, sort);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] text-white">

      {/* NAVBAR */}
      <nav className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 sm:px-10 py-4 sm:py-6 border-b border-white/10 backdrop-blur-xl bg-white/5 shadow-lg gap-4 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-center sm:text-left">
          Image Gallery
        </h1>

        <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3 sm:gap-6">

          {currentUser && (
            <select
              value={sort}
              onChange={(e) => {
                setPage(1);
                setSort(e.target.value);
              }}
              className="bg-gray-400 px-3 py-2 rounded-lg text-black text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="popular">Most Popular</option>
            </select>
          )}

          {currentUser && (
            <button
              onClick={() => router.push("/liked")}
              className="bg-pink-600 hover:bg-pink-700 active:scale-95 transition-all duration-200 px-4 py-2 rounded-lg text-sm shadow-md"
            >
              Liked
            </button>
          )}

          {!currentUser ? (
            <button
              onClick={handleGoogleLogin}
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-200 px-4 py-2 rounded-lg text-sm shadow-md"
            >
              Login
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-gray-700 hover:bg-gray-600 active:scale-95 transition-all duration-200 px-4 py-2 rounded-lg text-sm shadow-md"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* UPLOAD PANEL */}
      {currentUser && (
        <div className="max-w-4xl mx-auto mt-8 sm:mt-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-8 shadow-2xl">
          <h2 className="text-lg sm:text-xl font-semibold mb-6 text-center">
            Upload New Image
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files[0])}
              className="bg-slate-800 border border-slate-600 p-3 rounded-lg w-full sm:w-auto"
            />

            <button
              onClick={handleUpload}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 active:scale-95 transition-all duration-200 px-6 py-3 rounded-lg shadow-lg disabled:opacity-50 w-full sm:w-auto"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}

      {/* IMAGE GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-10 mt-10 sm:mt-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-10">
          {images.map((img) => (
            <div
              key={img._id}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="overflow-hidden">
                <img
                  src={img.url}
                  alt="Uploaded"
                  className="w-full h-56 sm:h-60 object-cover transform group-hover:scale-110 transition duration-500 ease-in-out"
                />
              </div>

              <div className="p-4 sm:p-5">
                <div className="flex justify-between items-center text-sm text-gray-300 mb-3">
                  <span className="truncate">{img.uploadedBy?.name}</span>
                  <span className="font-semibold">
                    ❤️ {img.likeCount || 0}
                  </span>
                </div>

                {currentUser && (
                  <button
                    onClick={() => handleLike(img._id)}
                    className="w-full bg-pink-600 hover:bg-pink-700 active:scale-95 transition-all duration-200 py-2 rounded-lg text-sm shadow-md"
                  >
                    ❤️ Like / Unlike
                  </button>
                )}

                {currentUser &&
                  (currentUser._id === img.uploadedBy?._id ||
                    currentUser.role === "admin") && (
                    <button
                      onClick={() => handleDelete(img._id)}
                      className="mt-3 w-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all duration-200 py-2 rounded-lg text-sm shadow-md"
                    >
                      Delete
                    </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {currentUser && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mt-12 sm:mt-16 text-sm">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-lg transition disabled:opacity-30 w-full sm:w-auto"
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-lg transition disabled:opacity-30 w-full sm:w-auto"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}