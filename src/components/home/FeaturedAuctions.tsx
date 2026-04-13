import { featuredAuctions } from '../../data/auctions'
import SectionTitle from '../ui/SectionTitle'
import AuctionCard from '../ui/AuctionCard'
import { useInView } from '../../hooks/useInView'

const FeaturedAuctions = () => {
  const [inView, ref] = useInView({ threshold: 0.1 })

  return (
    <section
      ref={ref}
      className={`py-12 sm:py-16 lg:py-20 xl:py-24 bg-[#040B1A] bg-gradient-to-b from-[#040B1A] via-[#071329] to-[#0B1C2F] transition-all duration-1000 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      }`}
    >
      <div className="max-w-7xl mx-auto px-2 md:px-5">
        <SectionTitle title="Featured Auctions" subtitle="Curated Premium Assets" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-16">
          {featuredAuctions.map((auc) => (
            <AuctionCard key={auc.id} auction={auc} variant="featured" />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedAuctions

