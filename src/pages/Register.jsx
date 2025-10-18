import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onBlur" });
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [formStatus, setFormStatus] = useState("idle");

  const onSubmit = async (data) => {
    setFormStatus("loading");
    setApiError(null);
    try {
      await axios.post(`${API_URL}/register`, {
        email: data.email,
        password: data.password,
      });
      setFormStatus("success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setApiError(error.response?.data?.message || "Registration failed. Please try again.");
      setFormStatus("error");
      setTimeout(() => setFormStatus("idle"), 3000);
    }
  };

  return (
    <div className="w-screen min-h-screen flex flex-col bg-gradient-to-bl from-green-900 to-indigo-800 p-6">
      <main className="flex-grow flex items-center justify-center">
        <div className="bg-[#191e45] rounded-2xl p-8 w-full max-w-md">
          <h1 className="text-green-600 text-lg text-center mb-4">Daftar Disini!</h1>

          {formStatus === "loading" && (
            <div className="flex flex-col items-center h-64 justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-neonGreen"></div>
              <p className="mt-4 text-white">Registering...</p>
            </div>
          )}

          {formStatus === "success" && (
            <div className="flex flex-col items-center justify-center h-64 text-neonGreen">
              <span className="text-6xl animate-bounce">✅</span>
              <p className="mt-4 font-futuristic text-lg">Pendaftaran berhasil!</p>
              <p className="text-sm text-gray-300">Mengalihkan ke halaman login...</p>
            </div>
          )}

          {formStatus === "error" && (
            <div className="flex flex-col items-center justify-center h-64 text-neonRed">
              <span className="text-6xl animate-pulse">❌</span>
              <p className="mt-4 font-futuristic text-lg">Registrasi gagal</p>
              <p className="text-sm text-center">{apiError}</p>
            </div>
          )}

          {formStatus === "idle" && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
              {apiError && (
                <div className="bg-red-900/50 text-neonRed p-3 rounded-md mb-4 text-sm font-futuristic animate-fadeIn">
                  {apiError}
                </div>
              )}

              <input
                type="email"
                placeholder="Email"
                autoComplete="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                className="w-full p-3 bg-[#272f6d] text-white placeholder-gray-400 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition duration-200"
              />
              {errors.email && <p className="text-neonRed text-sm">{errors.email.message}</p>}

              <input
                type="password"
                placeholder="Kata Sandi"
                autoComplete="new-password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  }
                })}
                className="w-full p-3 bg-[#272f6d] text-white placeholder-gray-400 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition duration-200"
              />
              {errors.password && <p className="text-neonRed text-sm">{errors.password.message}</p>}

              <button
                type="submit"
                disabled={formStatus !== "idle"}
                className={`cursor-pointer w-full p-3 font-futuristic font-bold text-[#191e45] rounded-md ${
                  formStatus !== "idle"
                    ? "bg-green-700 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-600 hover:shadow-neon"
                }`}
              >
                Mendaftar
              </button>

              <p className="text-center text-sm text-gray-300 mt-3">
                Sudah Mendaftar?{" "}
                <Link to="/login" className="text-neonGreen hover:text-green-500">
                  Login di sini
                </Link>
              </p>
            </form>
          )}
        </div>
      </main>
      <footer>
        <p>&copy; 2025 www.waboss.com. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default Register;