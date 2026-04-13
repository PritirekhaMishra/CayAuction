import { useState, useEffect } from 'react'

const Preloader = () => {
  const [progress, setProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Simulate loading progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(() => setIsLoaded(true), 500) // Exit delay
          return 100
        }
        return prev + Math.random() * 8
      })
    }, 80)

    return () => clearInterval(timer)
  }, [])

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 z-[9999] bg-navy flex items-center justify-center">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/90 to-black" />
        
        {/* Centered container */}
        <div className="relative z-10 text-center text-white px-8 max-w-md mx-auto">
          
          {/* Logo */}
          <div className="opacity-0 scale-75 translate-y-8 animate-[logo-reveal_1s_ease-out_0.2s_forwards]">
            <div className="text-5xl md:text-7xl font-playfair font-black bg-gradient-to-r from-gold via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_25px_50px_rgba(212,175,55,0.8)] mb-12">
              CayAuctions
            </div>
            <p className="text-white/70 text-lg md:text-xl font-inter tracking-wide uppercase">Loading Luxury...</p>
          </div>

          {/* Progress Bar */}
          <div className="mt-20 md:mt-24 w-full h-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-xl">
            <div 
              className="h-full bg-gradient-to-r from-gold via-yellow-400 to-amber-500 rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all duration-1000 ease-out shadow-gold/50 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Sweep animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shine_1.5s_infinite] -skew-x-12 transform -translate-x-[100%] opacity-75" />
            </div>
          </div>
          
          {/* Progress Text */}
          <div className="mt-6 text-2xl md:text-3xl font-bold bg-gradient-to-r from-gold via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-lg">
            {Math.round(progress)}%
          </div>
        </div>

      </div>
    )
  }

  return null
}

export default Preloader


