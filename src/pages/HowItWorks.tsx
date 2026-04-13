import React from "react";

const features = [
  {
    title: "Verified Buyers & Sellers",
    desc: "Every participant undergoes KYC identity verification and financial pre-qualification before gaining bidding access. No anonymous transactions.",
    stat: "100% Verified",
    icon: "🪪"
  },
  {
    title: "Secure Escrow Payments",
    desc: "All funds are held by our licensed escrow partner until title transfer is complete. Your capital is protected at every stage of the transaction.",
    stat: "$2.4B+ Secured",
    icon: "🔒"
  },
  {
    title: "Seller Protection Program",
    desc: "Reserve prices are enforced. Winning bids are legally binding. Our platform guarantees payment settlement within 14 business days of auction close.",
    stat: "14-Day Settlement",
    icon: "🛡️"
  },
  {
    title: "Legal & Regulatory Compliance",
    desc: "CayAuctions operates under Cayman Islands Monetary Authority oversight. All transactions comply with AML/CFT regulations and international standards.",
    stat: "CIMA Compliant",
    icon: "⚖️"
  }
];

const HowItWorks = () => {
  return (
    <div className="bg-[#040B1A] text-white min-h-screen">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* HERO */}
          <section className="text-center py-12 sm:py-16 lg:py-20">
            <p className="text-xs sm:text-sm tracking-[0.3em] text-gray-400 uppercase mb-4">
              Why CayAuctions
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold">
              Built on{" "}
              <span className="text-gradient-gold italic">Trust</span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-gray-400 text-base sm:text-lg leading-relaxed">
              When assets are worth millions, every detail matters. Our platform is engineered 
              for the highest standards of security, transparency, and legal protection.
            </p>
          </section>

          {/* FEATURES GRID */}
          <section className="pb-12 sm:pb-16 lg:pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">

              {features.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#0B1C2F]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                  {/* ICON */}
                  <div className="text-xl sm:text-2xl mb-4 opacity-80">
                    {item.icon}
                  </div>

                  {/* TITLE */}
                  <h3 className="text-base sm:text-lg font-semibold mb-3 text-[#F5F1E8]">
                    {item.title}
                  </h3>

                  {/* DESC */}
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    {item.desc}
                  </p>

                  {/* DIVIDER */}
                  <div className="border-t border-white/10 mb-4"></div>

                  {/* STAT */}
                  <p className="text-[#C9A84C] font-semibold text-base sm:text-lg">
                    {item.stat}
                  </p>
                </div>
              ))}

            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
