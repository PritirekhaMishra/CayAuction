import SectionTitle from '../ui/SectionTitle'
import { useInView } from '../../hooks/useInView'

const trustFeatures = [
  {
    icon: '🔒',
    title: 'Verified Buyers',
    description: 'KYC + ledger-backed provenance for each bidder with multi-party approval.'
  },
  {
    icon: '💳',
    title: 'Secure Escrow Payments',
    description: 'Bank-grade escrow with global settlement and real-time release conditions.'
  },
  {
    icon: '🛡️',
    title: 'Seller Protection',
    description: 'Guaranteed performance, asset authentication, and warranty-backed delivery.'
  }
]

const TrustSection = () => {
  const [inView, ref] = useInView({ threshold: 0.1 })

  return (
    <section
      ref={ref}
      className={`py-12 sm:py-16 lg:py-20 xl:py-24 bg-[#040B1A] bg-gradient-to-b from-[#040B1A] via-[#071329] to-[#0B1C2F] transition-all duration-1000 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center mb-20">
          <SectionTitle title="Built On Trust" subtitle="Security • Transparency • Compliance" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {trustFeatures.map((feature, index) => (
            <div
              key={index}
              className="luxury-card border-white/10 rounded-2xl p-8 md:p-12 text-center flex flex-col items-center gap-6 hover:shadow-cinematic transition-all duration-500 shadow-cinematic"
            >
              <div className="text-5xl md:text-6xl">{feature.icon}</div>
              <h3 className="font-display text-2xl md:text-3xl text-cream font-black leading-tight">{feature.title}</h3>
              <p className="text-cream/70 text-lg leading-relaxed max-w-md mx-auto">{feature.description}</p>
              <div className="mt-4 h-1.5 w-24 md:w-32 rounded-full bg-gradient-to-r from-gold to-gold-light shadow-glow-gold"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustSection

