import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { FeaturedAuction } from '../../types/auction'
import { formatCurrency } from '../../utils/formatters'
import { MapPin, Home, Shield } from "lucide-react"

interface HeroSectionProps {
  auction: FeaturedAuction
}

const HeroSection = ({ auction }: HeroSectionProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 23,
    seconds: 59
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev
        seconds--

        if (seconds < 0) {
          seconds = 59
          minutes--
          if (minutes < 0) {
            minutes = 59
            hours--
            if (hours < 0) {
              hours = 23
              days--
            }
          }
        }

        return { days, hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${auction.image})` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B1C2C]/95 via-[#0B1C2C]/80 to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 w-full">

        <div className="max-w-[1400px] mx-auto px-6 pt-[80px] pb-20 lg:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center min-h-[calc(100vh-80px)]">

            {/* LEFT */}
            <div className="lg:col-span-7 space-y-8">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full text-xs tracking-wider text-white">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                LIVE AUCTION · 47 BIDDERS ACTIVE
              </div>

              {/* Heading */}
              <div className="leading-none">
                <h1 className="font-[Playfair_Display] font-bold text-[64px] leading-[72px] text-white">
                  Oceanfront
                </h1>
                <h1 className="font-[Playfair_Display] font-bold text-[64px] leading-[72px] text-[#C8A96A] italic">
                  Grand Cayman
                </h1>
                <h1 className="font-[Playfair_Display] font-bold text-[64px] leading-[72px] text-white">
                  Estate
                </h1>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-300 max-w-[520px]">
                {auction.description}
              </p>

              {/* Price */}
              <div className="space-y-4">
                <div className="flex items-end gap-4">
                  <span className="text-xs uppercase tracking-widest text-gray-400">
                    CURRENT BID
                  </span>
                  <span className="text-3xl font-semibold text-white">
                    {formatCurrency(auction.currentBid)}
                  </span>
                </div>

                <div className="text-sm text-gray-400">
                  Est value ${formatCurrency(auction.currentBid * 2)}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <Link
                  to={`/auction/${auction.id}`}
                  className="bg-[#C8A96A] text-black px-6 py-2 rounded-full text-sm font-bold uppercase hover:scale-105 transition"
                >
                  Place Bid
                </Link>

                <Link
                  to={`/auction/${auction.id}`}
                  className="border border-white/30 px-6 py-2 rounded-full text-sm text-white hover:bg-white/10 transition"
                >
                  View Details
                </Link>
              </div>

            </div>

            {/* RIGHT CARD */}
            <div className="lg:col-span-5">
              <div className="bg-[#0B1C2C]/85 backdrop-blur-xl rounded-2xl p-8 shadow-[0_20px_80px_rgba(0,0,0,0.7)]">

                <h3 className="text-xs tracking-widest text-gray-400 uppercase mb-8">
                  AUCTION CLOSES IN
                </h3>

                {/* Countdown */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  {[
                    { value: timeLeft.days, label: 'Days' },
                    { value: timeLeft.hours, label: 'Hrs' },
                    { value: timeLeft.minutes, label: 'Min' },
                    { value: timeLeft.seconds, label: 'Sec' }
                  ].map(({ value, label }) => (
                    <div key={label} className="bg-black/50 rounded-lg p-4 text-center">
                      <div className="text-xl font-semibold text-white">
                        {String(value).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-400">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

              

{/* DETAILS */}
<div className="mt-6 text-sm">

  {/* LOCATION */}
  <div className="mb-6">
    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
      LOCATION
    </p>

    <div className="flex justify-between text-white">
      <span>{auction.location?.split(',')[0]}</span>
      <span>{auction.location?.split(',')[1]}</span>
    </div>
  </div>

  {/* PROPERTY */}
  <div className="mb-6">
    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
      PROPERTY
    </p>

    <div className="flex gap-10 text-white">
      <span>{auction.beds} Bed</span>
      <span>{auction.baths} Bath</span>
      <span>{auction.sqft}</span>
    </div>
  </div>

  {/* STATUS */}
  <div className="mb-6">
    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
      STATUS
    </p>

    <p className="text-white">
      {auction.status || auction.status}
    </p>
  </div>

</div>

{/* Divider */}
<div className="border-t border-white/10 my-6"></div>

{/* Price */}
<div className="flex justify-between items-center">
  <span className="text-gray-400 text-xs">Minimum next bid</span>
  <span className="text-[#C8A96A] text-xl font-semibold">
    {formatCurrency(auction.currentBid)}
  </span>
</div>

                {/* Button */}
                <Link
                  to={`/auction/${auction.id}`}
                  className="block text-center mt-6 bg-[#C8A96A] text-black py-3 rounded-xl font-bold hover:scale-105 transition"
                >
                  Place Your Bid
                </Link>

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}

export default HeroSection