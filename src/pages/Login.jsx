import { useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuthStore from "../store/useAuthStore";
const API_URL = import.meta.env.VITE_API_URL || '/api';

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
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState(null);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await axios.post(`${API_URL}/login`, {
        email: data.email,
        password: data.password,
      });
      login(res.data.user);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (error) {
      setApiError(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!phoneNumber) return setOtpError("Phone number is required");
    if (!/^\+\d{10,15}$/.test(phoneNumber)) return setOtpError("Phone must start with + and contain 10–15 digits");

    setOtpLoading(true);
    setOtpError(null);

    try {
      await axios.post("/api/send-otp", { phone: phoneNumber });
      setOtpSent(true);
    } catch (error) {
      setOtpError(error.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) return setOtpError("OTP code is required");

    setOtpLoading(true);
    setOtpError(null);

    try {
      const res = await axios.post("/api/verify-otp", {
        phone: phoneNumber,
        otp: otpCode,
      });
      login(res.data.user);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (error) {
      setOtpError(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setOtpSent(false);
    setPhoneNumber("");
    setOtpCode("");
    setOtpError(null);
  };

  return (
    <div className="w-screen min-h-screen relative flex flex-col overflow-x-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 bg-[url('/assets/abstract-neon-waves.svg')] bg-cover">
      {/* Decorative neon glow */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-neonGreen/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-80 w-80 rounded-full bg-neonGreen/10 blur-3xl" />

      {/* Main Content */}
      <main className="flex-grow pt-24 px-4 overflow-x-hidden bg-[#272f6d] bg-[url('/src/assets/hero.svg')] bg-no-repeat bg-bottom bg-cover">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Headline + Form */}
          <section className="space-y-6">
            <header className="animate-fadeIn">
              <h1 className="text-[#f18c27] text-4xl md:text-5xl font-futuristic font-bold leading-tight">
                {showForgotPassword
                  ? otpSent
                    ? "Verify OTP"
                    : "Forgot Password"
                  : "Selamat bergabung!"}
              </h1>
              {!showForgotPassword && (
                <p className="mt-2 text-gray-300 font-futuristic">
                  Silahkan login untuk menautkan akun whatsapp anda, dan mulai mendapatkan penghasilan.
                </p>
              )}
            </header>

            <div className="bg-[#191e45] border border-gray-800 shadow-neon rounded-2xl p-8 w-full max-w-md animate-fadeIn">
              {/* Error messages */}
              {apiError && !showForgotPassword && (
                <div className="bg-red-900/50 text-neonRed p-3 rounded-md mb-4 text-sm font-futuristic animate-fadeIn">
                  {apiError}
                </div>
              )}
              {otpError && showForgotPassword && (
                <div className="bg-red-900/50 text-neonRed p-3 rounded-md mb-4 text-sm font-futuristic animate-fadeIn">
                  {otpError}
                </div>
              )}

              {/* Forgot Password Flow */}
              {showForgotPassword ? (
                otpSent ? (
                  <>
                    <p className="text-gray-300 text-center mb-6 text-sm font-futuristic">
                      Masukan Kode OTP di sini <strong>{phoneNumber}</strong>
                    </p>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP code"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        maxLength="6"
                        className="w-full p-3 bg-[#272f6d] text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-neonGreen focus:shadow-neon transition duration-300 text-center text-lg tracking-widest font-futuristic"
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={resetForgotPassword}
                          className="flex-1 p-3 bg-gray-800 border border-gray-700 text-gray-300 font-futuristic font-medium rounded-md hover:bg-gray-700 hover:shadow-neon hover:scale-105 transition duration-300"
                        >
                          Kembali
                        </button>
                        <button
                          onClick={handleVerifyOtp}
                          disabled={otpLoading}
                          className={`flex-1 p-3 font-futuristic font-medium text-black rounded-md transition duration-300 ${
                            otpLoading
                              ? "bg-green-700/50 cursor-not-allowed animate-pulse"
                              : "bg-neonGreen hover:bg-green-600 hover:shadow-neon hover:scale-105"
                          }`}
                        >
                          {otpLoading ? "Verifying..." : "Verify OTP"}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-300 text-center mb-6 text-sm font-futuristic">
                      Masukan nomor WA yang terdaftar untuk menerima kode OTP
                    </p>
                    <div className="space-y-4">
                      <input
                        type="tel"
                        placeholder="Phone number (e.g., +628123456789)"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full p-3 bg-[#272f6d] text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-neonGreen focus:shadow-neon transition duration-300"
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={resetForgotPassword}
                          className="cursor-pointer flex-1 p-3 bg-gray-800 text-gray-200 font-futuristic font-medium rounded-md hover:bg-gray-700 hover:shadow-neon hover:scale-105 transition duration-300"
                        >
                          Kembali ke Login
                        </button>
                        <button
                          onClick={handleForgotPassword}
                          disabled={otpLoading}
                          className={`flex-1 p-3 font-futuristic font-medium text-black rounded-md transition duration-300 ${
                            otpLoading
                              ? "bg-green-700/50 cursor-not-allowed animate-pulse"
                              : "cursor-pointer bg-green-700 hover:bg-green-600 hover:shadow-neon hover:scale-105"
                          }`}
                        >
                          {otpLoading ? "Sending..." : "Send OTP"}
                        </button>
                      </div>
                    </div>
                  </>
                )
              ) : (
                <>
                  {/* Normal Login Form */}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <input
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Invalid email address",
                          },
                        })}
                        type="email"
                        placeholder="Email"
                        className={`w-full p-3 bg-[#272f6d] rounded-md focus:outline-none focus:ring-2 text-white placeholder-gray-400 font-futuristic ${
                          errors.email
                            ? "border-neonRed focus:ring-neonRed"
                            : "border-gray-700 focus:ring-neonGreen focus:shadow-neon"
                        } transition duration-300`}
                      />
                      {errors.email && (
                        <p className="text-neonRed text-sm mt-1 font-futuristic">{errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <input
                        {...register("password", {
                          required: "Password is required",
                          minLength: { value: 6, message: "Password must be at least 6 characters" },
                        })}
                        type="password"
                        placeholder="Password"
                        className={`w-full p-3 bg-[#272f6d] rounded-md focus:outline-none focus:ring-2 text-white placeholder-gray-400 font-futuristic ${
                          errors.password
                            ? "border-neonRed focus:ring-neonRed"
                            : "border-gray-700 focus:ring-neonGreen focus:shadow-neon"
                        } transition duration-300`}
                      />
                      {errors.password && (
                        <p className="text-neonRed text-sm mt-1 font-futuristic">{errors.password.message}</p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full p-3 font-futuristic font-medium text-black rounded-md transition duration-300 ${
                        isLoading
                          ? "bg-green-700/50 cursor-not-allowed animate-pulse"
                          : "cursor-pointer bg-green-600 hover:bg-green-900 hover:shadow-neon"
                      }`}
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </button>
                  </form>

                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setShowForgotPassword(true)}
                      className="cursor-pointer text-sm text-gray-300 font-futuristic hover:text-green-700 transition duration-300"
                    >
                      Lupa Kata sandi atau Email?
                    </button>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-300 font-futuristic">
                      Belum mempunyai akun?{" "}
                      <Link
                        to="/register"
                        className="text-neonGreen font-futuristic font-medium hover:text-green-600 transition duration-300"
                      >
                        Daftar di sini
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Right: Visuals (optional, like Register page) */}
          <aside className="hidden lg:block animate-fadeIn">
            <div className="grid grid-cols-2 gap-4"></div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Login;
