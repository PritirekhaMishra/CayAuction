import { Auction } from './auction'

export interface Bid {
  id: string
  bidder: string
  amount: number
  time: string
}

export interface AuctionDetail extends Auction {
  description: string
  condition: string
  provenance: string
  dimensions?: string
  bids: Bid[]
}


