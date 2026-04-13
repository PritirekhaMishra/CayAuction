import type { Auction, FeaturedAuction, UpcomingAuction, SoldAuction } from '../types/auction'

/* ---------------- FEATURED ---------------- */
export const featuredAuctions: FeaturedAuction[] = [
  {
    id: '1',
    title: 'Cayman Islands Waterfront Villa',
    description: 'Exclusive 5BR oceanfront estate with private beach access',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
    currentBid: 12500000,
    timeRemaining: '2d 14h 23m',
    bidsCount: 47,
    status: 'live',
    startingBid: 8500000,
    category: 'real-estate',
    location: 'Seven Mile Beach, Grand Cayman',
    beds: 8,
    baths: 10,
    sqft: '12,400 sq ft'
  },
  {
    id: '2',
    title: 'Ferrari SF90 Stradale',
    description: '2024 hybrid hypercar - 1,000hp - 8 miles',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
    currentBid: 2850000,
    timeRemaining: '1d 8h 12m',
    bidsCount: 23,
    status: 'live',
    startingBid: 2000000,
    category: 'cars',
    location: 'Monaco'
  },
  {
    id: '3',
    title: 'Sunseeker 76 Yacht',
    description: 'Luxury motor yacht',
    image: 'https://images.unsplash.com/photo-1552518611-2f645e2f9d9d?w=800&h=600&fit=crop',
    currentBid: 4850000,
    timeRemaining: '4d 2h 45m',
    bidsCount: 12,
    status: 'live',
    startingBid: 3800000,
    category: 'yacht',
    location: 'Cayman Islands'
  },
  {
    id: '4',
    title: 'Basquiat Untitled 1982',
    description: 'Original artwork',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    currentBid: 32000000,
    timeRemaining: '3d 19h',
    bidsCount: 9,
    status: 'live',
    startingBid: 25000000,
    category: 'art',
    location: 'New York'
  }
]

/* ---------------- LIVE ---------------- */
export const liveAuctions: Auction[] = [
  ...featuredAuctions,
  {
    id: '5',
    title: 'Rolex Daytona Cosmograph',
    description: 'Rare watch',
    image: 'https://images.unsplash.com/photo-1582683855185-05e94500abe3?w=400&h=400&fit=crop',
    currentBid: 125000,
    timeRemaining: '12h 34m',
    bidsCount: 18,
    status: 'live',
    startingBid: 85000,
    category: 'art',
    location: 'Geneva'
  }
]

/* ---------------- UPCOMING ---------------- */
export const defaultUpcomingAuctions: UpcomingAuction[] = [
  {
    id: 'up1',
    title: 'Oceanfront Estate',
    category: 'real-estate',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600',
    startingBid: 12500000,
    currentBid: 0,
    bidsCount: 0,
    status: 'upcoming',
    timeRemaining: '2d 14h',
    startDate: '2026-04-01',
    description: 'Luxury villa',
    location: 'Cayman'
  },
  {
    id: 'up2',
    title: 'Ferrari LaFerrari',
    category: 'cars',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600',
    startingBid: 3500000,
    currentBid: 0,
    bidsCount: 0,
    status: 'upcoming',
    timeRemaining: '1d 8h',
    startDate: '2026-04-02',
    description: 'Hypercar',
    location: 'Italy'
  }
]

export const upcomingAuctions: UpcomingAuction[] = defaultUpcomingAuctions

/* ---------------- SOLD ---------------- */
export const recentlySold: SoldAuction[] = [
  {
    id: '10',
    title: 'Monaco Penthouse',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400',
    soldPrice: 28500000,
    soldDate: '2 days ago'
  }
]