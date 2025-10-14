// Dashboard.jsx
import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import { useWhatsAppLinking } from '../../hooks/useWhatsAppLinking';
import { useEarnings } from '../../hooks/useEarnings'; // Adjust path as needed
import DesktopLayout from '../components/dashboard/DesktopLayout';
import MobileLayout from '../components/dashboard/MobileLayout';
import LinkWhatsAppModal from '../components/dashboard/LinkWhatsAppModal';
import { Clock, CheckCircle } from "lucide-react";



const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const linking = useWhatsAppLinking();
  const { earnings, earningsLoading } = useEarnings(linking.linkedNumbers);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showBalance, setShowBalance] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAmountDisplay, setWithdrawAmountDisplay] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  
  
  

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    setIsSubmittingWithdraw(true);

    // Convert amount to number
    const amountValue = parseInt(withdrawAmount, 10) || 0;

    setTimeout(() => {
      setIsSubmittingWithdraw(false);

      if (amountValue < 50000) {
        // Mock failed withdrawal
        setWithdrawSuccess('failed');
      } else {
        // Mock success withdrawal (optional)
        setWithdrawSuccess('success');
      }

      // Auto close after a few seconds
      setTimeout(() => {
        setWithdrawSuccess(false);
        setWithdrawPhone('');
        setWithdrawAmount('');
        setWithdrawAmountDisplay('');
        setIsWithdrawModalOpen(false);
      }, 2500);
    }, 1500);
  };

  return (
    <div className="w-screen h-screen p-4 bg-[#272f6d]">
      <LinkWhatsAppModal {...linking} />
      <DesktopLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        handleLogout={handleLogout}
        earnings={earnings}
        earningsLoading={earningsLoading}
        linkedNumbers={linking.linkedNumbers}
        setIsModalOpen={linking.setIsModalOpen}
      />
      <MobileLayout
        user={user}
        handleLogout={handleLogout}
        showBalance={showBalance}
        setShowBalance={setShowBalance}
        earnings={earnings}
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
        linkedNumbers={linking.linkedNumbers}
        setIsModalOpen={linking.setIsModalOpen}
        isHistoryModalOpen={isHistoryModalOpen}
        setIsHistoryModalOpen={setIsHistoryModalOpen}
      />
      <LinkWhatsAppModal
  isModalOpen={linking.isModalOpen}
  setIsModalOpen={linking.setIsModalOpen}
  qrImage={linking.qrImage}
  status={linking.status}
  linkedNumber={linking.linkedNumber}
  timer={linking.timer}
  handleGenerateQr={linking.handleGenerateQr}
/>
    </div>
  );
};

export default Dashboard;