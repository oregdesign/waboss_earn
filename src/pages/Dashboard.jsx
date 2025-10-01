import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import useAuthStore from "../store/useAuthStore";
import { FaCheckCircle, FaTimes, FaUser, FaCreditCard, FaCog, FaComments, FaTachometerAlt, FaWhatsapp, FaLink } from "react-icons/fa";
import Carousel from "../components/Carousel";
import CarouselMobile from "../components/CarouselMobile";
import Faq from "../components/Faq";
import WhatsappListMobile from "../components/WhatsappListMobile.jsx";

function Dashboard() {
  const { user, logout } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onBlur",
  });
  const [initialStatus, setInitialStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const [infolink, setInfolink] = useState(null);
  const [waToken, setWaToken] = useState(null);
  const [status, setStatus] = useState("input");
  const [servers, setServers] = useState([]);
  const [phone, setPhone] = useState(null);
  const [selectedSid, setSelectedSid] = useState(null);
  const [qrTimer, setQrTimer] = useState(15);
  const [linkedNumbers, setLinkedNumbers] = useState([]);
  const [showReconnectPrompt, setShowReconnectPrompt] = useState(false);
  const [isRelinking, setIsRelinking] = useState(false);
  const [earnings, setEarnings] = useState({
    total_earnings: 0,
    total_sent: 0,
  });
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");

const fetchServers = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "http://localhost:5000/api/get-whatsapp-servers",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const availableServers = response.data.servers;
    setServers(availableServers);

    if (availableServers.length > 0) {
      // Pick a random server
      const randomIndex = Math.floor(Math.random() * availableServers.length);
      const chosenServer = availableServers[randomIndex];
      setSelectedSid(chosenServer.id);

      // Debug log
      console.log(
        `[WhatsApp Linking] Assigned server: ${chosenServer.name} (ID: ${chosenServer.id}, connected: ${chosenServer.connected})`
      );
    } else {
      // No servers available
      setApiError("All servers are full. Please try again later.");
    }
  } catch (error) {
    console.error("Fetch servers error:", error.response?.data);
    setApiError(error.response?.data?.message || "Failed to fetch servers.");
  }
};

  const fetchLinkedNumbers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found in localStorage");
        return setLinkedNumbers([]);
      }
      const response = await axios.get("http://localhost:5000/api/get-linked-accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("get-linked-accounts response:", response.data);

      const accounts = Array.isArray(response.data)
        ? response.data
        : response.data.linkedAccounts || response.data.data || [];

      setLinkedNumbers(accounts);
    } catch (error) {
      console.error("Fetch linked numbers error:", error.response?.data || error.message);
      setLinkedNumbers([]);
    }
  };

  const fetchEarnings = async () => {
    try {
      setEarningsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token for fetching earnings");
        setEarnings({ total_earnings: 0, total_sent: 0, linked_phones_count: 0, phone_details: [] });
        return;
      }

      const response = await axios.get("http://localhost:5000/api/get-earnings", {
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
    if (isModalOpen) {
      fetchServers();
    }
    fetchLinkedNumbers();
    fetchEarnings();
  }, [isModalOpen]);

  useEffect(() => {
    if (linkedNumbers.length > 0) {
      const timeoutId = setTimeout(() => {
        fetchEarnings();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [linkedNumbers]);

  const generateQrCode = async (sid, phone, isRelink = false, unique_id = null) => {
  setIsLoading(true);
  setApiError(null);
  setQrImage(null);
  setQrTimer(15);
  setIsRelinking(isRelink);
  setInitialStatus(null); // Reset initial status
  
  try {
    const token = localStorage.getItem("token");
    
    // If relinking, get the current status first
    if (isRelink) {
      const statusResponse = await axios.post(
        "http://localhost:5000/api/check-whatsapp-account",
        { phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInitialStatus(statusResponse.data.status); // Store initial status
      console.log("Initial status before relink:", statusResponse.data.status);
    }
    
    const endpoint = isRelink ? "/relink-whatsapp" : "/link-whatsapp";
    const payload = isRelink 
      ? { phone, unique_id, sid }
      : { sid, phone };
      
    const linkResponse = await axios.post(
      `http://localhost:5000/api${endpoint}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    setQrImage(linkResponse.data.data.qrimagelink);
    setInfolink(linkResponse.data.data.infolink);
    setWaToken(linkResponse.data.data.waToken);
    setStatus("qr");
  } catch (error) {
    console.error(`${isRelink ? "Relink" : "Link"} QR code error:`, error.response?.data);
    setApiError(
      error.response?.data?.message ||
      `Failed to generate ${isRelink ? "relink" : "link"} QR code.`
    );
    setStatus("input");
  } finally {
    setIsLoading(false);
  }
};

  const onSubmit = async (data) => {
    setPhone(data.phone);
    setSelectedSid(data.sid);
    setIsLoading(true);
    setApiError(null);
    try {
      const token = localStorage.getItem("token");
      const checkResponse = await axios.post(
        "http://localhost:5000/api/check-whatsapp-account",
        { phone: data.phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (checkResponse.data.isLinked) {
        if (checkResponse.data.status === "disconnected") {
          setShowReconnectPrompt(true);
        } else {
          setApiError("This phone number is already linked and connected.");
        }
        setIsLoading(false);
        return;
      }
      await generateQrCode(data.sid, data.phone);
      reset();
    } catch (error) {
      console.error("Check WhatsApp error:", error.response?.data);
      setApiError(
        error.response?.data?.message || "Failed to check phone number."
      );
      setIsLoading(false);
    }
  };

  const handleReconnect = async (reconnect) => {
  setShowReconnectPrompt(false);
  if (reconnect) {
    // First, get the unique_id from the database
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/check-whatsapp-account",
        { phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.isLinked && response.data.unique_id) {
        // Now call relink with the unique_id
        await generateQrCode(selectedSid, phone, true, response.data.unique_id);
      } else {
        setApiError("Could not find unique_id for this phone number");
        setStatus("input");
      }
    } catch (error) {
      console.error("Error fetching account info:", error);
      setApiError("Failed to fetch account information");
      setStatus("input");
    }
  } else {
    setStatus("input");
    setApiError(null);
    reset();
  }
};

  const handleRetry = async () => {
    setApiError(null);
    await generateQrCode(isRelinking ? null : selectedSid, phone, isRelinking);
  };

  useEffect(() => {
    if (status === "qr" && qrTimer > 0) {
      const timer = setInterval(() => {
        setQrTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (status === "qr" && qrTimer === 0) {
      setStatus("waiting");
    }
  }, [status, qrTimer]);

  useEffect(() => {
  if (status === "waiting" && phone) {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "http://localhost:5000/api/check-whatsapp-account",
          { phone },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log("Current status:", response.data.status);
        console.log("Is relinking:", isRelinking);
        console.log("Initial status:", initialStatus);
        
        if (response.data.isLinked) {
          const currentStatus = response.data.status;
          
          // For relinking: only success if status changed from disconnected to connected
          if (isRelinking) {
            if (initialStatus === "disconnected" && currentStatus === "connected") {
              console.log("✅ Relink successful - status changed to connected");
              await saveLinkedAccount(phone, response.data.unique_id, currentStatus);
              setStatus("success");
              await fetchLinkedNumbers();
            } else if (currentStatus === "disconnected") {
              // Still disconnected, keep waiting
              console.log("⏳ Still waiting for scan... status is still disconnected");
              // Will retry after timeout
            } else if (currentStatus === "connected" && initialStatus === "connected") {
              // Was already connected, something is wrong
              console.log("⚠️ Account was already connected");
              setStatus("failed");
              setApiError("Account is already connected. No need to relink.");
            }
          } else {
            // For new linking: just check if connected
            if (currentStatus === "connected") {
              console.log("✅ New link successful");
              await saveLinkedAccount(phone, response.data.unique_id, currentStatus);
              setStatus("success");
              await fetchLinkedNumbers();
            } else {
              console.log("⏳ Still waiting for scan...");
            }
          }
        } else {
          console.log("Account not found yet in MaxyPrime, will retry...");
        }
      } catch (error) {
        console.error("Poll account error:", error);
        setStatus("failed");
        setApiError(
          `Failed to link WhatsApp: ${
            error.response?.data?.message || error.message
          }. Please try again or contact support.`
        );
      }
    };
    
    const timeout = setTimeout(checkStatus, 5000); // Check every 5 seconds
    return () => clearTimeout(timeout);
  }
}, [status, phone, isRelinking, initialStatus, linkedNumbers]);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const saveLinkedAccount = async (phone, unique_id, status) => {
  try {
    const token = localStorage.getItem("token");
    await axios.post(
      "http://localhost:5000/api/save-linked-account",
      { phone, unique_id, status, sid: selectedSid },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("Account saved to database successfully");
  } catch (saveError) {
    console.error("Failed to save account:", saveError);
  }
};

  useEffect(() => {
  console.log("isModalOpen changed:", isModalOpen);
}, [isModalOpen]);

  const closeModal = () => {
    setIsModalOpen(false);
    setStatus("input");
    setApiError(null);
    setQrImage(null);
    setInfolink(null);
    setWaToken(null);
    setPhone(null);
    setSelectedSid(null);
    setQrTimer(15);
    setShowReconnectPrompt(false);
    setIsRelinking(false);
    reset();
  };

  const sidebarItems = [
    { name: "Dashboard", icon: FaTachometerAlt },
    { name: "Profile", icon: FaUser },
    { name: "Payment", icon: FaCreditCard },
    { name: "Setting", icon: FaCog },
    { name: "Chats", icon: FaComments },
  ];

  return (
<div className="w-screen h-screen p-4 bg-[#272f6d]">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] px-4">
          <div className="bg-[#191e45] rounded-2xl shadow-2xl w-full max-w-md relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800"
            >
              <FaTimes size={16} />
            </button>

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaWhatsapp className="text-black text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Tautkan Whatsapp
                </h2>
                <p className="text-gray-400 mt-2">
                  Tautkan nomor whatsapp bisnis anda untuk mendapatkan penghasilan
                </p>
              </div>

              {apiError && !showReconnectPrompt && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
                  {apiError}
                </div>
              )}

              {status === "input" && !showReconnectPrompt && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nomor WA Bisnis
                    </label>
                    <input
                      {...register("phone", {
                        required: "Nomor WA harus di isi",
                        pattern: {
                          value: /^\+\d{10,15}$/,
                          message:
                            "Nomor harus di mulai dengan tanda + dan terdiri dari 10-15 digit",
                        },
                      })}
                      placeholder="contoh., +628123456789"
                      className={`w-full p-4 bg-[#272f6d] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition duration-200 ${
                        errors.phone
                          ? "border-red-500/50 focus:ring-red-500/50"
                          : "border-gray-700 focus:ring-green-500/50 focus:border-green-500/50"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-sm mt-2">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Server
                    </label>
                    <select
  {...register("sid", { required: "Silahkan pilih server, bebas." })}
  className={`w-full p-4 bg-[#272f6d] rounded-xl text-white`}
>
  <option value="">Pilih Server</option>
  {Array.isArray(servers) && servers.length > 0 ? (
    servers.map((server) => (
      <option key={server.id} value={server.id}>
        {server.name}
      </option>
    ))
  ) : (
    <option disabled>No servers available</option>
  )}
</select>

                    {errors.sid && (
                      <p className="text-red-400 text-sm mt-2">
                        {errors.sid.message}
                      </p>
                    )}
                    {servers.length === 0 && (
                      <p className="text-red-400 text-sm mt-2">
                        Server sementara penuh, silahkan pilih yang lain.
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="cursor-pointer flex-1 bg-red-600 hover:bg-red-400 text-gray-300 font-medium py-3 px-4 rounded-xl transition duration-200"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || servers.length === 0}
                      className={`flex-1 font-semibold py-3 px-4 rounded-xl transition duration-200 ${
                        isLoading || servers.length === 0
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "cursor-pointer bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                      }`}
                    >
                      {isLoading ? "Processing..." : "Submit"}
                    </button>
                  </div>
                </form>
              )}

              {showReconnectPrompt && (
                <div className="text-center space-y-6">
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <p className="text-gray-300">
                      Nomor ini sudah tertaut, tetapi sedang terputus. Apakah
                      anda ingin mengkoneksikan kembali no ini?
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleReconnect(true)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-semibold py-3 px-4 rounded-xl transition duration-200"
                    >
                      Iya, Rekoneksi
                    </button>
                    <button
                      onClick={() => handleReconnect(false)}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 px-4 rounded-xl transition duration-200 border border-gray-700"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {status === "qr" && qrImage && (
                <div className="text-center space-y-6">
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <p className="text-gray-300 mb-4">
                      Scan Kode QR berikut dengan aplikasi Whatsapp
                    </p>
                    <div className="bg-white rounded-xl p-4 inline-block">
                      <img
                        src={qrImage}
                        alt="WhatsApp QR Code"
                        className="max-w-full h-auto rounded-lg"
                      />
                    </div>
                    <p className="text-green-400 font-mono text-lg mt-4">
                      {qrTimer}s
                    </p>
                  </div>
                </div>
              )}

              {status === "waiting" && (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-400">Mohon tunggu...</p>
                </div>
              )}

              {status === "success" && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <FaCheckCircle className="text-green-400 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Berhasil!
                    </h3>
                    <p className="text-gray-400">
                      Akun whatsapp ini berhasil di tautkan.
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-semibold py-3 px-4 rounded-xl transition duration-200"
                  >
                    Tutup
                  </button>
                </div>
              )}

              {status === "failed" && (
                <div className="text-center space-y-6">
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
                    {apiError}
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleRetry}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-semibold py-3 px-4 rounded-xl transition duration-200"
                    >
                      Coba Lagi
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 px-4 rounded-xl transition duration-200 border border-gray-700"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
  {/* Desktop / Tablet Grid */}
  <div className="hidden md:grid grid-cols-5 grid-rows-7 gap-4 h-full">
    {/* Left Sidebar (Logo + Menu) */}
    <div className="row-span-7 bg-[#191e45] rounded-xl p-4 flex flex-col items-center">
      <div className="flex items-center justify-center w-full h-32 mb-32">
        <div className="pt-8 w-32 h-32"><img src="../src/assets/logo.svg"></img></div>
      </div>

        <p className="text-gray-400 text-sm w-full space-y-2 mb-2 ml-5">
            Selamat datang, <span className="quicksand-title text-green-600">{user?.username}</span>
        </p>
      <nav className="flex-1 w-full space-y-2">
        {sidebarItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`cursor-pointer w-full flex items-center p-3 rounded-lg font-futuristic transition duration-300 ${
              activeTab === item.name
                ? "bg-[#272f6d] text-[#ffffff]"
                : "text-[#404ba3] hover:bg-[#272f6d] hover:text-neonGreen hover:shadow-neon"
            }`}
          >
            <item.icon className="mr-2 text-neonGreen" />
            {item.name}
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="cursor-pointer w-full flex items-center p-3 rounded-lg text-gray-300 font-futuristic hover:bg-gray-800 hover:text-neonGreen hover:shadow-neon transition duration-300"
        >
          <FaTimes className="mr-2 text-neonGreen" />
          Logout
        </button>
      </nav>
    </div>

    {/* External Links */}
    <div className="bg-[#191e45] col-span-2 row-span-2 col-start-2 row-start-1 rounded-xl px-4 py-4 overflow-x-auto top-custom-scrollbar flex space-x-4">
      <div className="snap-center min-w-[200px] bg-[#10122b] rounded-lg p-4">External Link 1</div>
      <div className="snap-center min-w-[200px] bg-[#10122b] rounded-lg p-4">External Link 2</div>
      <div className="snap-center min-w-[200px] bg-[#10122b] rounded-lg p-4">External Link 3</div>
      <div className="snap-center min-w-[200px] bg-[#10122b] rounded-lg p-4">External Link 4</div>
      <div className="snap-center min-w-[200px] bg-[#10122b] rounded-lg p-4">External Link 5</div>
      <div className="snap-center min-w-[200px] bg-[#10122b] rounded-lg p-4">External Link 6</div>
    </div>

    {/* Earnings & Total Sent */}
    <div className="bg-[#191e45] row-span-2 col-start-4 row-start-1 rounded-xl pt-6">
      <h2 className="text-xl font-futuristic font-bold text-neonGreen mb-4 ml-4"></h2>
      <div className="w-full">
      <p className="text-[#404ba3] text-sm mb-1 ml-4 font-mono">Total Penghasilan</p>
      <p className="text-5xl font-mono font-bold text-green-600 mb-4 ml-4 pb-4">
        {earningsLoading
          ? "..."
          : new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(earnings.total_earnings || 0)}
      </p>
      </div>
      <div className="w-full">
      <p className="text-[#404ba3] text-sm mb-1 ml-4 font-mono">Jumlah Pesan Terkirim</p>
      <p className="text-4xl font-mono font-bold text-[#f18c27] mb-4 ml-4 pb-4">
        {earningsLoading ? "..." : `${earnings.total_sent || 0}`}
      </p>
      </div>
    </div>

    {/* WhatsApp Accounts */}
    <div className="row-span-4 col-start-5 row-start-1 bg-[#191e45] border border-gray-800 rounded-xl p-6 flex flex-col">
      <h2 className="text-xl font-mono font-bold text-[#404ba3] mb-4">Whatsapp Tertaut</h2>
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 bg-[#11152d] rounded-lg">
        {linkedNumbers.length > 0 ? (
          linkedNumbers.map((account, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-[#141935] rounded-lg p-3 hover:shadow-neon"
            >
              <span className="text-gray-300 font-mono text-sm font-futuristic">{account.phone}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-futuristic font-medium ${
                  account.status === "connected"
                    ? "bg-green-600 border-1 rounded-lg border-green-300 shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] font-mono font-bold text-green-50 px-4 justify-items-center"
                    : "bg-red-900/20 text-gray-50/20 font-mono rounded-lg"
                }`}
              >
                {account.status}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center">Belum ada akun whatsapp yang tertaut</p>
        )}
      </div>
            <button
        onClick={() => {
          console.log("Button clicked, setting isModalOpen to true");
          setIsModalOpen(true);
        }}
        className="cursor-pointer w-full bg-green-600 text-[#10122b] font-futuristic font-semibold py-3 px-3  rounded-xl hover:bg-green-600 hover:border-green-300 hover:shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] hover:text-[#fafafa] transition duration-300 mb-3 mt-6"
      >
        Tautkan Whatsapp
      </button>

    </div>

    {/* Payments */}
    <div className="row-span-3 col-start-5 row-start-5 bg-[#191e45] rounded-xl p-6">
      <h2 className="text-xl font-mono font-bold text-[#404ba3] mb-4">Saldo Tersedia</h2>
      <div className="bg-[#272f6d] rounded-xl p-4 mb-4">
        
        <p className="text-2xl font-mono font-bold text-green-600">
          {earningsLoading
            ? "..."
            : new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(earnings.total_earnings || 0)}
        </p>
      </div>
      <button className="cursor-pointer w-full flex p-3 bg-green-600 text-[#10122b] font-mono font-bold rounded-xl hover:bg-green-600 hover:border-green-300 hover:shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] hover:text-white transition duration-300 mb-5">
        <svg className="ml-1 mr-12 w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.2,0H2.8C1.25,0,0,1.25,0,2.8V21.2C0,22.75,1.25,24,2.8,24H21.2c1.54,0,2.8-1.25,2.8-2.8V2.8
	C24,1.25,22.75,0,21.2,0z M18.07,15.13c-1.93-1.12-3.82-0.57-5.71,0.08c-1.37,0.47-2.72,1.04-4.22,0.92
	c-0.27-0.02-0.55-0.02-0.81-0.07c-1.33-0.26-1.59-0.58-1.59-1.93c0-1.35,0-2.71,0-4.06c0-0.33-0.07-0.66,0.1-0.96
	C6.03,8.97,6.2,9.07,6.36,9.15c1.23,0.67,2.5,0.62,3.79,0.19c1.18-0.39,2.34-0.82,3.52-1.22c1.3-0.44,2.6-0.57,3.88,0.07
	c0.36,0.18,0.71,0.38,0.71,0.85c0.01,1.72,0.01,3.43,0.01,5.15C18.26,14.46,18.31,14.73,18.07,15.13z"/>
    </svg>
        Tarik Penghasilan
      </button>
      <button className="w-full bg-gray-800 border border-gray-700 text-gray-300 font-futuristic font-medium py-2 px-4 rounded-xl hover:bg-gray-700 hover:shadow-neon">
        Histori Penarikan
      </button>
    </div>

    {/* Main Content */}
    
    <div className="container col-span-3 row-span-5 col-start-2 row-start-3 bg-[#191e45] rounded-xl p-6 overflow-y-auto">
      <div className="left-content w-[720px]">
        <Carousel />
      </div>
      <div className="rigt-content bg-linear-45 from-[#272f6d] to-[#191e45] w-[340px] overflow-y-auto custom-scrollbar flex rounded-xl">
        <Faq />
      </div>
    </div>
  </div>

  {/* Mobile Layout (stacked + floating navbar) */}
  <div className="md:hidden relative h-full flex flex-col">
    <div className="p-2 flex-1 overflow-y-auto pb-20 space-y-4 m-custom-scrollbar">

      {/* Welcome User & Logout */}
      <div className="grid grid-cols-2 p-1">
        
            <div className="">
              <p className="text-gray-400 text-sm quicksan-content">
                Selamat datang,
              </p>
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
      <hr className="border-1 border-[#191e45] rounded-lg"></hr>
      {/* Balance */}
      <div className="">
        
        <p className="text-gray-300 text-sm text-right mb-1">Saldo anda :</p>
        <p className="text-5xl text-right font-mono font-bold text-green-600 mb-1">
        {earningsLoading
          ? "..."
          : new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(earnings.total_earnings || 0)}
        </p>
      </div>
      {/* Carousel Mobile */}
      <div className="bg-[#191e45] rounded-xl p-1 h-[200px]">
        <CarouselMobile />
      </div>
      {/* Buttons Utility */}
      <div className="bg-[#272f6d] rounded-xl">
      <div className="grid grid-cols-3 bg-[#272f6d] px-4 py-1 rounded-xl items-center justify-items-center">
        <div>
          <button
            onClick={() => {
            console.log("Button clicked, setting isModalOpen to true");
            setIsModalOpen(true);
            }}
            className="cursor-pointer rounded-ml w-[80px] h-[80px] bg-[url('../src/assets/qrscan.svg')] hover:bg-[url('../src/assets/qrscanhov.svg')] hover:bg-[#009934] hover:shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] hover:text-[#fafafa] transition duration-300"
          >       
          </button>
        </div>
        <div>
          <button className="cursor-pointer rounded-ml w-[80px] h-[80px] bg-[url('../src/assets/withdraw.svg')] hover:bg-[url('../src/assets/withdrawhov.svg')] hover:bg-[#009934] hover:shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] hover:text-[#fafafa] transition duration-300"
          >       
          </button>
        </div>
        <div>
          <button className="cursor-pointer rounded-ml w-[80px] h-[80px] bg-[url('../src/assets/cashhistory.svg')] hover:bg-[url('../src/assets/cashhistoryhov.svg')] hover:bg-[#009934] hover:shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] hover:text-[#fafafa] transition duration-300"
          >       
          </button>
        </div>
        <div className="text-[#009934] text-center text-sm/4 mx-4">Tautkan whatsapp</div>
        <div className="text-[#009934] text-center text-sm/4 mx-4">Tarik Penghasilan</div>
        <div className="text-[#009934] text-center text-sm/4 mx-4">Riwayat Penarikan</div>
      </div>
      <div className="grid grid-cols-3 bg-[#272f6d] px-4 py-1 rounded-xl items-center justify-items-center">
        <div>
          <button className="mt-3 cursor-pointer rounded-ml w-[80px] h-[80px] bg-[url('../src/assets/policy.svg')] hover:bg-[url('../src/assets/policyhov.svg')] hover:bg-[#009934] hover:shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] hover:text-[#fafafa] transition duration-300"
          >       
          </button>
        </div>
        <div>
          <button className="mt-3 cursor-pointer rounded-ml w-[80px] h-[80px] bg-[url('../src/assets/userset.svg')] hover:bg-[url('../src/assets/usersethov.svg')] hover:bg-[#009934] hover:shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] hover:text-[#fafafa] transition duration-300"
          >       
          </button>
        </div>
        <div>
          <button className="mt-3 cursor-pointer rounded-ml w-[80px] h-[80px] bg-[url('../src/assets/aboutus.svg')] hover:bg-[url('../src/assets/aboutushov.svg')] hover:bg-[#009934] hover:shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] hover:text-[#fafafa] transition duration-300"
          >       
          </button>
        </div>
        <div className="text-[#009934] text-center text-sm/4 mx-4">Perjanjian & Kebijakan</div>
        <div className="text-[#009934] text-center text-sm/4 mx-4">Setting Pengguna</div>
        <div className="text-[#009934] text-center text-sm/4 mx-4">Tentang Kami</div>
      </div>
      </div>      
      {/* WhatsApp Accounts */}
      <div className="bg-[#191e45] rounded-xl px-4 py-1">
        <h2 className="text-xl text-center font-futuristic font-bold text-green-600 mb-1">Akun yang tertaut</h2>
        
        <WhatsappListMobile
        linkedNumbers={linkedNumbers}
        setIsModalOpen={setIsModalOpen}
        />
      </div>
      
    </div>
    
  </div>
</div>

  );
}

export default Dashboard;