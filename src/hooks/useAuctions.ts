import { useEffect, useState } from "react"
import { apiRequest } from "../services/api"

export type Auction = {
  id: number
  title: string
  status: string
  category: string
  image: string
  startingBid: number
  location: string
  endTime: string
}

export const useAuctions = () => {
  // ✅ FIX: give type
  const [auctions, setAuctions] = useState<Auction[]>([])

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await apiRequest("/auctions/")

        if (Array.isArray(res)) {
          const mapped: Auction[] = res.map((a: any) => ({
            id: a.id,
            title: a.title,
            status: a.status,
            category: a.category || "general",

            // ✅ SAFE IMAGE
            image: a.images?.[0] || "https://via.placeholder.com/400",

            // ✅ SAFE NUMBER
            startingBid: Number(a.starting_price) || 0,

            location: "Luxury Auction",

            endTime: a.end_time
          }))

          setAuctions(mapped)
        } else {
          console.error("Invalid auctions response", res)
        }
      } catch (err) {
        console.error("Auction fetch error:", err)
      }
    }

    fetchAuctions()
  }, [])

  return { auctions }
}