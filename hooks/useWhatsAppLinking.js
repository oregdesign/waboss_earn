import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useWhatsAppLinking = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const [status, setStatus] = useState("idle");
  const [linkedNumbers, setLinkedNumbers] = useState([]);
  const [timer, setTimer] = useState(0);
  const [linkedNumber, setLinkedNumber] = useState("");
  const [sid, setSid] = useState("7");
  const [waToken, setWaToken] = useState("");

  const pollRef = useRef(null);
  const countdownRef = useRef(null);

  const getToken = () => {
    let token = localStorage.getItem("token");
    if (!token) {
      try {
        const authData = JSON.parse(localStorage.getItem("auth")) || {};
        token = authData?.token;
      } catch (e) {}
    }
    return token;
  };

  const fetchLinkedNumbers = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await axios.get(`${API_URL}/get-linked-accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const linked = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];
      setLinkedNumbers(linked);
    } catch (err) {
      console.error("Fetch linked numbers error:", err.message);
    }
  };

  useEffect(() => {
    fetchLinkedNumbers();
  }, []);

  // 🧩 Cleanup function: stops polling and resets UI
  const cleanupProcess = async (clearDB = false) => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setTimer(0);
    setQrImage(null);
    setLinkedNumber("");
    setStatus("idle");
    if (clearDB && waToken) {
      try {
        const token = getToken();
        await axios.post(
          `${API_URL}/clear-temp-link`,
          { waToken },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("🧹 Temp WhatsApp link cleared.");
      } catch (err) {
        console.error("Error clearing temp link:", err.message);
      }
    }
  };

  const handleGenerateQr = async () => {
    try {
      await cleanupProcess(true);
      setStatus("loading");
      const token = getToken();
      if (!token) return;

      const sidOptions = ["1", "7", "8"];
      const chosenSid = sidOptions[Math.floor(Math.random() * sidOptions.length)];
      setSid(chosenSid);

      console.log(`Auto selecting SID ${chosenSid}`);

      const res = await axios.post(
        `${API_URL}/link-whatsapp`,
        { sid: chosenSid },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { qrimagelink, infolink, waToken } = res.data.data || {};
      setQrImage(qrimagelink);
      setWaToken(waToken);

      if (!infolink) throw new Error("Missing infolink");

      // Timer setup
      let timeLeft = 60;
      setTimer(timeLeft);
      countdownRef.current = setInterval(() => {
        timeLeft -= 1;
        setTimer(timeLeft);
        if (timeLeft <= 0) cleanupProcess(true);
      }, 1000);

      // Start polling for info
      pollRef.current = setInterval(async () => {
        try {
          const infoRes = await axios.get(infolink);
          const data = infoRes.data?.data;

          if (data?.wid && data?.unique) {
            const extractedNumber = "+" + data.wid.split(":")[0];
            clearInterval(pollRef.current);
            clearInterval(countdownRef.current);
            setLinkedNumber(extractedNumber);
            setStatus("success");

            const confirmRes = await axios.post(
              `${API_URL}/whatsapp/confirm`,
              {
                waNumber: extractedNumber,
                uniqueId: data.unique,
                sid: chosenSid,
                waToken,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("✅ Confirmed link:", confirmRes.data.message);
            await fetchLinkedNumbers();
          }
        } catch (err) {
          if (err.response?.status === 401) {
            console.warn("⚠️ Unauthorized attempt detected — stopping polling.");
            cleanupProcess(true);
          }
        }
      }, 3000);
    } catch (err) {
      console.error("QR generation error:", err.message);
      setStatus("error");
    }
  };

  // 🔐 When modal closes, stop everything and clear temp
  useEffect(() => {
    if (!isModalOpen) cleanupProcess(true);
  }, [isModalOpen]);

  return {
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
  };
};
