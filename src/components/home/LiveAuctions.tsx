import { liveAuctions } from '../../data/auctions'
import SectionTitle from '../ui/SectionTitle'
import AuctionCard from '../ui/AuctionCard'
import { Link } from 'react-router-dom'
import { useInView } from '../../hooks/useInView'

const LiveAuctions = () => {
  const [inView, ref] = useInView({ threshold: 0.1 })

  return (
    <section
      ref={ref}
      className={`py-12 sm:py-16 lg:py-20 xl:py-24 bg-[#040B1A] bg-gradient-to-b from-[#040B1A] via-[#071329] to-[#0B1C2F] transition-all duration-1000 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-20">
          <SectionTitle title="Live Auctions Now" subtitle="Bidding in Real Time" className="max-w-2xl" />
          <Link
            to="/auctions"
            className="luxury-card inline-flex items-center gap-3 px-12 py-5 text-cream font-semibold rounded-2xl shadow-[0_10px_40px_rgba(201,168,76,0.5)] hover:shadow-[0_20px_60px_rgba(201,168,76,0.7)] hover:scale-105 transition-all duration-300 border border-white/20 hover:border-gold/50"
          >
            View All Live
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {liveAuctions.slice(0, 8).map((auction) => (
            <AuctionCard key={auction.id} auction={auction} variant="regular" />
          ))}
        </div>
      </div>
    </section>
  )
}

export default LiveAuctions

