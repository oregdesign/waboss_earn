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
    <div className="md:hidden relative h-full flex flex-col items-center justify-center">
            <AnimatePresence>
        {isWithdrawModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div className="bg-[#1f275a] p-6 rounded-2xl shadow-xl w-11/12 max-w-sm text-gray-200 font-futuristic">
              <h2 className="text-xl font-bold text-green-500 mb-4 text-center">
                Tarik Penghasilan
              </h2>

              {withdrawSuccess === 'success' ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <CheckCircle className="text-green-500 mb-3" size={64} />
                  <p className="text-green-400 text-lg font-semibold">Penarikan Berhasil!</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Saldo sedang dikirim ke akun DANA kamu.
                  </p>
                </div>
              ) : withdrawSuccess === 'failed' ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <XCircle className="text-red-500 mb-3" size={64} />
                  <p className="text-red-400 text-lg font-semibold">Penarikan Gagal</p>
                  <p className="text-gray-400 text-sm mt-1 text-center">
                    Saldo anda tidak cukup. <br />
                    Minimal penarikan ke DANA adalah <strong>Rp50.000</strong>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleWithdrawSubmit} className="space-y-5 text-left">
                  {/* Nomor DANA */}
                  <div>
                    <label className="block text-gray-300/20 text-sm mb-1">
                      Nomor DANA
                    </label>
                    <div className="flex items-center bg-[#272f6d] rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-green-500/50 transition duration-200">
                      <span className="px-4 text-white font-mono select-none border-r border-gray-700">
                        +62
                      </span>
                      <input
                        type="text"
                        value={withdrawPhone}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.startsWith('0')) val = val.slice(1);
                          setWithdrawPhone(val);
                        }}
                        placeholder="8123456789"
                        inputMode="numeric"
                        className="flex-1 p-3 bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Jumlah Penarikan */}
                  <div>
                    <label className="block text-gray-300/20 text-sm mb-1">
                      Jumlah Penarikan
                    </label>
                    <input
                      type="text"
                      value={withdrawAmountDisplay}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setWithdrawAmount(val);
                        setWithdrawAmountDisplay(
                          val
                            ? new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                              }).format(val)
                            : ''
                        );
                      }}
                      placeholder="Masukkan jumlah (min. Rp50.000)"
                      className="w-full p-3 bg-[#272f6d] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition duration-200 font-mono"
                      required
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsWithdrawModalOpen(false)}
                      className="flex-1 px-4 py-3 bg-gray-600/40 hover:bg-gray-600 text-gray-200 rounded-lg transition duration-300"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      // disabled={isSubmittingWithdraw}
                      className={`flex-1 px-4 py-3 rounded-lg font-semibold transition duration-300 ${
                        isSubmittingWithdraw
                          ? 'bg-green-800 cursor-not-allowed animate-pulse'
                          : 'bg-green-600 hover:bg-green-500 hover:shadow-[0_0_10px_#22c55e] text-white'
                      }`}
                    >
                      {isSubmittingWithdraw ? 'Memproses...' : 'Tarik Sekarang'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
            <AnimatePresence>
  {isHistoryModalOpen && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-[#1f275a] rounded-2xl p-3 shadow-xl w-11/12 max-w-lg text-gray-200 font-futuristic relative max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#2f367d] scrollbar-track-transparent">
        <button
          onClick={() => setIsHistoryModalOpen(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-green-500 text-center mb-4">
          Riwayat Penarikan
        </h2>

        <div className="flex flex-row gap-2 text-sm text-gray-400 border-b border-[#1a2153] pb-2 mb-2 font-semibold">
          <span className="basis-32 pl-4">Type</span>
          <span className="basis-32 pl-8">Time</span>
          <span className="basis-64 pl-9">Amount</span>
          <span className="basis-64 pl-12">Status</span>
        </div>

        <div className="bg-[#161b42] overflow-y-auto scrollbar-thin space-y-2 max-h-[30vh] rounded-lg">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
  key={i}
  className="flex flex-row gap-2 text-sm items-center py-2 px-2 rounded-lg border-[#1a2153]"
>
  <span className="text-gray-300 font-mono text-xs basis-32">
    
<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" className="fill-white w-15 h-7 text-green-500 flex-shrink-0" viewBox="0 0 756 228"><title>dana_blue</title><path className="cls-1" d="M142.26,16c5.86,1.17,11.8,1.88,17.58,3.51a98.19,98.19,0,0,1-15.77,192,14.45,14.45,0,0,0-1.81.44H124c-2.64-.43-5.28-.83-7.91-1.31-21.94-4-40.6-14.09-55.54-30.65-19.94-22.1-28.31-48.17-25-77.66,2.71-23.9,13.3-44.09,31-60.49a97.22,97.22,0,0,1,39.33-22.22c5.94-1.74,12-2.5,18.1-3.65ZM76.71,114.92c0,8.41.15,16.82-.07,25.23-.09,3.63,1.23,5.76,4.41,7.41,11.15,5.8,22.67,5.75,34.47,2.69,9.28-2.4,18.2-5.91,27.28-8.92a83.2,83.2,0,0,1,20.69-4.4,41.4,41.4,0,0,1,23.43,5.54c2.58,1.44,3.06,1.17,3.06-1.56,0-17.71,0-35.43,0-53.15a6.64,6.64,0,0,0-3.27-6.06,38.72,38.72,0,0,0-19.18-6.15c-9-.38-17.28,2.48-25.56,5.37-9,3.15-17.87,6.89-27,9.62-12.22,3.64-24,3.15-35.1-3.86-2.57-1.63-3.13-1.27-3.14,1.93C76.69,97.38,76.71,106.15,76.71,114.92Z"/><path className="cls-1" d="M635.13,134.3c0-8.77-.18-17.55,0-26.31.38-14.77,5.79-27.16,18-36.11,25.63-18.86,62.77-3.08,67,28.46a104.88,104.88,0,0,1,1,14.17c0,15.57,0,31.14-.07,46.71,0,3.51-.1,3.6-3.62,3.61-5.19,0-10.38-.07-15.57,0-2.11,0-2.85-.8-2.83-2.85.06-5.27-.06-10.56,0-15.83,0-2-.61-2.89-2.76-2.87q-18.12.1-36.24,0c-2.27,0-3,.86-2.92,3,.1,5.1,0,10.2.06,15.3,0,2.38-.71,3.37-3.23,3.3-5.19-.16-10.39-.14-15.57,0-2.43.07-3.32-.76-3.3-3.23C635.2,152.55,635.13,143.43,635.13,134.3ZM678,121.2c6,0,12,0,18,0,2.07,0,2.93-.54,3.18-2.81a68.62,68.62,0,0,0-.22-13.37,21,21,0,0,0-17.32-19A20.4,20.4,0,0,0,659.22,98c-2.91,6.55-2.7,13.57-2.23,20.57.14,2,1.06,2.73,3.07,2.7C666.05,121.14,672,121.2,678,121.2Z"/><path className="cls-1" d="M476.3,133.73c0,9.3-.06,18.61,0,27.91,0,2.43-.76,3.33-3.24,3.26-5.09-.14-10.19-.15-15.29,0-2.54.08-3.22-1-3.17-3.32.1-5.18,0-10.37,0-15.56,0-1.92-.62-2.72-2.63-2.71q-18.51.09-37,0c-2,0-2.69.8-2.66,2.71.06,5.19-.06,10.38.06,15.56.06,2.36-.63,3.4-3.18,3.32-5.27-.15-10.55-.08-15.82,0-1.72,0-2.58-.51-2.72-2.41a233,233,0,0,1-.16-24.93c.12-4.38.14-8.74,0-13.12-.34-10.72-.84-21.51,2.66-31.88,10.07-29.87,48.56-38.67,70.62-16.16C472,84.75,476,95,476.25,106.64c.2,9,0,18.06,0,27.09ZM433.61,121.2h0c6.17,0,12.35,0,18.52,0,1.56,0,2.6-.35,2.56-2.21-.11-5.09.31-10.19-.52-15.27-1.73-10.57-10.06-17.88-20.58-17.89a20.74,20.74,0,0,0-20.72,17.76c-.82,4.9-.34,9.82-.52,14.73-.09,2.25.83,3,3,2.92C421.44,121.14,427.52,121.2,433.61,121.2Z"/><path className="cls-1" d="M268.48,114.27q0-23.2,0-46.42c0-3.91.13-4,4.09-4,11.81,0,23.61-.2,35.42,0,9.85.19,18.44,4.33,26.09,10.15A50.91,50.91,0,0,1,342,147.24c-7.69,9.25-17.73,14.84-29.52,17.22a19.46,19.46,0,0,1-3.73.34q-18.39,0-36.76,0c-3.24,0-3.51-.28-3.52-3.53Q268.48,137.76,268.48,114.27ZM290,114.1q0,12.87,0,25.74c0,1.22-.24,2.7,1.63,2.82,7.05.44,14.16.88,21-1.1,12.9-3.74,21.4-17.63,19.43-31.24-2.05-14.12-13.3-24.25-27.21-24.46-3.93-.06-7.87.08-11.8,0-2.3-.07-3.15.71-3.11,3.08C290.11,97.29,290,105.7,290,114.1Z"/><path className="cls-1" d="M577.09,135c0-8.68,0-17.36,0-26,0-7.54-2.37-14.13-8.61-18.77-6.57-4.89-13.83-5.9-21.26-2.37s-12,9.47-12.41,18c-.77,14.84-.66,29.68-.13,44.52a79.34,79.34,0,0,1-.3,12.33c-.17,1.45-.78,2.09-2.19,2.09-5.55,0-11.1,0-16.65,0-2,0-2.23-1.11-2.38-2.75a152.21,152.21,0,0,1-.29-20.92c.53-11.45.52-22.9.35-34.34-.34-22.05,18-43.93,44.31-43,20.81.76,36.78,16.09,40.54,35.87a19.27,19.27,0,0,1,.15,3.49c0,12.61-.13,25.23.1,37.85.13,6.79.22,13.59.35,20.38.05,2.5-.68,3.55-3.34,3.46-5-.17-10-.16-15,0-2.54.07-3.23-.95-3.2-3.32.09-8.86,0-17.72,0-26.58Z"/></svg>
    
  </span>
  <span className="text-gray-400 text-xs basis-64 pl-3">
    07-08-25
  </span>
  <span className="text-green-400 font-consolas font-bold basis-64 pr-6">
    {new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(50000 + i * 10000)}
  </span>
  {/* ✅ Status column with fixed spacing */}
  <span className="text-green-400 font-semibold flex items-center justify-start basis-64 gap-2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 text-green-500 flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
    <span>Sukses</span>
  </span>
</div>

          ))}
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
      {/* Main Content */}
      <div className="p-2 flex-1 overflow-y-auto pb-20 space-y-4 m-custom-scrollbar pr-4">
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

        {/* Buttons Utility */}
        <div className="rounded-xl">
          <div className="grid grid-cols-3 px-4 py-1 rounded-xl items-center justify-items-center">
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
          <div className="grid grid-cols-3 px-4 py-1 rounded-xl items-center justify-items-center">
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
          <button onClick={() => setIsModalOpen(true)}>
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
          </button>
          <WhatsappListMobile linkedNumbers={linkedNumbers} setIsModalOpen={setIsModalOpen} />
        </div>
      </div>
    </div>
  );
};

export default MobileLayout;