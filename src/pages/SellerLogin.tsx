import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SellerLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await fetch("/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include", // 🔥 cookie-based auth
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Login failed");
      return;
    }

    // ✅ REDIRECT TO SELLER DASHBOARD
    navigate("/seller-dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-[#0B1C2F] p-8 rounded-xl w-[400px]">

        <h2 className="text-2xl mb-6 text-[#C9A84C] text-center">
          Seller Login
        </h2>

        <input
          placeholder="Username"
          className="w-full p-3 mb-4 bg-black border border-white/20 rounded"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 bg-black border border-white/20 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full py-3 bg-[#C9A84C] text-black font-bold rounded"
        >
          LOGIN
        </button>

      </div>
    </div>
  );
};

export default SellerLogin;