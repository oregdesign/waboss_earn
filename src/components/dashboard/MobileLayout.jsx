// src/components/dashboard/MobileLayout.jsx - Updated bonus section
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle, XCircle, Gift } from 'lucide-react';
import CarouselMobile from '../CarouselMobile';
import WhatsappListMobile from '../WhatsappListMobile';
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
  onClaimBonus, // New prop for claiming bonus
}) => {
  return (
    <div className="md:hidden relative h-full flex flex-col">
      {/* Withdraw Modal */}
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

                  <div>
                    <label className="block text-gray-300 text-sm mb-1">
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
                      className="w-full p-3 bg-[#272f6d] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition duration-200 font-mono"
                      required
                    />
                  </div>

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

      {/* History Modal */}
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
                  <div key={i} className="flex flex-row gap-2 text-sm items-center py-2 px-2 rounded-lg border-[#1a2153]">
                    <span className="text-gray-300 font-mono text-xs basis-32">
                      <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" className="fill-white w-15 h-7 text-green-500 flex-shrink-0" viewBox="0 0 756 228"><title>dana_blue</title><path d="M142.26,16c5.86,1.17,11.8,1.88,17.58,3.51a98.19,98.19,0,0,1-15.77,192,14.45,14.45,0,0,0-1.81.44H124c-2.64-.43-5.28-.83-7.91-1.31-21.94-4-40.6-14.09-55.54-30.65-19.94-22.1-28.31-48.17-25-77.66,2.71-23.9,13.3-44.09,31-60.49a97.22,97.22,0,0,1,39.33-22.22c5.94-1.74,12-2.5,18.1-3.65ZM76.71,114.92c0,8.41.15,16.82-.07,25.23-.09,3.63,1.23,5.76,4.41,7.41,11.15,5.8,22.67,5.75,34.47,2.69,9.28-2.4,18.2-5.91,27.28-8.92a83.2,83.2,0,0,1,20.69-4.4,41.4,41.4,0,0,1,23.43,5.54c2.58,1.44,3.06,1.17,3.06-1.56,0-17.71,0-35.43,0-53.15a6.64,6.64,0,0,0-3.27-6.06,38.72,38.72,0,0,0-19.18-6.15c-9-.38-17.28,2.48-25.56,5.37-9,3.15-17.87,6.89-27,9.62-12.22,3.64-24,3.15-35.1-3.86-2.57-1.63-3.13-1.27-3.14,1.93C76.69,97.38,76.71,106.15,76.71,114.92Z"/></svg>
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

      {/* 🎁 Bonus Success Modal */}
      <AnimatePresence>
        {isBonusModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <div className="bg-[#1f275a] p-6 rounded-2xl shadow-2xl text-center relative overflow-hidden">
              <Lottie animationData={bonusAnimation} loop={false} className="w-48 h-48 mx-auto" />
              <h2 className="text-2xl font-bold text-green-400 mt-4">Bonus berhasil diklaim!</h2>
              <p className="text-gray-300 mt-2">
                Kamu mendapat <span className="text-yellow-400 font-bold">Rp5.000</span>
              </p>
              <button
                onClick={() => setIsBonusModalOpen(false)}
                className="mt-5 px-5 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg shadow-md transition"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

        {/* 🎉 Bonus Notification Banner */}
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
        <div className="rounded-xl">
          <div className="grid grid-cols-3 px-4 py-1 rounded-xl items-center justify-items-center">
            <div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer rounded-ml w-[80px] h-[80px] bg-[url('../src/assets/qrscan.svg')] hover:bg-[url('../src/assets/qrscanhov.svg')] hover:bg-[#009934] hover:shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] hover:text-[#fafafa] transition duration-300 ease-in-out active:scale-95"
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

        {/* WhatsApp Accounts */}
        <div className="bg-[#191e45] rounded-xl px-4 py-1">
          <h2 className="text-xl text-center font-futuristic font-bold text-green-600 mb-1">
            Akun yang tertaut
          </h2>
          <WhatsappListMobile linkedNumbers={linkedNumbers} setIsModalOpen={setIsModalOpen} />
        </div>
      </div>
    </div>
  );
};

export default MobileLayout;