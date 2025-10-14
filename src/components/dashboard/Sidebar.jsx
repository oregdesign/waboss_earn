import { FaTachometerAlt, FaUser, FaCreditCard, FaCog, FaComments, FaTimes } from 'react-icons/fa';

const Sidebar = ({ activeTab, setActiveTab, handleLogout, user }) => {
  const sidebarItems = [
    { name: "Dashboard", icon: FaTachometerAlt },
    { name: "Profile", icon: FaUser },
    { name: "Payment", icon: FaCreditCard },
    { name: "Setting", icon: FaCog },
    { name: "Chats", icon: FaComments },
  ];

  return (
    <div className="row-span-7 bg-[#191e45] rounded-xl p-4 flex flex-col items-center">
      {/* Your sidebar JSX here... */}
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
  );
};

export default Sidebar;