import React, { useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA7VRtspGUBjOVQvDRVtLYzv2l9NS0Bboc",
  authDomain: "waboss-auth.firebaseapp.com",
  projectId: "waboss-auth",
  storageBucket: "waboss-auth.firebasestorage.app",
  messagingSenderId: "1047779332913",
  appId: "1:1047779332913:web:68ada62c133cf2d26b9610",
  measurementId: "G-6HS03ZKL9W"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function GoogleLoginButton() {
  // ✅ Step 1: Trigger redirect login
  const handleLogin = () => {
    signInWithRedirect(auth, provider);
  };

  // ✅ Step 2: Handle redirect result after returning from Google
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result) return;
        const user = result.user;
        const token = await user.getIdToken();

        // Send Firebase token to your backend
        const res = await fetch("http://localhost:5000/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("authToken", data.token);
          alert(`Welcome ${data.user.username || data.user.email}!`);
        } else {
          alert(data.message || "Login failed");
        }
      })
      .catch((error) => {
        console.error("Redirect login failed:", error);
      });
  }, []);

  return (
    <button
      onClick={handleLogin}
      className="bg-white text-gray-700 border rounded-lg px-4 py-2 shadow-md hover:bg-gray-50 flex items-center gap-2"
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google Logo"
        className="w-5 h-5"
      />
      Continue with Google
    </button>
  );
}
