import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#020817] border-t border-white/10">

      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 md:gap-12">


          {/* LEFT */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-serif">Cay<span className="text-[#C9A84C]">Auctions</span></span>
            </div>
            <p className="text-gray-400 mt-4 text-sm">
              The Cayman Islands' Premier Luxury Auction Marketplace
            </p>
          </div>

          {/* CENTER */}
          <div>
            <h3 className="text-sm text-gray-400 mb-4">
              How Auctions Work
            </h3>

            <ul className="space-y-2 text-gray-300 text-sm">

              <li>
                <Link to="/how-it-works" className="hover:text-white transition">
                  Buyer Registration
                </Link>
              </li>

              <li>
                <Link to="/sell" className="hover:text-white transition">
                  Seller Listings
                </Link>
              </li>

              <li>
                <Link to="/auctions" className="hover:text-white transition">
                  Browse Auctions
                </Link>
              </li>

            </ul>
          </div>

          {/* RIGHT */}
          <div>
            <h3 className="text-sm text-gray-400 mb-4">
              Terms & Policies
            </h3>

            <ul className="space-y-2 text-gray-300 text-sm">

              <li>
                <Link to="/privacy" className="hover:text-white transition">
                  Privacy
                </Link>
              </li>

              <li>
                <Link to="/terms" className="hover:text-white transition">
                  Terms
                </Link>
              </li>

              <li>
                <Link to="/accessibility" className="hover:text-white transition">
                  Accessibility
                </Link>
              </li>

            </ul>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 text-center text-gray-500 text-sm">
          © 2026 CayAuctions Ltd. All Rights Reserved. Grand Cayman, KY1
        </div>
      </div>

    </footer>
  );
};

export default Footer;