import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

function Header() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-blue-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          WABoss
        </Link>
        <nav className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <span className="text-sm font-medium">
                Welcome, {user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium hover:text-orange-400 transition duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
