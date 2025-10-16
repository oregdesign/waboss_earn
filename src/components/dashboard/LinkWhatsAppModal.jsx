import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, Loader2, CheckCircle, RefreshCcw } from "lucide-react";
import video from '../../../src/assets/tautkan1.mp4'

const LinkWhatsAppModal = ({
  isModalOpen,
  setIsModalOpen,
  qrImage,
  status,
  linkedNumber,
  timer,
  handleGenerateQr,
}) => {
  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          key="wa-modal"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-[#1b1f3b] rounded-2xl p-6 w-[90%] max-w-md shadow-xl"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-8 text-gray-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-bold text-center text-green-400 mb-4 font-futuristic">
              Tautkan WhatsApp
            </h2>

            {/* Status Display */}
            {status === "idle" && (
              <div className="text-center">
                <video autoPlay loop muted playsInline className="rounded-2xl border-2 border-green-800 mb-3">
  <source src={video} type="video/mp4" />
</video>
                
                <p className="text-gray-400 text-sm mb-4">
                  Pindai kode QR yang akan di tampilkan dengan aplikasi whatsapp anda.
                </p>
                <button
                  onClick={handleGenerateQr}
                  className="bg-green-600 hover:bg-green-700 transition-colors px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 mx-auto"
                >
                  <QrCode className="w-5 h-5" />
                  Generate QR
                </button>
              </div>
            )}

            {status === "loading" && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-10 h-10 text-green-400 animate-spin mb-4" />
                <p className="text-gray-400 text-sm">
                  Menunggu pemindaian QR... ({timer}s)
                </p>
                {qrImage && (
                  <img
                    src={qrImage}
                    alt="QR Code"
                    className="w-64 h-64 object-contain mt-4 border border-green-500 rounded-lg p-2"
                  />
                )}
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center justify-center py-6">
                <CheckCircle className="w-12 h-12 text-green-400 mb-3" />
                <p className="text-green-300 font-semibold text-center">
                  WhatsApp berhasil ditautkan!
                </p>
                <p className="text-gray-400 text-sm mt-1">{linkedNumber}</p>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="mt-1 bg-green-700 hover:bg-green-800 px-2 py-2 rounded-lg text-white font-medium transition"
                >
                  Tutup
                </button>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center justify-center py-6">
                <p className="text-red-400 font-semibold mb-3">
                  Gagal membuat QR atau menghubungkan akun.
                </p>
                <button
                  onClick={handleGenerateQr}
                  className="bg-blue-600 hover:bg-blue-700 transition-colors px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2"
                >
                  <RefreshCcw className="w-5 h-5" />
                  Coba Lagi
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LinkWhatsAppModal;
