import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { formatCurrency } from '../utils/formatters'

const AuctionDetail = () => {
  const { id } = useParams()

  const [auction, setAuction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bidInput, setBidInput] = useState('')
  const [timeLeft, setTimeLeft] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)



  // =========================
// ✅ LIVE UPDATE (OPTIMIZED)
// =========================
useEffect(() => {
  const fetchAuction = () => {
    fetch(`http://127.0.0.1:8000/api/auction/${id}/`)
      .then(res => res.json())
      .then(data => {
        setAuction(data)
        setLoading(false)   // ✅ FIX
      })
      .catch(err => {
        console.error(err)
        setLoading(false)   // ✅ also handle error
      })
  }

  fetchAuction()

  const interval = setInterval(fetchAuction, 120000)

  return () => clearInterval(interval)
}, [id])

  // =========================
  // TIMER 
  // =========================
  useEffect(() => {
    if (!auction) return

    const updateTimer = () => {
      const end = new Date(auction.end_time).getTime()
      const now = Date.now()
      const diff = end - now

      if (diff <= 0) {
        setTimeLeft("Ended")
        return
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const m = Math.floor((diff / (1000 * 60)) % 60)
      const s = Math.floor((diff / 1000) % 60)

      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [auction])

  if (loading) return <div className="text-white p-10">Loading...</div>

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#040B1A] text-white">
        Auction Not Found
      </div>
    )
  }
  const media = [
  ...(auction.video
  ? [
      {
        type: "video",
        url: auction.video   // ✅ always trust backend
      }
    ]
  : []),

  ...(Array.isArray(auction.images)
    ? auction.images.map((img: string) => ({
        type: "image",
        url: img.startsWith("http")
          ? img
          : `http://127.0.0.1:8000${img}`
      }))
    : [])
]
  // =========================
  // PRICE LOGIC
  // =========================
  const currentBid =
    auction.current_price > 0
      ? Number(auction.current_price)
      : Number(auction.starting_price)

  const increment = Number(auction.increment)
  const minBid = currentBid + increment

  // =========================
  // BID HANDLER (FIXED)
  // =========================
  const handleBid = async () => {
  try {
    const amount = parseFloat(bidInput)

    if (!amount) {
      alert("Enter valid amount")
      return
    }

    const res = await fetch("http://127.0.0.1:8000/api/bid/", {
      method: "POST",

      // ✅ CORRECT PLACE
      credentials: "include",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        auction_id: auction.id,
        amount: amount
      })
    })

    const data = await res.json()

    if (!res.ok) {
  if (data.error === "Insufficient funds") {
    alert("⚠️ Please add funds to continue")
    window.location.href = "/deposit"
    return
  }

  alert(data.error || "Bid failed")
  return
}

    alert("✅ Bid placed successfully")

    // ✅ LIVE UPDATE UI
    setAuction((prev: any) => ({
      ...prev,
      current_price: data.current_price,
      previous_bid: data.previous_bid,
      min_next_bid: data.min_next_bid
    }))

    setBidInput("")

  } catch (err) {
    console.error(err)
    alert("Network error")
  }
}

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-[#0B1C2C] text-white pt-20 pb-12 px-4">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <Link to="/auctions" className="text-[#C8A96A] text-sm">
            ← Back to Auctions
          </Link>

          <h1 className="mt-4 text-3xl font-semibold">
            {auction.title}
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* IMAGE */}
          <div className="space-y-4">

  {/* MAIN DISPLAY */}
  {media.length > 0 && (
    <div>
      {media[currentIndex].type === "video" ? (
        <video
          src={media[currentIndex].url}
          controls
          className="w-full rounded-xl"
        />
      ) : (
        <img
          src={media[currentIndex].url}
          className="w-full rounded-xl"
        />
      )}
    </div>
  )}

  {/* THUMBNAILS */}
  <div className="flex gap-2 overflow-x-auto">
    {media.map((item: any, index: number) => (
      <div
        key={index}
        onClick={() => setCurrentIndex(index)}
        className={`cursor-pointer border ${
          index === currentIndex
            ? "border-yellow-500"
            : "border-transparent"
        }`}
      >
        {item.type === "video" ? (
          <video
            src={item.url}
            className="w-20 h-20 object-cover"
          />
        ) : (
          <img
            src={item.url}
            className="w-20 h-20 object-cover"
          />
        )}
      </div>
    ))}
  </div>

</div>

          {/* DETAILS */}
          <div className="bg-[#0F2235] p-6 rounded-xl">

            <p className="text-gray-400 text-sm">Current Bid</p>

            <h2 className="text-3xl font-bold text-[#C8A96A] mb-2">
              {formatCurrency(currentBid)}
            </h2>

            <p className="text-sm text-gray-400">
              Previous Bid: {formatCurrency(auction.previous_bid || currentBid)}
            </p>

            <p className="text-sm text-gray-400 mb-2">
              Minimum Next Bid:
              <span className="text-[#C8A96A] ml-1 font-semibold">
                {formatCurrency(minBid)}
              </span>
            </p>

            <p className="text-sm text-gray-400 mb-4">
              Ends in: {timeLeft}
            </p>

            <input
              type="number"
              step={increment}
              min={minBid}
              value={bidInput}
              onChange={(e) => {
                if (e.target.value.includes('.')) return
                setBidInput(e.target.value)
              }}
              placeholder={`Min ${minBid}`}
              className="w-full p-3 rounded bg-black/30 border border-white/10 mb-4"
            />

            <button
              onClick={handleBid}
              className="w-full py-3 bg-[#C8A96A] text-black font-bold rounded"
            >
              Place Bid
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}

export default AuctionDetail