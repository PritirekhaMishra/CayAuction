import { Link } from 'react-router-dom'

const AuctionCard = ({ auction }: any) => {
  if (!auction) return null

  // ✅ SAFE ID
  const auctionId = String(auction?.id ?? '')

  // ✅ STATUS (backend compatible)
  const status = auction?.status || 'upcoming'

  // ✅ FIX FIELD MAPPING (IMPORTANT)
  const startingBid = auction?.starting_price ?? 0
const currentBid = auction?.current_price ?? 0
const finalPrice = auction?.final_price ?? 0

const image =
  auction?.images?.[0] ||
  auction?.image ||
  "https://via.placeholder.com/400"
// 🔥 FIXED: correct backend field
const bidCount = Number(auction?.bid_count ?? 0)

// 🔥 FIXED: correct price priority
const price =
  status === 'upcoming'
    ? startingBid
    : finalPrice || currentBid || startingBid
  // ✅ BUTTON TEXT
  let buttonText = 'View Details'
  if (status === 'live') buttonText = 'Place Bid'
  if (status === 'ended') buttonText = 'View Results'

  return (
    <div
      className="group bg-[#0B1C2F]/70 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden 
      shadow-[0_20px_60px_rgba(0,0,0,0.6)] hover:-translate-y-2 hover:shadow-[0_40px_100px_rgba(0,0,0,0.9)] 
      transition-all duration-500 flex flex-col h-full"
    >

      {/* IMAGE */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
  src={image}
  onError={(e) => {
    e.currentTarget.src = "https://via.placeholder.com/400"
  }}
          alt={auction?.title || 'Auction'}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>

        {/* STATUS */}
        <div className="absolute top-3 left-3 text-[10px] px-2 py-1 rounded bg-black/60 text-white uppercase tracking-widest">
          {status}
        </div>

        {/* TIME (OPTIONAL - backend later) */}
        {auction?.time_remaining && (
          <div className="absolute bottom-3 right-3 text-[10px] px-3 py-1 rounded-full bg-black/60 text-white font-mono">
            {auction.timeRemaining}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-6 flex flex-col flex-grow">

        <p className="text-[11px] tracking-widest uppercase text-[#C9A84C] mb-2">
          {auction?.category || 'general'}
        </p>

        <h3 className="text-lg font-semibold text-[#F5F1E8] leading-snug mb-2">
          {auction?.title || 'Untitled Auction'}
        </h3>

        {auction?.location && (
          <p className="text-sm text-[#F5F1E8]/50 mb-3">
            {auction.location}
          </p>
        )}

        <div className="border-t border-white/10 my-3"></div>

        <div className="flex justify-between text-sm text-[#F5F1E8]/60 mb-1">
          <span>
            {status === 'upcoming' ? 'Starting Bid' : 'Live Price'}
          </span>
          <span>
            {bidCount} {bidCount === 1 ? 'Bid' : 'Bids'}
          </span>
        </div>

        <div className="text-xl font-bold text-[#C9A84C] mb-4">
          ${Number(price).toLocaleString('en-US')}
        </div>

        {/* TRUST BADGES (ADD THIS - CLIENT NEED) */}
        <div className="flex gap-2 text-xs text-[#F5F1E8]/60 mb-3">
          <span>✔ Verified</span>
          <span>🔒 Funds Secured</span>
        </div>

        <div className="mt-auto pt-4">
          <Link to={`/auction/${auctionId}`}>
            <button
              className="w-full bg-gradient-to-r from-[#C9A84C] to-[#E2C97E] 
              text-[#040B1A] font-semibold py-3 rounded-full 
              hover:scale-105 transition-all duration-300"
            >
              {buttonText}
            </button>
          </Link>
        </div>

      </div>
    </div>
  )
}

export default AuctionCard