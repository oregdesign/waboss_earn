import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { Navigate } from "react-router-dom";
import useAuthStore from "./store/useAuthStore";


function ProtectedRoute({ element }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? element : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
      <Route path="/" element={<Register />} />
    </Routes>
  );
}

export default App;
