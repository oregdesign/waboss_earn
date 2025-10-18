import { useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuthStore from "../store/useAuthStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onBlur" });
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailForReset, setEmailForReset] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [otpError, setOtpError] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError(null);
    
    console.log("🔐 Login attempt with:", data.email);
    
    try {
      const res = await axios.post(`${API_URL}/login`, {
        email: data.email,
        password: data.password,
      });

      console.log("✅ Login response:", res.data);
      
      // Store token in localStorage
      localStorage.setItem("token", res.data.token);
      console.log("💾 Token stored in localStorage");
      
      // Update auth store
      login(res.data.user);
      console.log("👤 User stored in auth state:", res.data.user);
      
      // Small delay to ensure state updates
      setTimeout(() => {
        console.log("🚀 Navigating to dashboard...");
        navigate("/dashboard", { replace: true });
      }, 100);
      
    } catch (error) {
      console.error("❌ Login error:", error);
      setApiError(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!emailForReset) return setOtpError("Email is required");
    setOtpLoading(true);
    try {
      await axios.post(`${API_URL}/send-otp`, { email: emailForReset });
      setOtpSent(true);
      setOtpError(null);
    } catch (err) {
      setOtpError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) return setOtpError("OTP is required");
    setOtpLoading(true);
    try {
      await axios.post(`${API_URL}/verify-otp`, { email: emailForReset, otp: otpCode });
      setOtpVerified(true);
      setOtpError(null);
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6)
      return setOtpError("Password must be at least 6 characters");

    setOtpLoading(true);
    try {
      await axios.post(`${API_URL}/reset-password`, {
        email: emailForReset,
        otp: otpCode,
        newPassword,
      });
      alert("Password berhasil diubah! Silakan login kembali.");
      resetForgotPassword();
    } catch (err) {
      setOtpError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setOtpLoading(false);
    }
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setOtpSent(false);
    setOtpVerified(false);
    setEmailForReset("");
    setOtpCode("");
    setNewPassword("");
    setOtpError(null);
  };

  return (
    <div className="w-screen min-h-screen flex flex-col bg-gradient-to-tr from-green-900 to-indigo-800">
      <main className="flex-grow flex items-center justify-center">
        <div className="rounded-2xl p-8 w-full max-w-md">
          <section className="space-y-6">           
            <div className="bg-[#191e45] border border-gray-800 shadow-neon rounded-2xl p-8 w-full max-w-md animate-fadeIn">
              <h1 className="text-green-600 text-lg text-center mb-6 md:text-5xl font-futuristic font-bold">
                Login
              </h1>

              {apiError && !showForgotPassword && (
                <div className="bg-red-400 border-2 border-red-900 font-mono p-3 rounded-md mb-4 text-sm animate-fadeIn text-gray-800">
                  {apiError}
                </div>
              )}
              {otpError && showForgotPassword && (
                <div className="bg-red-400 border-2 border-red-900 font-mono p-3 rounded-md mb-4 text-sm animate-fadeIn text-gray-800">
                  {otpError}
                </div>
              )}

              {showForgotPassword ? (
                otpSent ? (
                  otpVerified ? (
                    <>
                      <p className="text-gray-300 text-center mb-6 text-sm font-futuristic">
                        Masukkan kata sandi baru untuk email <strong>{emailForReset}</strong>
                      </p>
                      <input
                        type="password"
                        placeholder="Kata sandi baru"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-3 bg-[#272f6d] text-white rounded-md"
                      />
                      <div className="flex space-x-3 mt-4">
                        <button onClick={resetForgotPassword} className="flex-1 bg-gray-700 p-3 text-white rounded-md">
                          Kembali
                        </button>
                        <button
                          onClick={handleResetPassword}
                          disabled={otpLoading}
                          className="flex-1 bg-green-600 hover:bg-green-700 p-3 text-black font-futuristic rounded-md"
                        >
                          {otpLoading ? "Menyimpan..." : "Simpan Kata Sandi"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-300 text-center mb-6 text-sm font-futuristic">
                        Masukkan kode OTP yang dikirim ke <strong>{emailForReset}</strong>
                      </p>
                      <input
                        type="text"
                        placeholder="6-digit OTP"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        maxLength="6"
                        className="w-full p-3 bg-[#272f6d] text-white rounded-md text-center tracking-widest"
                      />
                      <div className="flex space-x-3 mt-4">
                        <button onClick={resetForgotPassword} className="flex-1 bg-gray-700 p-3 text-white rounded-md">
                          Kembali
                        </button>
                        <button
                          onClick={handleVerifyOtp}
                          disabled={otpLoading}
                          className="flex-1 bg-green-600 hover:bg-green-700 p-3 text-black font-futuristic rounded-md"
                        >
                          {otpLoading ? "Memverifikasi..." : "Verifikasi OTP"}
                        </button>
                      </div>
                    </>
                  )
                ) : (
                  <>
                    <p className="text-gray-300 text-center mb-6 text-sm font-futuristic">
                      Masukkan email akun anda untuk menerima kode OTP
                    </p>
                    <input
                      type="email"
                      placeholder="Alamat Email"
                      autoComplete="email"
                      value={emailForReset}
                      onChange={(e) => setEmailForReset(e.target.value)}
                      className="w-full p-3 bg-[#272f6d] text-white rounded-md"
                    />
                    <div className="flex space-x-3 mt-4">
                      <button onClick={resetForgotPassword} className="flex-1 bg-gray-700 p-3 text-white rounded-md">
                        Kembali ke Login
                      </button>
                      <button
                        onClick={handleSendOtp}
                        disabled={otpLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700 p-3 text-black font-futuristic rounded-md"
                      >
                        {otpLoading ? "Mengirim..." : "Kirim OTP"}
                      </button>
                    </div>
                  </>
                )
              ) : (
                <>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
                    <div>
                      <input
                        {...register("email", {
                        })}
                        type="email"
                        placeholder="Email"
                        autoComplete="off"
                        className={`w-full p-3 bg-[#272f6d] rounded-md focus:outline-none focus:ring-2 text-white placeholder-gray-400 font-futuristic ${
                          errors.email
                            ? "border-neonRed focus:ring-neonRed"
                            : "focus:ring-2 focus:ring-green-500 focus:outline-none transition duration-200"
                        } transition duration-300`}
                      />
                      {errors.email && (
                        <p className="text-neonRed text-sm mt-1 font-futuristic">{errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <input
                        {...register("password", {
                        })}
                        type="password"
                        placeholder="Password"
                        autoComplete="off"
                        className={`w-full p-3 bg-[#272f6d] rounded-md focus:outline-none focus:ring-2 text-white placeholder-gray-400 font-futuristic ${
                          errors.password
                            ? "border-neonRed focus:ring-neonRed"
                            : "focus:ring-2 focus:ring-green-500 focus:outline-none transition duration-200"
                        } transition duration-300`}
                      />
                      {errors.password && (
                        <p className="text-neonRed text-sm mt-1 font-futuristic">{errors.password.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full font-futuristic font-bold p-3 text-black rounded-md transition duration-300 ${
                        isLoading
                          ? "bg-green-700/50 cursor-not-allowed animate-pulse"
                          : "cursor-pointer bg-green-600 hover:bg-green-900 hover:shadow-neon"
                      }`}
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </button>
                  </form>

                  <div className="mt-3 text-center">
                    <button
                      onClick={() => setShowForgotPassword(true)}
                      className="cursor-pointer text-sm text-gray-300 font-futuristic hover:text-green-700 transition duration-300"
                    >
                      Lupa Kata sandi atau Email?
                    </button>
                  </div>

                  <div className="mt-1 text-center">
                    <p className="text-sm text-gray-300 font-futuristic">
                      Belum mempunyai akun?{" "}
                      <Link
                        to="/register"
                        className="text-sm text-neonGreen font-futuristic font-medium hover:text-green-600 transition duration-300"
                      >
                        Daftar di sini
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
      <footer>
        <p>&copy; 2025 www.waboss.com. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default Login;