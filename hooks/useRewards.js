// hooks/useRewards.js
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useRewards = (linkedNumbers) => {
  const [showBonus, setShowBonus] = useState(false);
  const [bonusEligible, setBonusEligible] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(5000);
  const [totalBalance, setTotalBalance] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [rewardHistory, setRewardHistory] = useState([]);
  const [isCheckingBonus, setIsCheckingBonus] = useState(false);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Check if user is eligible for first link bonus
  const checkFirstLinkBonus = async () => {
    try {
      setIsCheckingBonus(true);
      const token = getToken();
      if (!token) return;

      const res = await axios.get(`${API_URL}/check-first-link-bonus`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { eligible, alreadyClaimed, hasLinkedAccount, currentBonus } = res.data;

      setBonusEligible(eligible);
      setBonusBalance(currentBonus);

      // Show bonus notification if eligible and has linked account
      if (eligible && hasLinkedAccount && !alreadyClaimed) {
        setShowBonus(true);
      }
    } catch (error) {
      console.error("Check first link bonus error:", error.message);
    } finally {
      setIsCheckingBonus(false);
    }
  };

  // Claim the first link bonus
  const claimFirstLinkBonus = async () => {
    try {
      const token = getToken();
      if (!token) return { success: false, message: "No token found" };

      const res = await axios.post(
        `${API_URL}/claim-first-link-bonus`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setBonusBalance(res.data.newBalance);
        setShowBonus(false);
        setBonusEligible(false);
        await fetchTotalBalance();
        await fetchRewardHistory();
        return { success: true, amount: res.data.amount };
      }

      return { success: false, message: "Failed to claim bonus" };
    } catch (error) {
      console.error("Claim bonus error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to claim bonus",
      };
    }
  };

  // Fetch total balance (earnings + bonus)
  const fetchTotalBalance = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await axios.get(`${API_URL}/get-total-balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTotalBalance(res.data.totalBalance);
      setBonusBalance(res.data.bonusBalance);
    } catch (error) {
      console.error("Fetch total balance error:", error.message);
    }
  };

  // Fetch reward history
  const fetchRewardHistory = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await axios.get(`${API_URL}/get-reward-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRewardHistory(res.data);
    } catch (error) {
      console.error("Fetch reward history error:", error.message);
    }
  };

  // Check bonus when user links a new WhatsApp account
  useEffect(() => {
    if (linkedNumbers.length > 0) {
      checkFirstLinkBonus();
      fetchTotalBalance();
    }
  }, [linkedNumbers.length]);

  // Initial load
  useEffect(() => {
    fetchTotalBalance();
    fetchRewardHistory();
  }, []);

  return {
    showBonus,
    setShowBonus,
    bonusEligible,
    bonusAmount,
    totalBalance,
    bonusBalance,
    rewardHistory,
    isCheckingBonus,
    claimFirstLinkBonus,
    checkFirstLinkBonus,
    fetchTotalBalance,
    fetchRewardHistory,
  };
};