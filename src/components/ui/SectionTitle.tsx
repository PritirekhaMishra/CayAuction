interface SectionTitleProps {
  title: string
  subtitle?: string
  className?: string
}

const SectionTitle = ({ title, subtitle, className = '' }: SectionTitleProps) => {
  return (
    <div className={`text-center mb-12 sm:mb-16 lg:mb-20 xl:mb-24 ${className}`}>
      {subtitle && (
        <div className="inline-flex items-center justify-center gap-3 px-4 sm:px-5 py-2 bg-navy/30 border border-gold/30 rounded-full text-gold text-xs sm:text-sm uppercase tracking-widest mb-6 shadow-[0_10px_25px_rgba(201,168,76,0.25)]">
          <span className="text-gold/80">{subtitle}</span>
        </div>
      )}
      <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-cream font-playfair font-extrabold tracking-tight leading-[1.05] drop-shadow-2xl">
        {title}
      </h2>
      <div className="mt-2 h-1.5 w-24 sm:w-28 mx-auto bg-gradient-to-r from-gold to-gold-light rounded-full shadow-glow-gold" />
    </div>
  )
}

export default SectionTitle
