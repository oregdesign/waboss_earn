import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
  });
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [formStatus, setFormStatus] = useState('idle'); // New state for form status

  const onSubmit = async (data) => {
    setFormStatus('loading');
    setApiError(null);
    try {
      await axios.post("/", {
        username: data.username,
        email: data.email,
        password: data.password,
        whatsapp_phone: data.whatsapp_phone,
      });
      setFormStatus('success');
      setTimeout(() => navigate("/login"), 2000); // Redirect after 2 seconds
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 3000); // Reset to idle after 3 seconds for retry
    }
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
          <section className="md:items-center space-y-6">
            <header className="animate-fadeIn">
              <h1 className="text-[#f18c27] text-4xl md:text-5xl font-futuristic font-bold text-neonGreen leading-tight">
                Daftar Disini!
              </h1>
              <p className="mt-2 text-gray-300 font-futuristic">
                Gabung WABoss dan monetasi whatsapp bisnis anda, dengan system Otomatisasi kami yang handal.
              </p>
            </header>

            <div className="bg-[#191e45] border border-gray-800 shadow-neon rounded-2xl p-8 w-full max-w-md animate-fadeIn">
              <div className="space-y-4">
                {formStatus === 'loading' && (
                  <div className="flex flex-col items-center justify-center h-64 animate-fadeIn">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-neonGreen"></div>
                    <p className="mt-4 text-white font-futuristic">Registering...</p>
                  </div>
                )}
                {formStatus === 'success' && (
                  <div className="flex flex-col items-center justify-center h-64 text-neonGreen animate-fadeIn">
                    <span className="text-6xl animate-bounce">✅</span>
                    <p className="mt-4 font-futuristic text-lg">Pendaftaran berhasil!</p>
                    <p className="text-sm text-gray-300">Mengalihkan ke halaman login...</p>
                  </div>
                )}
                {formStatus === 'error' && (
                  <div className="flex flex-col items-center justify-center h-64 text-neonRed animate-fadeIn">
                    <span className="text-6xl animate-pulse">❌</span>
                    <p className="mt-4 font-futuristic text-lg">Registrati gagal</p>
                    <p className="text-sm text-center">{apiError}</p>
                    <p className="text-sm text-gray-300 mt-2">Kembali ke form...</p>
                  </div>
                )}
                {formStatus === 'idle' && (
                  <>
                    {apiError && (
                      <div className="bg-red-900/50 text-neonRed p-3 rounded-md mb-4 text-sm font-futuristic animate-fadeIn">
                        {apiError}
                      </div>
                    )}
                    <form autoComplete="off" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                        <label htmlFor="username" className="sr-only">Nama Pengguna</label>
                        <input class="invalid:border-pink-500 invalid:text-pink-600 focus:border-sky-500 focus:outline focus:outline-sky-500 focus:invalid:border-pink-500 focus:invalid:outline-pink-500
                        disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:shadow-none dark:disabled:border-gray-700 dark:disabled:bg-gray-800/20"
                          id="username"
                          {...register("username", {
                            required: "Username is required",
                            minLength: { value: 3, message: "Username must be at least 3 characters" },
                          })}
                          placeholder="Username"
                          className={`w-full p-3 bg-[#272f6d] rounded-md focus:outline-none focus:ring-2 text-white placeholder-gray-400 font-futuristic ${
                            errors.username ? "border-neonRed focus:ring-neonRed" : "border-gray-700 focus:ring-neonGreen focus:shadow-neon"
                          } transition duration-300`}
                        />
                        {errors.username && (
                          <p className="text-neonRed text-sm mt-1 font-futuristic">{errors.username.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input
                          id="email"
                          {...register("email", {
                            required: "Email is required",
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" },
                          })}
                          type="email"
                          placeholder="Email"
                          className={`w-full p-3 bg-[#272f6d] rounded-md focus:outline-none focus:ring-2 text-white placeholder-gray-400 font-futuristic ${
                            errors.email ? "border-neonRed focus:ring-neonRed" : "border-gray-700 focus:ring-neonGreen focus:shadow-neon"
                          } transition duration-300`}
                        />
                        {errors.email && (
                          <p className="text-neonRed text-sm mt-1 font-futuristic">{errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="whatsapp_phone" className="sr-only">No Wa Bisnis</label>
                        <input
                          id="whatsapp_phone"
                          {...register("whatsapp_phone", {
                            required: "WhatsApp phone number is required",
                            pattern: {
                              value: /^\+62\d{9,13}$/,
                              message: "Masukan nomor WA indonesia yang valid (e.g., +628123456789)",
                            },
                          })}
                          type="tel"
                          placeholder="WhatsApp Phone Number (e.g., +628123456789)"
                          className={`w-full p-3 bg-[#272f6d] rounded-md focus:outline-none focus:ring-2 text-white placeholder-gray-400 font-futuristic ${
                            errors.whatsapp_phone ? "border-neonRed focus:ring-neonRed" : "border-gray-700 focus:ring-neonGreen focus:shadow-neon"
                          } transition duration-300`}
                        />
                        {errors.whatsapp_phone && (
                          <p className="text-neonRed text-sm mt-1 font-futuristic">{errors.whatsapp_phone.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="password" className="sr-only">Kata Sandi</label>
                        <input
                          id="password"
                          {...register("password", {
                            required: "Password is required",
                            minLength: { value: 6, message: "Katasandi setidaknya terdiri dari 6 karakter" },
                          })}
                          type="password"
                          placeholder="Password"
                          className={`w-full p-3 bg-[#272f6d] rounded-md focus:outline-none focus:ring-2 text-white placeholder-gray-400 font-futuristic ${
                            errors.password ? "border-neonRed focus:ring-neonRed" : "border-gray-700 focus:ring-neonGreen focus:shadow-neon"
                          } transition duration-300`}
                        />
                        {errors.password && (
                          <p className="text-neonRed text-sm mt-1 font-futuristic">{errors.password.message}</p>
                        )}
                      </div>
                      <div className="flex items-start gap-3">
                        <input
                          id="agreement"
                          type="checkbox"
                          {...register("agreement", { required: "You must accept the user agreement" })}
                          className="mt-1 h-4 w-4 rounded border-gray-700 bg-gray-800 text-neonGreen focus:ring-neonGreen"
                        />
                        <label htmlFor="agreement" className="text-gray-300 text-sm font-futuristic">
                          Saya telah membaca dan setuju <span className="text-neonGreen">Perjanjuan Pengguna</span>.
                        </label>
                      </div>
                      {errors.agreement && (
                        <p className="text-neonRed text-sm -mt-2 font-futuristic">{errors.agreement.message}</p>
                      )}
                      <button
                        type="submit"
                        disabled={formStatus !== 'idle'}
                        className={`cursor-pointer w-full p-3 font-futuristic font-medium text-black rounded-md transition duration-300 ${
                          formStatus !== 'idle' ? "bg-green-700/50 cursor-not-allowed animate-pulse" : "bg-green-600/50 hover:bg-green-600 hover:shadow-neon"
                        }`}
                      >
                        Mendaftar
                      </button>
                      <p className="text-center text-sm text-gray-300 font-futuristic mt-3">
                        Sudah Mendaftar? <Link to="/login" className="text-neonGreen font-medium hover:text-green-600 transition duration-300">Login di sini</Link>
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Right: Feature cards / abstract visuals */}
          <aside className="hidden lg:block animate-fadeIn">
            <div className="grid grid-cols-2 gap-4"></div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Register;