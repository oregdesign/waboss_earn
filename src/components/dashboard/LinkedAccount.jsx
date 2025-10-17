// src/components/dashboard/LinkedAccounts.jsx - Updated with pointer
import { FaWhatsapp } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import BonusPointer from '../BonusPointer';

const LinkedAccounts = ({ linkedNumbers, setIsModalOpen, showBonusPointer = false }) => {
  return (
    <div className="row-span-4 col-start-5 row-start-1 bg-[#191e45] border border-gray-800 rounded-xl p-6 flex flex-col">
      <h2 className="text-xl font-mono font-bold text-[#404ba3] mb-4">Whatsapp Tertaut</h2>

      {/* ✅ Show Bonus Pointer if no WhatsApp linked */}
      <AnimatePresence>
        {showBonusPointer && linkedNumbers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
          >
            <BonusPointer
              show={true}
              text="Link WhatsApp pertama & dapatkan Rp5.000!"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 bg-[#11152d] rounded-lg">
        {linkedNumbers.length > 0 ? (
          linkedNumbers.map((account, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-[#141935] rounded-lg p-3 hover:shadow-neon"
            >
              <span className="text-gray-300 font-mono text-sm font-futuristic">{account.phone}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-futuristic font-medium ${
                  account.status === "connected"
                    ? "bg-green-600 border-1 rounded-lg border-green-300 shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] font-mono font-bold text-green-50 px-4 justify-items-center"
                    : "bg-red-900/20 text-gray-50/20 font-mono rounded-lg"
                }`}
              >
                {account.status}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">Belum ada akun whatsapp yang tertaut</p>
        )}
      </div>

      <button
        onClick={() => {
          console.log("Button clicked, setting isModalOpen to true");
          setIsModalOpen(true);
        }}
        className="cursor-pointer w-full bg-green-600 text-[#10122b] font-futuristic font-semibold py-3 px-3 rounded-xl hover:bg-green-600 hover:border-green-300 hover:shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] hover:text-[#fafafa] transition duration-300 mb-3 mt-6"
      >
        Tautkan Whatsapp
      </button>
    </div>
  );
};

export default LinkedAccounts;