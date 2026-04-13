import SectionTitle from '../ui/SectionTitle'
import { recentlySold } from '../../data/auctions'
import { Link } from 'react-router-dom'
import { useInView } from '../../hooks/useInView'

const RecentlySold = () => {
  const [inView, ref] = useInView({ threshold: 0.1 })

  return (
    <section
      ref={ref}
      className={`py-12 sm:py-16 lg:py-20 xl:py-24 bg-[#040B1A] bg-gradient-to-b from-[#040B1A] via-[#071329] to-[#0B1C2F] transition-all duration-1000 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <SectionTitle title="Recently Sold" subtitle="Premium Auction Results" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {recentlySold.slice(0, 6).map((item) => (
            <article key={item.id} className="luxury-card group overflow-hidden rounded-2xl p-6 md:p-8 border border-white/10 hover:shadow-cinematic transition-all duration-500">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-6">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-gradient-to-r from-gold/90 to-yellow-400/90 text-[#040B1A] px-4 py-2 rounded-2xl text-sm font-bold uppercase tracking-wider shadow-lg">
                  SOLD
                </div>
              </div>

              <h3 className="font-display text-xl md:text-2xl text-cream mb-3 line-clamp-2 leading-tight">{item.title}</h3>
              <p className="text-3xl md:text-4xl font-black text-gold mb-2">${item.soldPrice.toLocaleString()}</p>
              <p className="text-cream/60 uppercase tracking-widest text-sm font-medium">{item.soldDate}</p>
            </article>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link
            to="/auctions"
            className="luxury-card inline-flex items-center gap-3 px-12 py-5 text-cream font-bold rounded-2xl shadow-[0_10px_40px_rgba(201,168,76,0.5)] hover:shadow-[0_20px_60px_rgba(201,168,76,0.7)] hover:scale-105 transition-all duration-300 border border-white/20 hover:border-gold/50 text-lg"
          >
            Explore Past Sales
          </Link>
        </div>
      </div>
    </section>
  )
}

export default RecentlySold

