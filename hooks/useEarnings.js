import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const useEarnings = (linkedNumbers) => {
  const [earnings, setEarnings] = useState({ total_earnings: 0, total_sent: 0 });
  const [earningsLoading, setEarningsLoading] = useState(true);

  const fetchEarnings = async () => {
    try {
      setEarningsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token for fetching earnings");
        setEarnings({ total_earnings: 0, total_sent: 0, linked_phones_count: 0, phone_details: [] });
        return;
      }

      const response = await axios.get(`${API_URL}/get-earnings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("get-earnings response:", response.data);

      const total_sent = Number(response.data?.total_sent || 0);
      const total_earnings = Number(response.data?.total_earnings ?? total_sent * 30);
      const linked_phones_count = Number(response.data?.linked_phones_count || 0);

      setEarnings({
        total_earnings,
        total_sent,
        linked_phones_count,
        phone_details: response.data?.phone_details || [],
        last_updated: response.data?.last_updated || null
      });
    } catch (error) {
      console.error("Fetch earnings error:", error.response?.data || error.message);
      setEarnings({
        total_earnings: 0,
        total_sent: 0,
        linked_phones_count: 0,
        phone_details: []
      });
    } finally {
      setEarningsLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  useEffect(() => {
    if (linkedNumbers.length > 0) {
      const timeoutId = setTimeout(fetchEarnings, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [linkedNumbers]);

  return { earnings, earningsLoading, fetchEarnings };
};