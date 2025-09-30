import { useForm } from "react-hook-form";
import axios from "axios";
import { useState, useEffect } from "react";
import useAuthStore from "../store/useAuthStore";
import { FaWhatsapp } from "react-icons/fa";

function LinkWhatsApp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
  });
  const { user } = useAuthStore();
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const [infolink, setInfolink] = useState(null);
  const [status, setStatus] = useState("pending");

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError(null);
    setQrImage(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/link-whatsapp",
        { sid: data.sid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQrImage(res.data.data.qrimagelink);
      setInfolink(res.data.data.infolink);
      setStatus("pending");
    } catch (error) {
      console.error("Link WhatsApp error:", error.response?.data);
      setApiError(
        error.response?.data?.message ||
          "Failed to generate QR code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (infolink) {
      const pollInterval = setInterval(async () => {
        try {
          const res = await axios.get(infolink);
          if (res.data.status === "linked") {
            setStatus("linked");
            clearInterval(pollInterval);
            const token = localStorage.getItem("token");
            await axios.post(
              "http://localhost:5000/api/update-whatsapp-status",
              { infolink, status: "linked" },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        } catch (error) {
          console.error("Poll infolink error:", error.message);
        }
      }, 5000);
      return () => clearInterval(pollInterval);
    }
  }, [infolink]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900 dark:bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center z-50">
        <div className="flex items-center">
          <FaWhatsapp className="text-neonGreen text-2xl mr-2" />
          <span className="text-white font-futuristic text-xl font-bold">WABoss</span>
        </div>
        <a href="/dashboard" className="text-neonGreen font-futuristic font-medium hover:text-green-600 transition duration-300">
          Dashboard
        </a>
      </nav>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center bg-[url('/assets/abstract-qr-glow.svg')] bg-cover bg-opacity-20">
        <div className="bg-gray-900 border border-gray-800 shadow-neon rounded-2xl p-8 w-full max-w-md animate-fadeIn">
          <h2 className="text-3xl font-futuristic font-bold text-neonGreen mb-6 text-center">
            Link WhatsApp Account for {user?.username}
          </h2>
          {apiError && (
            <div className="bg-red-900/50 text-neonRed p-3 rounded-md mb-4 text-sm animate-fadeIn">
              {apiError}
            </div>
          )}
          {status === "linked" && (
            <div className="bg-green-900/50 text-neonGreen p-3 rounded-md mb-4 text-sm animate-fadeIn">
              WhatsApp account linked successfully!
            </div>
          )}
          {qrImage && status !== "linked" && (
            <div className="mb-4 text-center">
              <p className="text-gray-300 mb-2 font-futuristic">
                Scan this QR code with WhatsApp:
              </p>
              <img
                src={qrImage}
                alt="WhatsApp QR Code"
                className="mx-auto max-w-full h-auto border-2 border-neonGreen shadow-neon rounded-lg"
              />
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register("sid", {
                  required: "WhatsApp Server ID is required",
                  minLength: {
                    value: 3,
                    message: "Server ID must be at least 3 characters",
                  },
                })}
                placeholder="WhatsApp Server ID"
                className={`w-full p-3 bg-gray-800 border rounded-md focus:outline-none focus:ring-2 text-white placeholder-gray-400 font-futuristic ${
                  errors.sid
                    ? "border-neonRed focus:ring-neonRed"
                    : "border-gray-700 focus:ring-neonGreen focus:shadow-neon"
                } transition duration-300`}
              />
              {errors.sid && (
                <p className="text-neonRed text-sm mt-1 font-futuristic">{errors.sid.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || status === "linked"}
              className={`w-full p-3 font-futuristic font-medium text-black rounded-md transition duration-300 ${
                isLoading || status === "linked"
                  ? "bg-green-700/50 cursor-not-allowed animate-pulse"
                  : "bg-neonGreen hover:bg-green-600 hover:shadow-neon hover:scale-105"
              }`}
            >
              {isLoading ? "Generating QR..." : "Generate QR Code"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LinkWhatsApp;