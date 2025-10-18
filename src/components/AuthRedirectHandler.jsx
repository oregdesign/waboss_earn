import { useEffect } from "react";
import { getAuth, getRedirectResult } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";

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

export default function AuthRedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result) return; // no redirect result
        const user = result.user;
        const token = await user.getIdToken();

        // send Firebase token to your backend
        const res = await fetch("http://localhost:5000/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("authToken", data.token);
          navigate("/dashboard"); // redirect to dashboard after login
        } else {
          console.error(data.message || "Login failed");
        }
      })
      .catch((error) => console.error("Redirect login failed:", error));
  }, [navigate]);

  return null; // this component renders nothing
}
