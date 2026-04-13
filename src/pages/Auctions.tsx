import { useState, useEffect } from 'react'
import AuctionCard from '../components/ui/AuctionCard'

const Auctions = () => {
  const [auctions, setAuctions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ FIXED (past → ended)
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'upcoming' | 'ended'>('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [visibleCount, setVisibleCount] = useState(8)

  const categories = ['all', 'real-estate', 'cars', 'yacht', 'art']

  // 🔥 FETCH FROM BACKEND (NO MAPPING → KEEP REAL DATA)
  useEffect(() => {
    setLoading(true)

    fetch(
      `http://127.0.0.1:8000/api/auctions/?status=${filterStatus}&category=${filterCategory}&search=${searchTerm}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("Invalid data", data)
          setAuctions([])
        } else {
          setAuctions(data)   // ✅ KEEP ORIGINAL (important for bids)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Fetch error:", err)
        setLoading(false)
      })
  }, [filterStatus, filterCategory, searchTerm])

  // ✅ SAFE FILTER (aligned with backend)
  const filteredAuctions = auctions.filter((auction: any) => {
    const matchesStatus =
      filterStatus === 'all' ||
      auction.status === filterStatus

    const matchesCategory =
      filterCategory === 'all' ||
      auction.category === filterCategory

    const matchesSearch =
      auction.title?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesCategory && matchesSearch
  })

  return (
    <div className="bg-[#040B1A] min-h-screen pt-24 pb-12 sm:pb-16 lg:pb-20">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* HERO */}
          <div className="mb-12 sm:mb-16 lg:mb-20">
            <p className="text-[11px] tracking-widest uppercase text-[#C9A84C] mb-3">
              All Listings
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#F5F1E8] mb-4">
              Browse <span className="italic text-[#C9A84C]">Auctions</span>
            </h1>

            <p className="text-[#F5F1E8]/60 max-w-xl">
              Discover exclusive luxury assets across real estate, cars, yachts, and art.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">

            {/* SIDEBAR */}
            <div className="bg-[#0B1C2F]/60 p-6 rounded-2xl border border-white/10">

              <input
                type="text"
                placeholder="Search auctions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 mb-6 bg-[#040B1A] border border-white/10 rounded-xl text-white"
              />

              <div className="mb-6">
                <h3 className="text-white mb-3">Auction Status</h3>
                {['all', 'live', 'upcoming', 'ended'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s as any)}
                    className="block w-full text-left px-3 py-2 rounded hover:bg-white/10"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div>
                <h3 className="text-white mb-3">Category</h3>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className="block w-full text-left px-3 py-2 rounded hover:bg-white/10"
                  >
                    {cat}
                  </button>
                ))}
              </div>

            </div>

            {/* RIGHT */}
            <div>

              <p className="text-gray-400 mb-6">
                {filteredAuctions.length} results
              </p>

              {loading && <p className="text-white">Loading...</p>}

              {!loading && filteredAuctions.length === 0 && (
                <p className="text-gray-400 text-center py-20">
                  No auctions found
                </p>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredAuctions.slice(0, visibleCount).map((auction: any) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Auctions