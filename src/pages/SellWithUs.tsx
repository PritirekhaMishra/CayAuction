import React from "react";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    title: "Submit Your Asset",
    desc: "Provide details about your luxury asset including images, specifications, and documentation."
  },
  {
    title: "Expert Valuation",
    desc: "Our specialists evaluate your asset and determine optimal pricing strategy."
  },
  {
    title: "Global Marketing",
    desc: "We promote your asset to verified high-net-worth buyers worldwide."
  },
  {
    title: "Auction & Settlement",
    desc: "Secure bidding process with escrow protection and fast settlement."
  }
];

const benefits = [
  {
    title: "Global Exposure",
    desc: "Reach verified buyers across 38+ countries with high purchasing power."
  },
  {
    title: "Premium Valuation",
    desc: "Maximize asset value through expert pricing and competitive bidding."
  },
  {
    title: "Secure Transactions",
    desc: "All transactions protected via escrow and legal compliance."
  },
  {
    title: "Dedicated Support",
    desc: "Personal account manager guides you through entire process."
  }
];

const SellWithUs = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#030A18] text-white min-h-screen">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* 🔥 HERO */}
          <section className="relative h-[70vh] sm:h-[80vh] lg:h-[85vh] flex items-center mb-12 sm:mb-16 lg:mb-24">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/70" />

            <div className="relative z-10">
              <p className="text-xs sm:text-sm tracking-[0.35em] text-gray-400 uppercase mb-4">
                Sell With CayAuctions
              </p>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif">
                Turn Your Asset Into{" "}
                <span className="text-[#C9A84C] italic">Maximum Value</span>
              </h1>

              <p className="mt-6 max-w-xl text-gray-400 text-base sm:text-lg">
                Sell luxury real estate, exotic cars, yachts, and fine art
                through a secure, global, high-value auction ecosystem.
              </p>
            </div>
          </section>

          {/* 🔥 BENEFITS */}
          <section className="py-12 sm:py-16 lg:py-20">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif mb-4">
                Why Sell With Us
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                Built for high-value assets and serious buyers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
              {benefits.map((b, i) => (
                <div key={i} className="bg-[#0B1C2F]/60 p-4 sm:p-6 lg:p-8 rounded-2xl">
                  <h3 className="text-lg sm:text-xl mb-3">{b.title}</h3>
                  <p className="text-gray-400 text-sm">{b.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 🔥 PROCESS */}
          <section className="py-12 sm:py-16 lg:py-20 bg-[#071422]">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">

                <div className="text-center mb-12 sm:mb-16">
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif">
                    How It Works
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
                  {steps.map((step, i) => (
                    <div key={i} className="bg-[#0B1C2F] p-4 sm:p-6 lg:p-8 rounded-2xl">
                      <h3 className="text-lg sm:text-xl mb-2">{step.title}</h3>
                      <p className="text-gray-400 text-sm">{step.desc}</p>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </section>

          {/* 🔥 CTA */}
          <section className="py-12 sm:py-16 lg:py-20 text-center">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6">
                  Ready to Sell Your Asset?
                </h2>

                <p className="text-gray-400 mb-10 text-base sm:text-lg">
                  Join a trusted global auction platform and maximize your returns.
                </p>

                <button
                onClick={() => {
                  console.log("clicked");   // 🔥 debug
                  navigate("/seller-login");
                }}
                className="px-8 sm:px-12 py-4 sm:py-5 bg-[#C9A84C] text-black rounded-full font-semibold text-base sm:text-lg"
              >
                Submit Your Asset
              </button>

              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default SellWithUs;
