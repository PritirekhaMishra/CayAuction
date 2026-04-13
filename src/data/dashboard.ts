import type { Auction } from '../types/auction'

export interface DashboardData {
  myBids: Auction[]
  watchlist: Auction[]
  notifications: {
    id: string
    title: string
    message: string
    time: string
    type: 'bid' | 'outbid' | 'auction_end'
  }[]
  payments: {
    id: string
    date: string
    amount: number
    status: 'completed' | 'pending' | 'failed'
  }[]
}
