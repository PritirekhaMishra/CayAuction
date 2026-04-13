import { useState } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../assets/logo.jpeg"

type LoginResponse = {
  error?: string
  message?: string
  is_admin?: boolean
}

const AdminLogin = () => {
  const navigate = useNavigate()

  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Enter credentials")
      return
    }

    try {
      setLoading(true)

      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ username, password })
      })

      let data: LoginResponse = {}

      try {
        data = await res.json()
      } catch (err) {
        console.error("JSON parse error:", err)
      }

      console.log("LOGIN RESPONSE:", data)

      // ❌ API error
      if (!res.ok) {
        alert(data.error || "Login failed")
        return
      }

     // 🔥 STRICT ADMIN LOGIN ONLY
if (data.is_admin !== true) {
  alert("Only admin can login here")

  // 🔥 IMPORTANT: stop login completely
  return
}

      // ✅ SUCCESS → navigate + reload to sync session
      navigate("/admin-dashboard", { 
  replace: true, 
  state: { justLoggedIn: true }   // 🔥 ADD THIS
})

      // 🔥 IMPORTANT FIX (session sync)
      setTimeout(() => {
        window.location.reload()
      }, 100)

    } catch (err) {
      console.error("Login error:", err)
      alert("Server error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="w-[400px] bg-[#0B1C2F] p-8 rounded-xl shadow-xl">

        {/* Logo */}
        <div className="text-center mb-6">
          <img
            src={logo}
            alt="CayAdmin"
            className="mx-auto h-14 sm:h-16 w-auto object-contain drop-shadow-[0_0_8px_rgba(201,168,76,0.3)] transition-all duration-300 hover:scale-[1.05]"
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl text-center mb-6 text-[#C9A84C]">
          Admin Login
        </h2>

        {/* Username */}
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 bg-black border border-white/20 rounded focus:outline-none focus:border-[#C9A84C]"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 bg-black border border-white/20 rounded focus:outline-none focus:border-[#C9A84C]"
        />

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-[#C9A84C] text-black font-bold rounded hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "LOGIN"}
        </button>

      </div>
    </div>
  )
}

export default AdminLogin