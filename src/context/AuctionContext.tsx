import { createContext, useContext, useState, useEffect } from "react"
import { apiRequest } from "../services/api"
import { useAuth } from "./AuthContext"   // ✅ ADD THIS
import { useNavigate } from "react-router-dom"

const AuctionContext = createContext<any>(null)

export const AuctionProvider = ({ children }: any) => {
  const [auctions, setAuctions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()   // ✅ AUTH
  const navigate = useNavigate()

  // =========================
  // FETCH AUCTIONS
  // =========================
  const fetchAuctions = async () => {
    try {
      const data = await apiRequest("/auctions/")

      if (data) {
        setAuctions(data)
      }

      setLoading(false)
    } catch (err) {
      console.error("Error fetching auctions:", err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuctions()
  }, [])

  // =========================
  // AUTO REFRESH (REAL-TIME)
  // =========================
  useEffect(() => {
    const interval = setInterval(fetchAuctions, 5000)
    return () => clearInterval(interval)
  }, [])

  // =========================
  // 🔥 PLACE BID (FIXED)
  // =========================
  const placeBid = async (id: string, amount: number) => {
    try {
      // ❌ NOT LOGGED IN
      if (!user) {
        alert("Please login first")
        navigate("/login")
        return
      }

      // ❌ INVALID INPUT
      if (!amount || amount <= 0) {
        alert("Enter valid amount")
        return
      }

      // =========================
      // API CALL
      // =========================
      const res = await apiRequest("/bid/", {
        method: "POST",
        body: JSON.stringify({
          auction_id: id,
          amount: Number(amount)   // ✅ FORCE NUMBER
        })
      })

      // =========================
      // HANDLE RESPONSE
      // =========================
      if (!res) {
        alert("Network error")
        return
      }

      if (res.error) {
        alert(res.error)

        // 🔥 REDIRECT TO DEPOSIT IF NO FUNDS
        if (res.error.toLowerCase().includes("insufficient")) {
          navigate("/deposit")
        }

        return
      }

      // =========================
      // ✅ SUCCESS
      // =========================
      alert("✅ Bid placed successfully")

      // 🔥 INSTANT UI UPDATE (OPTIMISTIC)
      setAuctions(prev =>
        prev.map(a =>
          a.id === id
            ? {
                ...a,
                current_price: Number(res.current_price),
                previous_bid: Number(res.previous_bid),
                min_next_bid: Number(res.min_next_bid)
              }
            : a
        )
      )

      // 🔄 BACKGROUND REFRESH (SYNC WITH DB)
      fetchAuctions()

    } catch (err) {
      console.error(err)
      alert("Something went wrong")
    }
  }

  // =========================
  // END AUCTION (FUTURE)
  // =========================
  const endAuction = async (id: string) => {
    try {
      alert("End auction handled by backend")
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <AuctionContext.Provider
      value={{
        auctions,
        loading,
        placeBid,
        endAuction,
        refresh: fetchAuctions
      }}
    >
      {children}
    </AuctionContext.Provider>
  )
}

export const useAuction = () => useContext(AuctionContext)