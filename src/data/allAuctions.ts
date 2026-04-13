import type { Auction } from '../types/auction'

// Centralized auction dataset - mixed statuses
export const defaultAllAuctions: Auction[] = [
  // Upcoming
  {
    id: '1',
    title: 'Cayman Islands Oceanfront Estate',
    category: 'real-estate',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
    startingBid: 12500000,
    currentBid: 0,
    bidsCount: 0,
    status: 'upcoming',
    timeRemaining: 'Starts in 2d 14h',
    startDate: 'Dec 15, 2024',
    description: 'Exclusive 5BR waterfront villa with private beach',
    location: 'Seven Mile Beach, Grand Cayman'
  },
  {
    id: '2',
    title: 'Ferrari LaFerrari Aperta',
    category: 'cars',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
    startingBid: 3500000,
    currentBid: 0,
    bidsCount: 0,
    status: 'upcoming',
    timeRemaining: 'Starts in 1d 8h',
    startDate: 'Dec 14, 2024',
    description: 'Limited edition hybrid hypercar - 950hp',
    location: 'Monaco'
  },
  {
    id: '3',
    title: 'Sunseeker 90 Yacht',
    category: 'yacht',
    image: 'https://images.unsplash.com/photo-1552518611-2f645e2f9d9d?w=800&h=600&fit=crop',
    startingBid: 8500000,
    currentBid: 0,
    bidsCount: 0,
    status: 'upcoming',
    timeRemaining: 'Starts in 4d 2h',
    startDate: 'Dec 17, 2024',
    description: 'Luxury 90ft motor yacht with flybridge',
    location: 'Cayman Islands'
  },
  // Live
  {
    id: '4',
    title: 'Bugatti Chiron Pur Sport',
    category: 'cars',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop',
    startingBid: 4200000,
    currentBid: 4800000,
    bidsCount: 23,
    status: 'live',
    timeRemaining: '1d 12h left',
    description: '8.6L quad-turbo W16 - 1600hp',
    location: 'Dubai'
  },
  {
    id: '5',
    title: 'Basquiat "Untitled" 1981',
    category: 'art',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    startingBid: 28000000,
    currentBid: 32500000,
    bidsCount: 9,
    status: 'live',
    timeRemaining: '12h 45m left',
    description: 'Graffiti masterpiece from peak period',
    location: 'New York'
  },
  // Ended
  {
    id: '6',
    title: 'Private Island Seven Mile Beach',
    category: 'real-estate',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
    startingBid: 45000000,
    currentBid: 52000000,
    bidsCount: 47,
    status: 'ended',
    timeRemaining: 'Ended 2d ago',
    description: '2.5 acre private island paradise',
    location: 'Cayman Islands'
  },
  {
    id: '7',
    title: 'Picasso "Femme Assise" 1932',
    category: 'art',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    startingBid: 55000000,
    currentBid: 0,
    bidsCount: 0,
    status: 'upcoming',
    timeRemaining: 'Starts in 2d 22h',
    startDate: 'Dec 15, 2024',
    description: 'Blue period oil on canvas',
    location: 'Paris'
  },
  {
    id: '8',
    title: 'Lürssen Superyacht Concept',
    category: 'yacht',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    startingBid: 225000000,
    currentBid: 0,
    bidsCount: 0,
    status: 'upcoming',
    timeRemaining: 'Starts in 7d 12h',
    startDate: 'Dec 20, 2024',
    description: '380ft custom explorer yacht',
    location: 'Monaco'
  }
]

console.log('Loaded all auctions:', defaultAllAuctions)

