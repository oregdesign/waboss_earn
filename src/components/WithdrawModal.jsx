import { useState } from "react";
import { XCircle, CheckCircle } from "lucide-react";

const WithdrawModal = ({ isOpen, onClose }) => {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setPhone("");
        setAmount("");
        onClose();
      }, 2000);
    }, 1500);
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.startsWith("0")) val = val.slice(1);
    setPhone(val);
  };

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    setAmount(val);
  };

  const formatRupiah = (number) => {
    if (!number) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1c2451] rounded-2xl p-6 w-full max-w-md shadow-lg relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
        >
          <XCircle size={28} />
        </button>

        {/* Title */}
        <h2 className="text-center text-xl font-futuristic font-bold text-green-500 mb-5">
          Tarik Penghasilan
        </h2>

        {success ? (
          <div className="flex flex-col items-center justify-center py-10">
            <CheckCircle className="text-green-500 mb-3" size={64} />
            <p className="text-green-400 font-futuristic text-lg">
              Penarikan Berhasil!
            </p>
            <p className="text-gray-400 text-sm mt-1">Dana sedang dikirim ke DANA</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone Input */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Nomor DANA
              </label>
              <div className="flex items-center bg-[#272f6d] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-500/50 transition duration-200">
                <span className="px-4 text-white font-mono select-none border-r border-gray-700">
                  +62
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="8123456789"
                  inputMode="numeric"
                  className="flex-1 p-3 bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg font-mono"
                  required
                />
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Jumlah Penarikan
              </label>
              <input
                type="text"
                value={amount ? formatRupiah(amount) : ""}
                onChange={handleAmountChange}
                placeholder="Masukkan jumlah (min. Rp10.000)"
                className="w-full p-3 bg-[#272f6d] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition duration-200 font-mono"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl font-futuristic font-semibold transition duration-300 ${
                isSubmitting
                  ? "bg-green-800 cursor-not-allowed animate-pulse text-gray-200"
                  : "bg-green-600 hover:bg-green-500 hover:shadow-[0_0_10px_#22c55e] text-white"
              }`}
            >
              {isSubmitting ? "Memproses..." : "Tarik Sekarang"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default WithdrawModal;
