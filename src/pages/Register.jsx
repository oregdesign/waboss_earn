import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import useAuthStore from "../store/useAuthStore"; // ✅ import here
import LoadingScreen from "../components/common/LoadingScreen";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onBlur" });
  const navigate = useNavigate();
  const { login } = useAuthStore(); // ✅ moved INSIDE component
  const [apiError, setApiError] = useState(null);
  const [formStatus, setFormStatus] = useState("idle");

const onSubmit = async (data) => {
  setFormStatus("loading");
  setApiError(null);

  const startTime = Date.now(); // mark start time

  try {
    const res = await axios.post(`${API_URL}/register`, {
      email: data.email,
      password: data.password,
    });

    const { token, user } = res.data;

    // Save user info
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    login(user);

    // ✅ Ensure at least 3 seconds of loading screen
    const elapsed = Date.now() - startTime;
    const remaining = 3000 - elapsed;
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));

    // Now show success
    setFormStatus("success");

    setTimeout(() => navigate("/dashboard", { replace: true }), 1000);
  } catch (error) {
    setApiError(error.response?.data?.message || "Registration failed. Please try again.");
    setFormStatus("error");
    setTimeout(() => setFormStatus("idle"), 2500);
  }
};


  return (
    <div className="w-screen min-h-screen flex flex-col bg-gradient-to-bl from-green-900 to-indigo-800">
      <div className="h-5 flex-grow flex items-center justify-center">
      <img width="120" height="20" src="/src/assets/wb_logo_white.svg" alt="Waboss"/>
      </div>
      <div className="h-1 flex-grow flex items-center justify-center">
      <p className="text-center text-gray-300 w-85 md:w-1/3 sm:w-1/2 ">monetasi nomor whatsapp anda untuk keperluan berbagai jenis industri bisnis, dan dapatkan 
      <span className="text-amber-500 font-extrabold"> bayaran </span> untuk setiap pesan dan tugas yang di selesaikan</p>
</div>
      <main className="flex-grow flex items-center justify-center p-6 pb-12">            
            <div className="bg-[#191e45] rounded-2xl p-8 w-full max-w-md">
              <h1 className="text-green-600 text-lg text-center mb-4">Daftar Disini!</h1>
{formStatus === "loading" && <LoadingScreen />}
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
                <div className="bg-red-400 border-2 border-red-900 font-mono p-3 rounded-md mb-4 text-sm animate-fadeIn text-gray-800">
                  {apiError}
                </div>
              )}

              <input
                type="email"
                placeholder="Email"
                autoComplete="off"
                {...register("email", {
                })}
                className="w-full p-3 bg-[#272f6d] text-white placeholder-gray-400 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition duration-200"
              />
              {errors.email && <p className="text-neonRed text-sm">{errors.email.message}</p>}

              <input
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                {...register("password", {
                  minLength: {
                    value: 6,
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
      <div className="h-24 lg:h-64 items-center justify-items-center pt-6">
        <p className="text-xs text-gray-400 font-mono pb-3">sponsored by :</p>
        <img width="120" height="20" src="/src/assets/bablast_logo_white.svg" alt="Bablast"/>
      </div>
      <footer>
        <p>&copy; 2025 www.waboss.com. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default Register;