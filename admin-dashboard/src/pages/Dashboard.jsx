import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [images, setImages] = useState([]);
  const [stats, setStats] = useState({
    totalImages: 0,
    totalLikes: 0,
  });

  const [file, setFile] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);

  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [adminMessage, setAdminMessage] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const token = localStorage.getItem("adminToken");

  const fetchImages = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/images/admin/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setImages(res.data);

      const totalImages = res.data.length;
      const totalLikes = res.data.reduce(
        (acc, img) => acc + (img.likeCount || 0),
        0
      );

      setStats({ totalImages, totalLikes });

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }
    fetchImages();
  }, []);

  const handleCreateAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      setAdminMessage("All fields are required");
      return;
    }

    try {
      setCreatingAdmin(true);
      setAdminMessage("");

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/create`,
        newAdmin,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAdminMessage("Admin created successfully");
      setNewAdmin({ name: "", email: "", password: "" });

    } catch (err) {
      setAdminMessage("Failed to create admin");
    }

    setCreatingAdmin(false);
  };

  const handleUpload = async () => {
    if (!file) return alert("Select file");

    try {
      setLoadingUpload(true);

      const formData = new FormData();
      formData.append("image", file);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/images/upload`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFile(null);
      fetchImages();

    } catch (err) {
      alert("Upload failed");
    }

    setLoadingUpload(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/images/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchImages();

    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] text-white flex flex-col md:flex-row">

      {/* SIDEBAR (Desktop) / TOPBAR (Mobile) */}
      <div className="w-full md:w-64 bg-white/5 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/10 p-6 flex md:flex-col justify-between items-center md:items-start">

        <h1 className="text-xl md:text-2xl font-bold text-purple-400">
          Admin Panel
        </h1>

        <nav className="hidden md:block mt-10 space-y-4 text-gray-300">
          <div className="hover:text-white cursor-pointer">Dashboard</div>
          <div className="hover:text-white cursor-pointer">All Images</div>
        </nav>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 active:scale-95 transition-all duration-200 px-4 py-2 rounded-lg shadow-md"
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 sm:p-6 md:p-10 space-y-10">

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition">
            <h2 className="text-gray-400 text-sm">Total Images</h2>
            <p className="text-3xl font-bold mt-2">{stats.totalImages}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition">
            <h2 className="text-gray-400 text-sm">Total Likes</h2>
            <p className="text-3xl font-bold mt-2">{stats.totalLikes}</p>
          </div>
        </div>

        {/* CREATE ADMIN */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-400">
            Create New Admin
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={newAdmin.name}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, name: e.target.value })
              }
              className="bg-slate-800 border border-slate-600 p-3 rounded-lg w-full"
            />

            <input
              type="email"
              placeholder="Email"
              value={newAdmin.email}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, email: e.target.value })
              }
              className="bg-slate-800 border border-slate-600 p-3 rounded-lg w-full"
            />

            <input
              type="password"
              placeholder="Password"
              value={newAdmin.password}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, password: e.target.value })
              }
              className="bg-slate-800 border border-slate-600 p-3 rounded-lg w-full"
            />
          </div>

          <button
            onClick={handleCreateAdmin}
            disabled={creatingAdmin}
            className="mt-6 bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all duration-200 px-6 py-3 rounded-lg shadow-lg disabled:opacity-50"
          >
            {creatingAdmin ? "Creating..." : "Create Admin"}
          </button>

          {adminMessage && (
            <p className="mt-4 text-sm text-green-400">
              {adminMessage}
            </p>
          )}
        </div>

        {/* UPLOAD */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6">
            Upload New Image
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="bg-slate-800 border border-slate-600 p-3 rounded-lg w-full sm:w-auto"
            />

            <button
              onClick={handleUpload}
              disabled={loadingUpload}
              className="bg-green-600 hover:bg-green-700 active:scale-95 transition-all duration-200 px-6 py-3 rounded-lg shadow-lg disabled:opacity-50 w-full sm:w-auto"
            >
              {loadingUpload ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>

        {/* IMAGES GRID */}
        <div>
          <h2 className="text-xl font-semibold mb-6">
            All Images
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {images.map((img) => (
              <div
                key={img._id}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="overflow-hidden">
                  <img
                    src={img.url}
                    alt="Uploaded"
                    className="w-full h-56 sm:h-60 object-cover transform group-hover:scale-110 transition duration-500"
                  />
                </div>

                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span className="truncate">{img.uploadedBy?.name}</span>
                    <span className="text-purple-400 font-semibold">
                      {img.likeCount || 0} ❤️
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(img._id)}
                    className="w-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all duration-200 py-2 rounded-lg shadow-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}