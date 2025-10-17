import Lottie from "lottie-react";
import sandyLoading from "../assets/SandyLoading.json"; // adjust path if needed

const WithdrawModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1c2451] rounded-2xl p-6 w-full max-w-md shadow-lg relative flex flex-col items-center justify-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
        >
          ✕
        </button>

        {/* Coming Soon Text */}
        <h2 className="text-center text-xl font-futuristic font-bold text-green-500 mb-5">
          Coming Soon
        </h2>

        {/* Lottie Animation */}
        <div className="w-48 h-48 flex items-center justify-center">
          <Lottie animationData={sandyLoading} loop={true} />
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;
