import React, { useState, useCallback, useEffect } from 'react'
import type { UpcomingAuction } from '../types/auction'

interface UpcomingFiltersProps {
  onFilterChange: (filters: {
    search: string
    status: 'all' | 'upcoming' | 'live'
    category: string
  }) => void
}

const categories = ['All', 'real-estate', 'cars', 'art', 'yacht']

export const UpcomingFilters = ({ onFilterChange }: UpcomingFiltersProps) => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'upcoming' | 'live'>('all')
  const [category, setCategory] = useState('All')

  const handleFilterChange = useCallback(() => {
    onFilterChange({ search, status, category })
  }, [search, status, category, onFilterChange])

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(handleFilterChange, 300)
    return () => clearTimeout(timeout)
  }, [search, handleFilterChange])

  useEffect(() => {
    handleFilterChange()
  }, [status, category, handleFilterChange])

  return (
    <aside className="w-full lg:w-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
      <div className="space-y-6 sm:space-y-8">

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Search Auctions</label>
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all"
          />
        </div>

        {/* Status Filter */}
        {/* Status Filter */}
<div>
  <label className="block text-sm font-medium text-gray-300 mb-3">
    Auction Status
  </label>

  <select
    value={status}
    onChange={(e) =>
      setStatus(e.target.value as 'all' | 'upcoming' | 'live')
    }
    className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
  >
    <option value="all">All</option>
    <option value="upcoming">Upcoming</option>
    <option value="live">Live</option>
  </select>
</div>
        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-4">Categories</label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat === 'All' ? 'All' : cat)}
                className={`px-4 py-3 rounded-xl text-sm transition-all border-2 ${
                  category === cat
                    ? 'bg-gradient-to-r from-[#C9A84C] to-[#E2C97E] text-black border-gold font-semibold shadow-gold'
                    : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/40 hover:shadow-lg'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

