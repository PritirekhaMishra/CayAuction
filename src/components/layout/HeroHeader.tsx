import { Link } from 'react-router-dom'
import { useState } from 'react'

const HeroHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="absolute top-0 z-50 bg-transparent py-5 backdrop-blur-sm h-[80px] flex items-center w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="text-2xl md:text-3xl font-display font-black bg-gradient-to-r from-gold via-gold-light to-amber-400 bg-clip-text text-transparent hover:scale-105 transition-all duration-300">
            CayAuctions
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center space-x-10 text-[13px] uppercase tracking-widest font-medium text-white">
            <Link to="/auctions" className="relative group hover:text-[#C8A96A] transition-all duration-300 px-3 py-2 rounded-xl hover:bg-white/5">
              LIVE AUCTIONS
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#C8A96A] group-hover:w-full transition-all duration-500"></span>
            </Link>
            <Link to="/upcoming" className="relative group hover:text-[#C8A96A] transition-all duration-300 px-3 py-2 rounded-xl hover:bg-white/5">
              UPCOMING
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#C8A96A] group-hover:w-full transition-all duration-500"></span>
            </Link>
            <Link to="/how-it-works" className="relative group hover:text-[#C8A96A] transition-all duration-300 px-3 py-2 rounded-xl hover:bg-white/5">
              HOW IT WORKS
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#C8A96A] group-hover:w-full transition-all duration-500"></span>
            </Link>
            <Link to="/sell" className="relative group hover:text-[#C8A96A] transition-all duration-300 px-3 py-2 rounded-xl hover:bg-white/5">
              SELL WITH US
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#C8A96A] group-hover:w-full transition-all duration-500"></span>
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <Link 
              to="/login"
              className="text-white/80 hover:text-white font-medium text-sm px-5 py-2 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/20 hover:border-[#C8A96A]/50"
            >
              SIGN IN
            </Link>
            <Link 
              to="/auctions"
              className="bg-[#C8A96A] text-black font-bold text-sm px-6 py-2 rounded-full hover:scale-105 hover:shadow-[0_10px_30px_rgba(200,169,106,0.6)] transition-all duration-300 shadow-[0_8px_25px_rgba(200,169,106,0.4)] tracking-wider uppercase"
            >
              PLACE BID
            </Link>

            {/* Mobile menu button */}
            <button 
              className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className={`w-6 h-6 transition-all ${mobileOpen ? 'text-[#C8A96A]' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-500 ${mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <nav className="pt-4 pb-6 space-y-3 bg-black/80 backdrop-blur-xl w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Link to="/auctions" className="block py-3 px-4 text-base font-medium text-white/90 hover:text-[#C8A96A] hover:bg-white/10 rounded-xl transition-all" onClick={() => setMobileOpen(false)}>
              LIVE AUCTIONS
            </Link>
            <Link to="/upcoming" className="block py-3 px-4 text-base font-medium text-white/90 hover:text-[#C8A96A] hover:bg-white/10 rounded-xl transition-all" onClick={() => setMobileOpen(false)}>
              UPCOMING
            </Link>
            <Link to="/how-it-works" className="block py-3 px-4 text-base font-medium text-white/90 hover:text-[#C8A96A] hover:bg-white/10 rounded-xl transition-all" onClick={() => setMobileOpen(false)}>
              HOW IT WORKS
            </Link>
            <Link to="/sell" className="block py-3 px-4 text-base font-medium text-white/90 hover:text-[#C8A96A] hover:bg-white/10 rounded-xl transition-all" onClick={() => setMobileOpen(false)}>
              SELL WITH US
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default HeroHeader
