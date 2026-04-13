// src/pages/Upcoming.tsx
import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuctions, Auction } from "../hooks/useAuctions"

const normalize = (v: any) => (v || "").toString().toLowerCase().trim()

const Upcoming = () => {
  const { auctions } = useAuctions()
  const navigate = useNavigate()

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"all" | "upcoming" | "live" | "ended">("all")
  const [category, setCategory] = useState("all")

  const filtered = useMemo(() => {
  return auctions.filter((a: Auction) => {
      return (
        normalize(a.title).includes(normalize(search)) &&
        (status === "all" || normalize(a.status) === normalize(status)) &&
        (category === "all" || normalize(a.category) === category)
      )
    })
  }, [auctions, search, status, category])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#040B1A] to-[#0B1C2F] text-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 lg:pb-20">
        <div className="max-w-7xl mx-auto">

          {/* HERO */}
          <div className="relative h-[280px] sm:h-[360px] lg:h-[420px] w-full mb-12 sm:mb-16 lg:mb-20">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
              className="absolute w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-black/70" />

            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <p className="text-xs sm:text-sm tracking-widest text-[#C9A84C] mb-2">
                DISCOVER FUTURE LUXURY AUCTIONS
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Upcoming Auctions
              </h1>
              <div className="w-16 h-1 bg-[#C9A84C] mt-3 rounded-full" />
            </div>
          </div>

          {/* MAIN */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">


            {/* SIDEBAR */}
            <aside className="w-full lg:w-80 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 h-fit space-y-6">


          <div>
            <p className="text-sm mb-2 text-gray-300">Search Auctions</p>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 px-4 py-3 rounded-xl outline-none"
            />
          </div>

          <div>
            <p className="text-sm mb-3 text-gray-300">Auction Status</p>
            <div className="space-y-2">
              {["all", "live", "upcoming", "ended"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s as any)}
                  className={`w-full text-left px-4 py-3 rounded-xl capitalize transition ${
                    status === s
                      ? "bg-[#C9A84C] text-black font-semibold"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm mb-3 text-gray-300">Category</p>
            <div className="space-y-2">
              {["all", "real-estate", "cars", "yacht", "art"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`w-full text-left px-4 py-3 rounded-xl capitalize transition ${
                    category === c
                      ? "bg-[#C9A84C] text-black font-semibold"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setSearch("")
              setStatus("all")
              setCategory("all")
            }}
            className="w-full py-3 bg-[#C9A84C] text-black rounded-xl font-semibold"
          >
            Clear Filters
          </button>
        </aside>

        {/* RIGHT CONTENT */}
        <div className="flex-1">

          <p className="mb-8 text-gray-400 text-sm">
            {filtered.length} results
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              No auctions found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">


              {filtered.map((a: Auction) => (
                <div
                  key={a.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col hover:scale-[1.02] transition-all duration-300"
                >
                  {/* IMAGE */}
                  <div className="relative h-52">
                    <img
                      src={a.image || "https://via.placeholder.com/400"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 px-3 py-1 text-xs rounded capitalize">
                      {a.status}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-6 flex flex-col flex-1">

                    <p className="text-xs text-[#C9A84C] uppercase tracking-wide mb-1">
                      {a.category}
                    </p>

                    <h3 className="text-lg font-semibold leading-snug mb-2">
                      {a.title}
                    </h3>

                    <p className="text-gray-400 text-sm mb-4">
                      {a.location}
                    </p>

                    {/* PRICE */}
                    <div className="flex justify-between text-sm mt-auto mb-4">
                      <span className="text-gray-400">Starting Bid</span>
                      <span className="text-[#C9A84C] font-semibold">
                        ${a.startingBid?.toLocaleString()}
                      </span>
                    </div>

                    {/* BUTTON */}
                    <button
                      onClick={() => navigate(`/auction/${a.id}`)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#E2C97E] text-black font-semibold"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}

            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Upcoming