// src/pages/Register.jsx - Updated with Referral Support
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuthStore from "../store/useAuthStore";
import LoadingScreen from "../components/common/LoadingScreen";
import waboss from "../assets/wb_logo_white.svg";
import bablast from "../assets/bablast_logo_white.svg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Register() {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({ mode: "onBlur" });
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [searchParams] = useSearchParams();
  
  const [apiError, setApiError] = useState(null);
  const [formStatus, setFormStatus] = useState("idle");
  
  // Referral states
  const [referralCode, setReferralCode] = useState("");
  const [referralValid, setReferralValid] = useState(null);
  const [referrerName, setReferrerName] = useState("");
  const [checkingReferral, setCheckingReferral] = useState(false);

  // Check for referral code in URL on mount
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReferralCode(refParam.toUpperCase());
      validateReferralCode(refParam);
    }
  }, [searchParams]);

  // Validate referral code
  const validateReferralCode = async (code) => {
    if (!code || code.length < 4) {
      setReferralValid(null);
      setReferrerName("");
      return;
    }

    try {
      setCheckingReferral(true);
      const res = await axios.post(`${API_URL}/game/referral/validate`, {
        referral_code: code.toUpperCase(),
      });

      if (res.data.valid) {
        setReferralValid(true);
        setReferrerName(res.data.referrer_username);
      } else {
        setReferralValid(false);
        setReferrerName("");
      }
    } catch (error) {
      console.error('Validate referral error:', error);
      setReferralValid(false);
      setReferrerName("");
    } finally {
      setCheckingReferral(false);
    }
  };

  const onSubmit = async (data) => {
    setFormStatus("loading");
    setApiError(null);

    const startTime = Date.now();

    try {
      // Register user
      const res = await axios.post(`${API_URL}/register`, {
        email: data.email,
        password: data.password,
      });

      const { token, user } = res.data;

      // Save user info
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      login(user);

      // Apply referral code if valid
      if (referralCode && referralValid) {
        try {
          await axios.post(
            `${API_URL}/game/referral/apply`,
            { referral_code: referralCode },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log('✅ Referral code applied successfully');
        } catch (refError) {
          console.error('Referral apply error:', refError);
          // Don't block registration if referral fails
        }
      }

      // Ensure at least 3 seconds of loading screen
      const elapsed = Date.now() - startTime;
      const remaining = 3000 - elapsed;
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));

      setFormStatus("success");
      setTimeout(() => navigate("/dashboard", { replace: true }), 1000);
    } catch (error) {
      setApiError(error.response?.data?.message || "Registration failed. Please try again.");
      setFormStatus("error");
      setTimeout(() => setFormStatus("idle"), 2500);
    }
  };

  return (
    <div className="w-screen min-h-screen flex flex-col items-center justify-center bg-gradient-to-bl from-green-900 to-indigo-800 text-center px-4">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img
          src={waboss}
          alt="Waboss"
          className="w-28 sm:w-40 md:w-48 lg:w-56 xl:w-64"
        />
      </div>

      {/* Intro text */}
      <div className="max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl mb-8">
        <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
          monetasi nomor whatsapp anda untuk keperluan berbagai jenis industri bisnis, dan dapatkan
          <span className="text-amber-500 font-extrabold"> bayaran </span>
          untuk setiap pesan dan tugas yang di selesaikan
        </p>
      </div>

      {/* Main Form */}
      <main className="w-full flex justify-center items-center mb-10">
        <div className="bg-[#191e45] rounded-2xl p-6 sm:p-8 lg:p-10 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg shadow-lg">
          <h1 className="text-green-600 text-lg sm:text-xl md:text-2xl font-bold mb-4">
            Daftar Disini!
          </h1>

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
                {...register("email", {})}
                className="w-full p-3 bg-[#272f6d] text-white placeholder-gray-400 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition duration-200 text-base md:text-lg"
              />

              <input
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                {...register("password", { minLength: { value: 6 } })}
                className="w-full p-3 bg-[#272f6d] text-white placeholder-gray-400 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition duration-200 text-base md:text-lg"
              />

              {/* Referral Code Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Kode Referral (Opsional)"
                  value={referralCode}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setReferralCode(val);
                    if (val.length >= 4) {
                      validateReferralCode(val);
                    } else {
                      setReferralValid(null);
                      setReferrerName("");
                    }
                  }}
                  className={`w-full p-3 bg-[#272f6d] text-white placeholder-gray-400 rounded-md focus:ring-2 focus:outline-none transition duration-200 text-base md:text-lg ${
                    referralValid === true
                      ? 'border-2 border-green-500 focus:ring-green-500'
                      : referralValid === false
                      ? 'border-2 border-red-500 focus:ring-red-500'
                      : 'focus:ring-green-500'
                  }`}
                />
                
                {/* Validation Indicator */}
                {checkingReferral && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
                
                {!checkingReferral && referralValid === true && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                    ✓
                  </div>
                )}
                
                {!checkingReferral && referralValid === false && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                    ✗
                  </div>
                )}
              </div>

              {/* Referrer Info */}
              {referralValid && referrerName && (
                <div className="bg-green-900/30 border border-green-600/50 rounded-lg p-3 text-sm">
                  <p className="text-green-400 font-medium">
                    🎁 Direferensikan oleh: <span className="font-bold">{referrerName}</span>
                  </p>
                  <p className="text-gray-300 text-xs mt-1">
                    Bonus Rp5.000 akan diberikan setelah registrasi!
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={formStatus !== "idle"}
                className={`cursor-pointer w-full p-3 md:p-4 font-futuristic font-bold text-[#191e45] rounded-md text-base md:text-lg ${
                  formStatus !== "idle"
                    ? "bg-green-700 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-600 hover:shadow-neon"
                }`}
              >
                Mendaftar
              </button>

              <p className="text-center text-sm md:text-base text-gray-300 mt-3">
                Sudah Mendaftar?{" "}
                <Link to="/login" className="text-neonGreen hover:text-green-500">
                  Login di sini
                </Link>
              </p>
            </form>
          )}
        </div>
      </main>

      {/* Footer logos */}
      <div className="flex flex-col items-center justify-center mb-6 lg:mb-10">
        <p className="text-xs sm:text-sm text-gray-400 font-mono pb-3">sponsored by :</p>
        <img
          src={bablast}
          alt="Bablast"
          className="w-24 sm:w-32 md:w-40"
        />
      </div>

      <footer className="text-gray-400 text-xs sm:text-sm pb-4">
        &copy; 2025 www.waboss.com. All Rights Reserved.
      </footer>
    </div>
  );
}

export default Register;