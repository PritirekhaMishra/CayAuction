import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import { apiRequest } from "../../services/api";

import logo from "../../assets/logo.jpeg"

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [dropdown, setDropdown] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiRequest("/user/")

        if (!data || data.error) {
          setUser(null)
          return
        }

        setUser(data)

      } catch (err) {
        console.error("User fetch error:", err)
        setUser(null)
      }
    }

    fetchUser()
  }, [])

  const logout = async () => {
    await apiRequest("/logout/", { method: "POST" })  // ✅ FIXED

    setUser(null)
    navigate("/")
  }

  return (
    <header className="fixed top-0 z-50 w-full bg-[#030A18]/80 backdrop-blur border-b border-white/10 py-5 h-[80px] flex items-center">
      
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="CayAuctions" 
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm transition-transform duration-300 hover:scale-[1.05]" 
            />
            <span className="text-xl sm:text-2xl font-bold text-[#C9A84C]">
              CayAuctions
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex gap-8 text-white text-sm">
            <Link to="/auctions">LIVE AUCTIONS</Link>
            <Link to="/upcoming">UPCOMING</Link>
            <Link to="/how-it-works">HOW IT WORKS</Link>
            <Link to="/sell">SELL WITH US</Link>
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4 relative">

            {user ? (
              <>
                {/* PROFILE */}
                <div
                  onClick={() => setDropdown(!dropdown)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {user.picture && (
                    <img src={user.picture} className="w-8 h-8 rounded-full" />
                  )}

                  <span className="text-[#C9A84C] text-sm font-semibold">
                    {user.name}
                  </span>
                </div>

                {/* BALANCE */}
                <span className="text-xs text-gray-400">
                  ${user.balance?.toLocaleString()}
                </span>

                {/* DROPDOWN */}
                {dropdown && (
                  <div
                    className="absolute right-0 top-12 w-48 bg-[#0F2235] border border-white/10 rounded-lg shadow-lg overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-white/5"
                    >
                      Profile
                    </button>

                    <button
                      onClick={() => navigate("/deposit")}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-white/5"
                    >
                      Add Funds
                    </button>

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm">
                  SIGN IN
                </Link>

                <Link to="/sign-up-login">
                  <button className="bg-gradient-to-r from-[#C9A84C] to-[#E2C97E] px-5 py-2 rounded-full text-[#040B1A] text-sm font-semibold">
                    REGISTER
                  </button>
                </Link>
              </>
            )}

            {/* MOBILE MENU BUTTON */}
            <button
              className="lg:hidden text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              ☰
            </button>

          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="lg:hidden mt-4 space-y-3 text-white text-sm">
            <Link to="/auctions">LIVE AUCTIONS</Link>
            <Link to="/upcoming">UPCOMING</Link>
            <Link to="/how-it-works">HOW IT WORKS</Link>
            <Link to="/sell">SELL WITH US</Link>
          </div>
        )}

      </div>
    </header>
  )
}

export default Header