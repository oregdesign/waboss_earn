// components/dashboard/DesktopLayout.jsx
import React from 'react';
import { FaTachometerAlt, FaUser, FaCreditCard, FaCog, FaComments, FaTimes } from 'react-icons/fa';
import Carousel from '../Carousel'; // Adjust path as needed
import Faq from '../Faq'; // Adjust path as needed

const Sidebar = ({ activeTab, setActiveTab, handleLogout, user }) => {
  const sidebarItems = [
    { name: 'Dashboard', icon: FaTachometerAlt },
    { name: 'Profile', icon: FaUser },
    { name: 'Payment', icon: FaCreditCard },
    { name: 'Setting', icon: FaCog },
    { name: 'Chats', icon: FaComments },
  ];

  return (
    <div className="row-span-7 bg-[#191e45] rounded-xl p-4 flex flex-col items-center">
      <div className="flex items-center justify-center w-full h-32 mb-32">
        <div className="pt-8 w-32 h-32"><img src="../src/assets/logo.svg" alt="Logo" /></div>
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
                ? 'bg-[#272f6d] text-[#ffffff]'
                : 'text-[#404ba3] hover:bg-[#272f6d] hover:text-neonGreen hover:shadow-neon'
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
  );
};

const EarningsDisplay = ({ earnings, earningsLoading }) => {
  return (
    <div className="bg-[#191e45] row-span-2 col-start-4 row-start-1 rounded-xl pt-6">
      <h2 className="text-xl font-futuristic font-bold text-neonGreen mb-4 ml-4"></h2>
      <div className="w-full">
        <p className="text-[#404ba3] text-sm mb-1 ml-4 font-mono">Total Penghasilan</p>
        <p className="text-5xl font-mono font-bold text-green-600 mb-4 ml-4 pb-4">
          {earningsLoading
            ? '...'
            : new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(earnings.total_earnings || 0)}
        </p>
      </div>
      <div className="w-full">
        <p className="text-[#404ba3] text-sm mb-1 ml-4 font-mono">Jumlah Pesan Terkirim</p>
        <p className="text-4xl font-mono font-bold text-[#f18c27] mb-4 ml-4 pb-4">
          {earningsLoading ? '...' : `${earnings.total_sent || 0}`}
        </p>
      </div>
    </div>
  );
};

const LinkedAccounts = ({ linkedNumbers, setIsModalOpen }) => {
  return (
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
                  account.status === 'connected'
                    ? 'bg-green-600 border-1 rounded-lg border-green-300 shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] font-mono font-bold text-green-50 px-4 justify-items-center'
                    : 'bg-red-900/20 text-gray-50/20 font-mono rounded-lg'
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
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer w-full bg-green-600 text-[#10122b] font-futuristic font-semibold py-3 px-3 rounded-xl hover:bg-green-600 hover:border-green-300 hover:shadow-[0_0_2px_#00b93e,inset_0_0_2px_#00b93e,0_0_5px_#32d96a,0_0_15px_#32d96a,0_0_15px_#32d96a] hover:text-[#fafafa] transition duration-300 mb-3 mt-6"
      >
        Tautkan Whatsapp
      </button>
    </div>
  );
};

const Payments = () => {
  return (
    <div className="row-span-3 col-start-5 row-start-5 bg-[#191e45] rounded-xl p-6">
      <h2 className="text-xl font-mono font-bold text-[#404ba3] mb-4">Saldo Tersedia</h2>
      <div className="bg-[#272f6d] rounded-xl p-4 mb-4">
        <p className="text-2xl font-mono font-bold text-green-600">
          {/* Earnings logic would be passed as prop if needed */}
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
  );
};

const MainContent = () => {
  return (
    <div className="container col-span-3 row-span-5 col-start-2 row-start-3 bg-[#191e45] rounded-xl p-6 overflow-y-auto">
      <div className="left-content w-[720px]">
        <Carousel />
      </div>
      <div className="rigt-content bg-linear-45 from-[#272f6d] to-[#191e45] w-[340px] overflow-y-auto custom-scrollbar flex rounded-xl">
        <Faq />
      </div>
    </div>
  );
};

const DesktopLayout = ({ activeTab, setActiveTab, user, handleLogout, earnings, earningsLoading, linkedNumbers, setIsModalOpen }) => {
  return (
    <div className="hidden md:grid grid-cols-5 grid-rows-7 gap-4 h-full">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} user={user} />
      {/* External Links */}
      <div className="bg-[#191e45] col-span-2 row-span-2 col-start-2 row-start-1 rounded-xl px-4 py-4 overflow-x-auto top-custom-scrollbar flex space-x-4">
        <div className="snap-center min-w-[200px] bg-[#10122b] rounded-lg p-4">External Link 1</div>
        {/* ... other external links */}
      </div>
      <EarningsDisplay earnings={earnings} earningsLoading={earningsLoading} />
      <LinkedAccounts linkedNumbers={linkedNumbers} setIsModalOpen={setIsModalOpen} />
      <Payments />
      <MainContent />
    </div>
  );
};

export default DesktopLayout;