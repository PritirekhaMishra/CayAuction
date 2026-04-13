import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiRequest } from "../services/api"

const Dashboard = () => {
  const navigate = useNavigate()

  const [wallet, setWallet] = useState({
    available_balance: 0,
    hold_balance: 0
  })

  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [withdrawAmount, setWithdrawAmount] = useState("")

  // =========================
  // LOAD USER
  // =========================
  useEffect(() => {
    const loadUser = async () => {
      const data = await apiRequest("/user/")

      if (!data || data.error) {
        navigate("/login")
        return
      }

      setUser(data)
    }

    loadUser()
  }, [navigate])

  // =========================
  // LOAD WALLET
  // =========================
  useEffect(() => {
    if (!user) return

    const loadWallet = async () => {
      const data = await apiRequest("/wallet/")

      if (!data || data.error) return

      setWallet(data)
      setLoading(false)
    }

    loadWallet()

    const interval = setInterval(loadWallet, 3000)
    return () => clearInterval(interval)

  }, [user])

  // =========================
  // AUTO TAB SWITCH
  // =========================
  useEffect(() => {
    if (!loading && wallet.available_balance === 0) {
      setActiveTab("wallet")
    }
  }, [wallet, loading])

  // =========================
  // WITHDRAW FUNCTION
  // =========================
  const handleWithdraw = async () => {
  const res = await apiRequest("/withdraw/", {
    method: "POST",
    body: { amount: Number(withdrawAmount) } // ✅ FIX
  })

  if (res.error) {
    alert(res.error)
    return
  }

  alert("Withdraw request sent")
}
  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#040B1A]">
        Loading dashboard...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#040B1A] to-[#020617] text-white pt-28 pb-20 px-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-3">
          Dashboard
        </h1>

        <p className="text-gray-400 mb-10">
          Manage your auctions, bids & wallet
        </p>

        {/* CARDS */}
        <div className="grid md:grid-cols-3 gap-8 mb-10">

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-700 blur-xl opacity-20 group-hover:opacity-40 transition"></div>
            <div className="relative bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl">
              <p className="text-gray-400 text-sm">Available Balance</p>
              <h2 className="text-3xl font-bold text-yellow-400 mt-2">
                ${wallet.available_balance.toLocaleString()}
              </h2>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 blur-xl opacity-20 group-hover:opacity-40 transition"></div>
            <div className="relative bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl">
              <p className="text-gray-400 text-sm">Funds on Hold</p>
              <h2 className="text-3xl font-bold mt-2">
                ${wallet.hold_balance.toLocaleString()}
              </h2>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 blur-xl opacity-20 group-hover:opacity-40 transition"></div>
            <div className="relative bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-lg">
                {user?.name?.[0] || "U"}
              </div>
              <div>
                <p className="font-semibold text-lg">{user?.name}</p>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>

        </div>

        {/* TABS */}
        <div className="flex gap-6 border-b border-white/10 mb-8">
          {["overview", "wallet", "withdraw"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 capitalize transition ${
                activeTab === tab
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-xl">
            <h3 className="text-xl font-semibold mb-2">Account Summary</h3>
            <p className="text-gray-400">
              Your account is active and ready for premium auctions.
            </p>
          </div>
        )}

        {/* WALLET */}
        {activeTab === "wallet" && (
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-xl">
            <h3 className="text-xl font-semibold mb-6">Wallet Details</h3>

            <div className="space-y-3 mb-6 text-lg">
              <p>Available: <span className="text-yellow-400">${wallet.available_balance}</span></p>
              <p>On Hold: <span className="text-blue-400">${wallet.hold_balance}</span></p>
            </div>

            <button
              onClick={() => navigate("/deposit")}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-3 rounded-xl font-semibold shadow-lg"
            >
              ➕ Add Funds
            </button>
          </div>
        )}

        {/* WITHDRAW ✅ FIXED */}
        {activeTab === "withdraw" && (
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-xl">

            <h3 className="text-xl font-semibold mb-6">Withdraw Funds</h3>

            <div className="space-y-4">

              <input
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full p-3 rounded bg-[#020617] border border-white/10"
              />

              <button
                onClick={handleWithdraw}
                className="bg-gradient-to-r from-red-400 to-red-600 text-black px-6 py-3 rounded-xl font-semibold"
              >
                Request Withdraw
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default Dashboard