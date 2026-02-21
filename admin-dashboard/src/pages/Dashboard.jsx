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

  /* ================= FETCH IMAGES ================= */
  const fetchImages = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/images/admin/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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

  /* ================= CREATE ADMIN ================= */
  const handleCreateAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      setAdminMessage("All fields are required");
      return;
    }

    try {
      setCreatingAdmin(true);
      setAdminMessage("");

      await axios.post(
        "http://localhost:5000/api/admin/create",
        newAdmin,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAdminMessage("✅ Admin created successfully");
      setNewAdmin({ name: "", email: "", password: "" });

    } catch (err) {
      setAdminMessage("❌ Failed to create admin");
    }

    setCreatingAdmin(false);
  };

  /* ================= UPLOAD ================= */
  const handleUpload = async () => {
    if (!file) return alert("Select file");

    try {
      setLoadingUpload(true);

      const formData = new FormData();
      formData.append("image", file);

      await axios.post(
        "http://localhost:5000/api/images/upload",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFile(null);
      fetchImages();

    } catch (err) {
      alert("Upload failed");
    }

    setLoadingUpload(false);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/images/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchImages();

    } catch (err) {
      console.error(err);
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] text-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-10 text-purple-400">
            Admin Panel
          </h1>
          <nav className="space-y-4 text-gray-300">
            <div className="hover:text-white cursor-pointer">Dashboard</div>
            <div className="hover:text-white cursor-pointer">All Images</div>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10 space-y-10">

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-gray-400 text-sm">Total Images</h2>
            <p className="text-3xl font-bold mt-2">
              {stats.totalImages}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-gray-400 text-sm">Total Likes</h2>
            <p className="text-3xl font-bold mt-2">
              {stats.totalLikes}
            </p>
          </div>
        </div>

        {/* CREATE ADMIN */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-400">
            Create New Admin
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={newAdmin.name}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, name: e.target.value })
              }
              className="bg-slate-800 border border-slate-600 p-3 rounded-lg"
            />

            <input
              type="email"
              placeholder="Email"
              value={newAdmin.email}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, email: e.target.value })
              }
              className="bg-slate-800 border border-slate-600 p-3 rounded-lg"
            />

            <input
              type="password"
              placeholder="Password"
              value={newAdmin.password}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, password: e.target.value })
              }
              className="bg-slate-800 border border-slate-600 p-3 rounded-lg"
            />
          </div>

          <button
            onClick={handleCreateAdmin}
            disabled={creatingAdmin}
            className="mt-6 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition shadow-lg disabled:opacity-50"
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
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6">
            Upload New Image
          </h2>

          <div className="flex gap-4 items-center">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="bg-slate-800 border border-slate-600 p-3 rounded-lg"
            />

            <button
              onClick={handleUpload}
              disabled={loadingUpload}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition shadow-lg disabled:opacity-50"
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

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {images.map((img) => (
              <div
                key={img._id}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:scale-[1.03] transition-all duration-300"
              >
                <img
                  src={img.url}
                  alt="Uploaded"
                  className="w-full h-60 object-cover"
                />

                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>{img.uploadedBy?.name}</span>
                    <span className="text-purple-400">
                      {img.likeCount || 0} ❤️
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(img._id)}
                    className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg transition"
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