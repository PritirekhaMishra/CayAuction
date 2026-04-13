import { useEffect, useState } from "react"
import { apiRequest } from "../services/api"
import { Users, DollarSign, Wallet, Gavel } from "lucide-react"
import logo from "@/assets/logo.jpeg";

const AdminLayout = () => {
  const [active, setActive] = useState("dashboard")
  const [users, setUsers] = useState<any[]>([])
  const [deposits, setDeposits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(false)

  // ================= FETCH =================
  const fetchUsers = async () => {
    const res = await apiRequest("/admin/users/")
    if (!res) {
      setAuthError(true)
      return
    }
    setUsers(res)
  }

  const fetchDeposits = async () => {
    const res = await apiRequest("/admin/deposits/")
    if (!res) {
      setAuthError(true)
      return
    }
    setDeposits(res)
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchUsers(), fetchDeposits()])
      setLoading(false)
    }
    load()
  }, [])

  // ================= ACTIONS =================
  const approveUser = async (id: number) => {
    await apiRequest(`/admin/approve-user/${id}/`, { method: "POST" })
    fetchUsers()
  }

  const approveDeposit = async (id: number) => {
    await apiRequest(`/admin/approve-deposit/${id}/`, { method: "POST" })
    fetchDeposits()
  }

  // ================= UI =================
  return (
    <div className="flex min-h-screen bg-[#020617] text-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-[#040B1A] border-r border-white/10 p-6">

        <div className="flex items-center gap-3 mb-10">
          <img 
            src={logo} 
            alt="CayAdmin" 
            className="h-8 w-auto object-contain drop-shadow-sm transition-transform duration-300 hover:scale-[1.05]" 
          />
          <h1 className="text-2xl font-bold text-[#C9A84C]">CayAdmin</h1>
        </div>

        <div className="space-y-6">
          <button onClick={() => setActive("dashboard")} className="flex items-center gap-3 hover:text-[#C9A84C]">
            <DollarSign size={18}/> Dashboard
          </button>

          <button onClick={() => setActive("users")} className="flex items-center gap-3 hover:text-[#C9A84C]">
            <Users size={18}/> Users
          </button>

          <button onClick={() => setActive("deposits")} className="flex items-center gap-3 hover:text-[#C9A84C]">
            <Wallet size={18}/> Deposits
          </button>

          <button onClick={() => setActive("auctions")} className="flex items-center gap-3 hover:text-[#C9A84C]">
            <Gavel size={18}/> Auctions
          </button>

          <button onClick={() => setActive("settlements")} className="flex items-center gap-3 hover:text-[#C9A84C]">
            💰 Settlements
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8">

        {authError && (
          <div className="text-red-400 mb-4">
            Session expired. Please login again.
          </div>
        )}

        {/* DASHBOARD */}
        {active === "dashboard" && (
          <div>
            <h2 className="text-3xl text-[#C9A84C] mb-8">Platform Overview</h2>

            <div className="grid grid-cols-4 gap-6">
              <div className="bg-[#0B1C2F] p-6 rounded-xl">
                <p className="text-gray-400">Total Revenue</p>
                <h3 className="text-2xl font-bold text-[#C9A84C]">₹12,50,000</h3>
              </div>

              <div className="bg-[#0B1C2F] p-6 rounded-xl">
                <p className="text-gray-400">Total Users</p>
                <h3 className="text-2xl font-bold">{users.length}</h3>
              </div>

              <div className="bg-[#0B1C2F] p-6 rounded-xl">
                <p className="text-gray-400">Pending Deposits</p>
                <h3 className="text-2xl font-bold text-yellow-400">
                  {deposits.filter(d => d.status !== "approved").length}
                </h3>
              </div>

              <div className="bg-[#0B1C2F] p-6 rounded-xl">
                <p className="text-gray-400">Approved Deposits</p>
                <h3 className="text-2xl font-bold text-green-400">
                  {deposits.filter(d => d.status === "approved").length}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {active === "users" && (
          <div>
            <h2 className="text-2xl mb-6 text-[#C9A84C]">User Management</h2>

            {loading && <p>Loading...</p>}

            {!loading && users.length === 0 && (
              <p className="text-gray-400">No users found</p>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {users.map(user => (
                <div key={user.id} className="bg-[#0B1C2F] p-6 rounded-xl">
                  <p className="text-[#C9A84C] font-semibold">{user.username}</p>
                  <p className="text-gray-400 text-sm">{user.email}</p>

                  {user.status === "approved" ? (
                    <span className="text-green-400">Approved</span>
                  ) : (
                    <button
                      onClick={() => approveUser(user.id)}
                      className="bg-[#C9A84C] text-black px-4 py-2 mt-3 rounded"
                    >
                      Approve
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DEPOSITS */}
        {active === "deposits" && (
          <div>
            <h2 className="text-2xl mb-6 text-[#C9A84C]">Deposit Management</h2>

            {loading && <p>Loading...</p>}

            {!loading && deposits.length === 0 && (
              <p className="text-gray-400">No deposits found</p>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {deposits.map(d => (
                <div key={d.id} className="bg-[#0B1C2F] p-6 rounded-xl">
                  <p>{d.user}</p>
                  <p className="text-[#C9A84C]">₹{d.amount}</p>
                  <p className="text-gray-400 text-sm">UTR: {d.utr_number}</p>

                  {d.status === "approved" ? (
                    <span className="text-green-400">Approved</span>
                  ) : (
                    <button
                      onClick={() => approveDeposit(d.id)}
                      className="bg-green-500 px-4 py-2 mt-3 rounded text-black"
                    >
                      Approve
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUCTIONS */}
        {active === "auctions" && (
          <div>
            <h2 className="text-2xl text-[#C9A84C] mb-6">Auction Monitoring</h2>
            <div className="bg-[#0B1C2F] p-6 rounded-xl">
              Live auction tracking coming next...
            </div>
          </div>
        )}

        {/* SETTLEMENT */}
        {active === "settlements" && (
          <div>
            <h2 className="text-2xl text-[#C9A84C] mb-6">Settlements</h2>

            <div className="bg-[#0B1C2F] p-6 rounded-xl space-y-3">
              <div className="flex justify-between">
                <span>Winning Bid</span>
                <span>₹10,00,000</span>
              </div>

              <div className="flex justify-between">
                <span>Commission (10%)</span>
                <span className="text-[#C9A84C]">₹1,00,000</span>
              </div>

              <div className="flex justify-between">
                <span>Seller Payout</span>
                <span>₹9,00,000</span>
              </div>

              <button className="bg-[#C9A84C] text-black px-5 py-2 rounded mt-4">
                Send Payment
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminLayout