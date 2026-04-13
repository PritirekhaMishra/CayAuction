import HeroSection from '../components/home/HeroSection'
import { featuredAuctions } from '../data/auctions'
import type { FeaturedAuction } from '../types/auction'
import FeaturedAuctions from '../components/home/FeaturedAuctions'
import LiveAuctions from '../components/home/LiveAuctions'
import UpcomingAuctions from '../components/home/UpcomingAuctions'
import RecentlySold from '../components/home/RecentlySold'
import TrustSection from '../components/home/TrustSection'

const Home = () => {
  return (
    <>
      <HeroSection auction={featuredAuctions[0]} />
      <FeaturedAuctions />
      <LiveAuctions />
      <UpcomingAuctions />
      <RecentlySold />
      <TrustSection />
    </>
  )
}

export default Home
