export interface Auction {
  id: string
  title: string
  description: string
  image: string
  currentBid: number
  timeRemaining: string
  bidsCount: number
  status: 'live' | 'upcoming' | 'ended' | 'sold'
  startingBid: number
  reservePrice?: number
  category: 'cars' | 'yacht' | 'real-estate' | 'art'
  location: string

  // optional fields
  beds?: number
  baths?: number
  sqft?: string

  // 🔥 ADD THIS (REQUIRED FIX)
  startDate?: string
}

/* SIMPLE CLEAN EXTENSIONS */

export interface FeaturedAuction extends Auction {}

export interface LiveAuction extends Auction {}

export interface UpcomingAuction extends Auction {
  startDate: string
}

export interface SoldAuction {
  id: string
  title: string
  image: string
  soldPrice: number
  soldDate: string
}