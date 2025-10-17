// src/components/BonusPointer.jsx
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import downArrowAnimation from '../assets/DownArrow.json';

const BonusPointer = ({ show = true, text = "Scan dan klaim bonus pertama kamu!" }) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center"
    >
      {/* Animated Label with Glow Effect */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          textShadow: [
            "0 0 10px rgba(34, 197, 94, 0.5)",
            "0 0 20px rgba(34, 197, 94, 0.8)",
            "0 0 10px rgba(34, 197, 94, 0.5)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full shadow-lg relative mb-2"
      >
        {/* Glowing Border Animation */}
        <motion.div
          animate={{
            boxShadow: [
              "0 0 10px rgba(34, 197, 94, 0.5)",
              "0 0 25px rgba(34, 197, 94, 0.8)",
              "0 0 10px rgba(34, 197, 94, 0.5)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full"
        />
        
        {/* Text with Icon */}
        <div className="flex items-center gap-2 relative z-10">
          <span className="text-2xl">🎁</span>
          <p className="font-bold text-sm md:text-base quicksand-title">
            {text}
          </p>
          <span className="text-2xl">✨</span>
        </div>

        {/* Pulse Ring Effect */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute inset-0 border-4 border-green-400 rounded-full"
        />
      </motion.div>

      {/* Animated Arrow - Lottie */}
      <motion.div
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-20 h-20 md:w-24 md:h-24"
      >
        <Lottie
          animationData={downArrowAnimation}
          loop={true}
          className="w-full h-full"
        />
      </motion.div>

      {/* Bonus Amount Badge */}
      <motion.div
        animate={{
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg shadow-md font-bold text-lg mt-1"
      >
        💰 Rp5.000 Gratis!
      </motion.div>
    </motion.div>
  );
};

export default BonusPointer;