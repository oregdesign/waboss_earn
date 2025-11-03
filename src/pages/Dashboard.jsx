// src/pages/Dashboard.jsx - Add pointer logic
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { useWhatsAppLinking } from "../../hooks/useWhatsAppLinking";
import { useEarnings } from "../../hooks/useEarnings";
import { useRewards } from "../../hooks/useRewards";
import LinkWhatsAppModal from "../components/dashboard/LinkWhatsAppModal";
import MobileLayout from "../components/dashboard/MobileLayout";
import DesktopLayout from "../components/dashboard/DesktopLayout";
import ReferralDashboard from '../components/ReferralDashboard';

function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [showBalance, setShowBalance] = useState(true);

  // Withdraw modal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAmountDisplay, setWithdrawAmountDisplay] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(null);
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  // History modal state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Bonus modal state
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);

  // WhatsApp linking hook
  const {
    isModalOpen,
    setIsModalOpen,
    qrImage,
    status,
    linkedNumbers,
    linkedNumber,
    timer,
    sid,
    handleGenerateQr,
    fetchLinkedNumbers,
  } = useWhatsAppLinking();

  // Earnings hook
  const { earnings, earningsLoading, fetchEarnings } = useEarnings(linkedNumbers);

  // Rewards hook
  const {
    showBonus,
    setShowBonus,
    bonusEligible,
    bonusAmount,
    totalBalance,
    bonusBalance,
    claimFirstLinkBonus,
    checkFirstLinkBonus,
    fetchTotalBalance,
  } = useRewards(linkedNumbers);

  // ✅ Show pointer if: no linked numbers AND hasn't claimed bonus
  const showBonusPointer = linkedNumbers.length === 0 && !bonusEligible;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Check for bonus eligibility when successfully linking WhatsApp
  useEffect(() => {
    if (status === "success" && linkedNumber) {
      setTimeout(() => {
        checkFirstLinkBonus();
      }, 2000);
    }
  }, [status, linkedNumber]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingWithdraw(true);

    const numericAmount = parseInt(withdrawAmount);
    const userTotalBalance = (earnings.total_earnings || 0) + bonusBalance;

    if (numericAmount < 50000) {
      setWithdrawSuccess("failed");
      setIsSubmittingWithdraw(false);
      setTimeout(() => {
        setWithdrawSuccess(null);
        setIsWithdrawModalOpen(false);
      }, 3000);
      return;
    }

    if (numericAmount > userTotalBalance) {
      setWithdrawSuccess("failed");
      setIsSubmittingWithdraw(false);
      setTimeout(() => {
        setWithdrawSuccess(null);
        setIsWithdrawModalOpen(false);
      }, 3000);
      return;
    }

    setTimeout(() => {
      setIsSubmittingWithdraw(false);
      setWithdrawSuccess("success");

      setTimeout(() => {
        setWithdrawSuccess(null);
        setWithdrawPhone("");
        setWithdrawAmount("");
        setWithdrawAmountDisplay("");
        setIsWithdrawModalOpen(false);
      }, 2000);
    }, 1500);
  };

  const handleClaimBonus = async () => {
    const result = await claimFirstLinkBonus();
    if (result.success) {
      setIsBonusModalOpen(true);
      setShowBonus(false);
      // Refresh earnings and balance
      await fetchEarnings();
      await fetchTotalBalance();
    } else {
      alert(result.message || "Gagal mengklaim bonus");
    }
  };

  if (!user) return null;

  // Calculate total balance including bonus
  const displayBalance = (earnings.total_earnings || 0) + bonusBalance;

  return (
    <div className="min-h-screen w-screen bg-gradient-to-bl from-green-900 to-indigo-800 p-4 overflow-hidden">
      <LinkWhatsAppModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        qrImage={qrImage}
        status={status}
        linkedNumber={linkedNumber}
        timer={timer}
        handleGenerateQr={handleGenerateQr}
      />

      <MobileLayout
        user={user}
        handleLogout={handleLogout}
        showBalance={showBalance}
        setShowBalance={setShowBalance}
        earnings={{ ...earnings, total_earnings: displayBalance }}
        earningsLoading={earningsLoading}
        isWithdrawModalOpen={isWithdrawModalOpen}
        setIsWithdrawModalOpen={setIsWithdrawModalOpen}
        withdrawPhone={withdrawPhone}
        setWithdrawPhone={setWithdrawPhone}
        withdrawAmount={withdrawAmount}
        setWithdrawAmount={setWithdrawAmount}
        withdrawAmountDisplay={withdrawAmountDisplay}
        setWithdrawAmountDisplay={setWithdrawAmountDisplay}
        withdrawSuccess={withdrawSuccess}
        setWithdrawSuccess={setWithdrawSuccess}
        isSubmittingWithdraw={isSubmittingWithdraw}
        handleWithdrawSubmit={handleWithdrawSubmit}
        linkedNumbers={linkedNumbers}
        setIsModalOpen={setIsModalOpen}
        isHistoryModalOpen={isHistoryModalOpen}
        setIsHistoryModalOpen={setIsHistoryModalOpen}
        showBonus={showBonus && bonusEligible}
        setShowBonus={setShowBonus}
        isBonusModalOpen={isBonusModalOpen}
        setIsBonusModalOpen={setIsBonusModalOpen}
        onClaimBonus={handleClaimBonus}
      />

      <DesktopLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        handleLogout={handleLogout}
        earnings={{ ...earnings, total_earnings: displayBalance }}
        earningsLoading={earningsLoading}
        linkedNumbers={linkedNumbers}
        setIsModalOpen={setIsModalOpen}
        showBonus={showBonus && bonusEligible}
        showBonusPointer={showBonusPointer} // ✅ Pass to desktop
        bonusBalance={bonusBalance}
        onClaimBonus={handleClaimBonus}
      />
      <ReferralDashboard />
    </div>
  );
}

export default Dashboard;