// src/components/dashboard/MobileLayout.jsx - Add BonusPointer
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle, XCircle, Gift } from 'lucide-react';
import CarouselMobile from '../CarouselMobile';
import WhatsappListMobile from '../WhatsappListMobile';
import BonusPointer from '../BonusPointer'; // ✅ Import the new component
import Lottie from 'lottie-react';
import bonusAnimation from '../../assets/GiftBox.json';

const MobileLayout = ({
  user,
  handleLogout,
  showBalance,
  setShowBalance,
  earnings,
  earningsLoading,
  isWithdrawModalOpen,
  setIsWithdrawModalOpen,
  withdrawPhone,
  setWithdrawPhone,
  withdrawAmount,
  setWithdrawAmount,
  withdrawAmountDisplay,
  setWithdrawAmountDisplay,
  withdrawSuccess,
  setWithdrawSuccess,
  isSubmittingWithdraw,
  handleWithdrawSubmit,
  linkedNumbers,
  setIsModalOpen,
  isHistoryModalOpen,
  setIsHistoryModalOpen,
  showBonus,
  setShowBonus,
  isBonusModalOpen,
  setIsBonusModalOpen,
  onClaimBonus,
}) => {
  // ✅ Show pointer if user has no linked WhatsApp and hasn't claimed bonus
  const shouldShowPointer = linkedNumbers.length === 0 && !showBonus;

  return (
    <div className="md:hidden relative h-full flex flex-col">
      {/* ... All your existing modals (Withdraw, History, Bonus) ... */}
      {/* I'll skip the modal code for brevity - keep all your existing modals */}

      {/* Main Content */}
      <div className="p-2 flex-1 overflow-y-auto pb-20 space-y-4 m-custom-scrollbar">
        {/* Welcome User & Logout */}
        <div className="grid grid-cols-2 p-1">
          <div>
            <p className="text-gray-400 text-sm quicksan-content">Selamat datang,</p>
            <p className="text-xl quicksand-title text-green-600">{user?.username}</p>
          </div>
          <div className="justify-items-end">
            <button
              onClick={handleLogout}
              className="text-right w-full rounded-lg text-gray-300 hover:text-green-600 transition duration-300 cursor-pointer"
            >
              Keluar
            </button>
          </div>
        </div>

        {/* 🎉 Bonus Notification Banner - After Linking */}
        {showBonus && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-center mt-2"
          >
            <button
              onClick={onClaimBonus}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-5 py-3 rounded-full shadow-lg hover:scale-105 transition-transform duration-200"
            >
              <Gift className="w-6 h-6 text-white drop-shadow-md animate-bounce" />
              <span className="font-bold">Klaim Bonus Pertama Rp5.000!</span>
            </button>
          </motion.div>
        )}

        <hr className="border-1 border-[#191e45] rounded-lg" />

        {/* Balance */}
        <p className="text-gray-300 text-sm text-right mb-1">Saldo anda :</p>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setShowBalance((prev) => !prev)}
            className="text-gray-500 hover:text-gray-700 transition"
            aria-label={showBalance ? 'Hide balance' : 'Show balance'}
          >
            {showBalance ? <EyeOff size={24} /> : <Eye size={24} />}
          </button>
          <p className="text-4xl text-right font-mono font-bold text-green-600 mb-1 select-none">
            {earningsLoading
              ? '...'
              : showBalance
              ? new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(earnings.total_earnings || 0)
              : '•••••••'}
          </p>
        </div>

        {/* Carousel Mobile */}
        <div>
          <CarouselMobile />
        </div>

        {/* Buttons Utility */}
        <div className="bg-[#272f6d] rounded-xl">
          <div className="grid grid-cols-3 bg-[#272f6d] px-4 py-1 rounded-xl items-center justify-items-center">
            <div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer rounded-ml w-[80px] h-[80px] bg-[url('../src/assets/qrscan.svg')] hover:bg-[url('../src/assets/qrscanhov.svg')] hover:bg-[#009934] hover:shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] hover:text-[#fafafa] transition duration-300"
              ></button>
            </div>
            <div>
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="cursor-pointer rounded-ml w-[80px] h-[80px] bg-[url('../src/assets/withdraw.svg')] hover:bg-[url('../src/assets/withdrawhov.svg')] hover:bg-[#009934] hover:shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] hover:text-[#fafafa] transition duration-300"
              ></button>
            </div>
            <div>
              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="cursor-pointer rounded-ml w-[80px] h-[80px] bg-[url('../src/assets/cashhistory.svg')] hover:bg-[url('../src/assets/cashhistoryhov.svg')] hover:bg-[#009934] hover:shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] hover:text-[#fafafa] transition duration-300"
              ></button>
            </div>
            <div className="text-[#009934] text-center text-sm/4 mx-4">Tautkan whatsapp</div>
            <div className="text-[#009934] text-center text-sm/4 mx-4">Tarik Penghasilan</div>
            <div className="text-[#009934] text-center text-sm/4 mx-4">Riwayat Penarikan</div>
          </div>
          <div className="grid grid-cols-3 bg-[#272f6d] px-4 py-1 rounded-xl items-center justify-items-center">
            <div>
              <button className="mt-3 cursor-pointer rounded-ml w-[80px] h-[80px] bg-[url('../src/assets/policy.svg')] hover:bg-[url('../src/assets/policyhov.svg')] hover:bg-[#009934] hover:shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] hover:text-[#fafafa] transition duration-300"></button>
            </div>
            <div>
              <button className="mt-3 cursor-pointer rounded-ml w-[80px] h-[80px] bg-[url('../src/assets/userset.svg')] hover:bg-[url('../src/assets/usersethov.svg')] hover:bg-[#009934] hover:shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] hover:text-[#fafafa] transition duration-300"></button>
            </div>
            <div>
              <button className="mt-3 cursor-pointer rounded-ml w-[80px] h-[80px] bg-[url('../src/assets/aboutus.svg')] hover:bg-[url('../src/assets/aboutushov.svg')] hover:bg-[#009934] hover:shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] hover:text-[#fafafa] transition duration-300"></button>
            </div>
            <div className="text-[#009934] text-center text-sm/4 mx-4">Perjanjian & Kebijakan</div>
            <div className="text-[#009934] text-center text-sm/4 mx-4">Setting Pengguna</div>
            <div className="text-[#009934] text-center text-sm/4 mx-4">Tentang Kami</div>
          </div>
        </div>

        {/* WhatsApp Accounts Section */}
        <div className="bg-[#191e45] rounded-xl px-4 py-4">
          <h2 className="text-xl text-center font-futuristic font-bold text-green-600 mb-3">
            Akun yang tertaut
          </h2>

          {/* ✅ Show Bonus Pointer if no WhatsApp linked yet */}
          <AnimatePresence>
            {shouldShowPointer && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mb-4"
              >
                <BonusPointer
                  show={shouldShowPointer}
                  text="Scan dan klaim bonus pertama kamu!"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <WhatsappListMobile linkedNumbers={linkedNumbers} setIsModalOpen={setIsModalOpen} />
        </div>
      </div>
    </div>
  );
};

export default MobileLayout;