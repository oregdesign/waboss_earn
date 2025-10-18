import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  isAuthenticated: !!localStorage.getItem("token"),

  login: (userData) => {
    // Save both token and user to localStorage for persistence
    localStorage.setItem("user", JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
