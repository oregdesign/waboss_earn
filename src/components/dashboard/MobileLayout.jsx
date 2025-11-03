// src/components/dashboard/MobileLayout.jsx - Add BonusPointer
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle, XCircle, Gift } from 'lucide-react';
import { LogOut } from "lucide-react";
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
              <h1 className="text-xl font-bold text-green-500 mb-4 text-center">
                Tarik Penghasilan
              </h1>

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
                      placeholder="Masukkan jumlah"
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

        <h1 className="text-xl font-bold text-green-500 text-center mb-4">
          Riwayat Penarikan
        </h1>

        <div className="flex flex-row gap-2 text-sm text-gray-400 border-b border-[#1a2153] pb-2 mb-2 font-semibold">
          <span className="basis-32 pl-4">Type</span>
          <span className="basis-32 pl-8">Time</span>
          <span className="basis-64 pl-9">Amount</span>
          <span className="basis-64 pl-12">Status</span>
        </div>

        <div className="bg-[#161b42] overflow-y-auto scrollbar-thin space-y-2 max-h-[30vh] rounded-lg h-64 items-center justify-center ">
          <p className="text-lg font-mono text-gray-300/50 text-center mt-24">Belum ada transaksi</p>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
      {/* Main Content */}
      <div className="p-2 flex-1 overflow-y-auto pb-20 space-y-4 m-custom-scrollbar pr-4">
        {/* Welcome User & Logout */}
        <div className="grid grid-cols-2 bg-[#191e45] p-3 rounded-lg ">
          <div>
            <p className="text-gray-400 text-sm quicksand-content">Selamat datang,</p>
            <p className="text-xl quicksand-title text-green-600">{user?.username}</p>
          </div>
          <div className="justify-items-end">
            <button
              onClick={handleLogout}
              className=" bg-amber-200 w-full rounded-lg text-gray-400 hover:text-green-600 transition duration-300 cursor-pointer text-sm quicksand-content"
            >
              <LogOut className="w-5 h-5 absolute inset-y-5 right-8" />
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