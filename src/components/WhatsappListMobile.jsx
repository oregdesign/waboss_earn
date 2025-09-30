import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function WhatsappListMobile({ linkedNumbers, setIsModalOpen }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[#191e45] rounded-xl">
      {/* Header */}
      <div
        className="items-center justify-items-center cursor-pointer mb-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="items-center w-8 h-8 text-green-600" />
        </motion.div>
      </div>

      {/* Expandable list */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="wa-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 bg-[#11152d] rounded-lg p-3 mt-2">
              {linkedNumbers.length > 0 ? (
                linkedNumbers.map((account, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-[#141935] rounded-lg p-3 hover:shadow-neon"
                  >
                    <span className="text-gray-300 font-mono text-sm font-futuristic">
                      {account.phone}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-futuristic font-medium ${
                        account.status === "connected"
                          ? "bg-green-600 border-1 border-green-300 shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] font-mono font-bold text-green-50 px-4"
                          : "bg-red-900/20 text-gray-50/20 font-mono"
                      }`}
                    >
                      {account.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center">
                  No linked numbers yet
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
