import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

const SellerDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [active, setActive] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [accountHolder, setAccountHolder] = useState("");
const [bankName, setBankName] = useState("");
const [accountNumber, setAccountNumber] = useState("");
const [ifsc, setIfsc] = useState("");
const [saving, setSaving] = useState(false);
const [wallet, setWallet] = useState<any>(null);
const [withdrawAmount, setWithdrawAmount] = useState("");


// ✅ ADD HERE
const saveBank = async () => {
  try {
    setSaving(true);

    const res = await fetch("/api/save-bank/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        account_holder: accountHolder,
        bank_name: bankName,
        account_number: accountNumber,
        ifsc: ifsc
      })
    });

    const data = await res.json();
    alert(data.message || "Saved successfully");
  } catch {
    alert("Error saving bank details");
  } finally {
    setSaving(false);
  }
};
const requestWithdraw = async () => {
  try {
    const res = await fetch("/api/withdraw/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        amount: withdrawAmount
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Withdraw failed");
      return;
    }

    alert("Withdraw request sent");
    setWithdrawAmount("");
    fetchDashboard(); // refresh wallet
  } catch {
    alert("Error requesting withdraw");
  }
};
  const fetchDashboard = async () => {
    const res = await fetch("/api/seller/dashboard/", {
  credentials: "include"
  });
   
    const result = await res.json();

    if (!res.ok) {
      window.location.href = "/seller-login";
      return;
    }

    setData(result);
    setWallet(result.wallet);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="text-white p-10">Loading...</div>;
  }

  const stats = data.stats;
  const listings = data.listings;
  const subscription = data.subscription;
  const isSeller = data.is_seller;
  const formatDuration = (hours: number) => {
  if (!hours) return "0m";

  const totalMinutes = Math.floor(hours * 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hrs = Math.floor((totalMinutes % (60 * 24)) / 60);
  const mins = totalMinutes % 60;

  let result = "";
  if (days > 0) result += `${days}d `;
  if (hrs > 0) result += `${hrs}h `;
  if (mins > 0) result += `${mins}m`;

  return result;
};

const getTimeLeft = (endDate?: string) => {
  if (!endDate) return "No expiry";

  const now = new Date();
  const end = new Date(endDate);

  if (isNaN(end.getTime())) return "Invalid date";

  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);

  return `${days}d ${hrs}h left`;
};
  return (
    <div className="flex min-h-screen bg-[#020617] text-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-[#040B1A] border-r border-[#C9A84C]/40 p-6">

        <h1 className="text-2xl font-bold text-[#C9A84C] mb-10">
          CaySeller
        </h1>

        <div className="space-y-6 text-sm">
          <p
            onClick={() => setActive("dashboard")}
            className={`cursor-pointer ${
              active === "dashboard" ? "text-[#C9A84C]" : ""
            }`}
          >
            Dashboard
          </p>

          <p
            onClick={() => setActive("listings")}
            className={`cursor-pointer ${
              active === "listings" ? "text-[#C9A84C]" : ""
            }`}
          >
            Listings
          </p>

          <p
            onClick={() => setActive("earnings")}
            className={`cursor-pointer ${
              active === "earnings" ? "text-[#C9A84C]" : ""
            }`}
          >
            Earnings
          </p>
          <p
  onClick={() => setActive("wallet")}
  className={`cursor-pointer ${
    active === "wallet" ? "text-[#C9A84C]" : ""
  }`}
>
  Wallet
</p>
          <p
  onClick={() => setActive("bank")}
  className={`cursor-pointer ${
    active === "bank" ? "text-[#C9A84C]" : ""
  }`}
>
  Bank Account
</p>

        </div>

      </div>

      {/* MAIN */}
      <div className="flex-1 p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl text-[#C9A84C] font-semibold">
            Seller Dashboard
          </h1>

          <button
            onClick={() => {
  if (!subscription) {
    navigate("/subscription");
  } else {
    navigate("/create-listing");
  }
}}
            className="bg-[#C9A84C] text-black px-5 py-2 rounded-lg font-semibold"
          >
            + Add Listing
          </button>
        </div>

        {/* ================= DASHBOARD ================= */}
        {active === "dashboard" && (
          <>
          {/* SUBSCRIPTION PANEL */}
            {!subscription && (
              <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl mb-6">
                <p className="text-red-400 font-semibold">
                  No active subscription
                </p>

                <button
                  onClick={() => navigate("/subscription")}
                  className="mt-3 bg-[#C9A84C] text-black px-4 py-2 rounded"
                >
                  Buy Plan
                </button>
              </div>
            )}

            {subscription && (
              <div className="bg-[#0B1C2F] p-6 rounded-xl border border-white/10 mb-6">
                <h2 className="text-[#C9A84C] mb-2">Subscription</h2>

                <p>Plan: {subscription.plan}</p>
                <p>
                  Usage: {subscription.used} / {subscription.limit}
                </p>
                <p>
                  Remaining: {subscription.remaining}
                </p>
                <p className={`mt-2 font-semibold ${
  subscription.remaining <= 0 ? "text-red-400" : "text-yellow-400"
}`}>
  {getTimeLeft(subscription.end_date)}
</p>

{subscription.remaining <= 0 && (
  <button
    onClick={() => navigate("/subscription")}
    className="mt-3 bg-red-500 px-4 py-2 rounded text-white"
  >
    Upgrade Plan
  </button>
)}
              </div>
            )}
            
            {/* STATS */}
            <div className="grid md:grid-cols-4 gap-6 mb-10">

              <Card title="Total Listings" value={stats.total_listings} />
              <Card title="Approved" value={stats.approved} color="text-green-400" />
              <Card title="Pending" value={stats.pending} color="text-yellow-400" />
              <Card title="Rejected" value={stats.rejected} color="text-red-400" />

            </div>

            {/* FINANCIAL */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">

              <Card title="Total Sales" value={stats.total_sales} />
              <Card
                title="Total Earnings"
                value={`₹${stats.total_earnings}`}
                color="text-green-400"
              />

            </div>

            {/* CHARTS */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* LINE CHART */}
              <div className="bg-[#0B1C2F] p-6 rounded-xl border border-white/10">
                <h2 className="text-[#C9A84C] mb-4">Earnings Trend</h2>

                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={listings}>
                    <CartesianGrid stroke="#1f2937" />
                    <XAxis dataKey="title" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="starting_price"
                      stroke="#C9A84C"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* BAR CHART */}
              <div className="bg-[#0B1C2F] p-6 rounded-xl border border-white/10">
                <h2 className="text-[#C9A84C] mb-4">Listing Prices</h2>

                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={listings}>
                    <CartesianGrid stroke="#1f2937" />
                    <XAxis dataKey="title" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Bar dataKey="starting_price" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
          </>
        )}

        {/* ================= LISTINGS ================= */}
        {active === "listings" && (
          <div className="bg-[#0B1C2F] p-6 rounded-xl border border-white/10">

            <h2 className="text-xl mb-6 text-[#C9A84C]">
              Your Listings
            </h2>

            {listings.length === 0 && <p>No listings yet</p>}

            {listings.length > 0 && (
              <table className="w-full text-left">

                <thead>
                  <tr className="text-gray-400 border-b border-white/10">
                    <th className="py-3">Title</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
  {listings.map((l: any) => (
    <tr key={l.id} className="border-b border-white/5">

      {/* TITLE */}
      <td className="py-4">{l.title}</td>

      {/* PRICE */}
      <td>
        <div className="space-y-1">

          <div className="text-xs text-gray-500">
            Seller Price
          </div>

          <div className={`text-sm ${
            l.status === "approved"
              ? "line-through text-red-400"
              : "text-white"
          }`}>
            ${Number(l.starting_price).toLocaleString("en-US")}
          </div>

          {l.status === "approved" && l.admin_price && (
            <>
              <div className="text-xs text-yellow-400">
                Admin Updated Price
              </div>
              <div className="text-yellow-300 font-medium">
                ${Number(l.admin_price).toLocaleString("en-US")}
              </div>
            </>
          )}

          {l.status === "approved" && l.current_price != null && (
            <>
              <div className="text-xs text-gray-500 mt-1">
                Current Auction Price
              </div>
              <div className="text-green-400 font-semibold text-lg">
                ${Number(l.current_price).toLocaleString("en-US")}
              </div>
            </>
          )}

        </div>
      </td>

      {/* ADMIN */}
      <td>
        {l.admin_increment !== null && (
          <div className="bg-[#111] border border-[#C9A84C]/20 rounded-lg p-3 space-y-2">

            <p className="text-xs text-[#C9A84C] mb-1">
              Admin Settings
            </p>

            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Increment</span>
              <span className="text-white font-medium">
                ${Number(l.admin_increment).toLocaleString("en-US")}
              </span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Commission</span>
              <span className="text-white font-medium">
                {l.admin_commission}%
              </span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Duration</span>
              <span className="text-white font-medium">
                {formatDuration(l.admin_duration_hours)}
              </span>
            </div>

          </div>
        )}
      </td>

      {/* STATUS */}
      <td>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            l.status === "approved"
              ? "bg-green-500/20 text-green-400"
              : l.status === "rejected"
              ? "bg-red-500/20 text-red-400"
              : "bg-yellow-500/20 text-yellow-400"
          }`}
        >
          {l.status}
        </span>
      </td>

    </tr>
  ))}
</tbody>

              </table>
            )}

          </div>
        )}

        {/* ================= EARNINGS ================= */}
        {active === "earnings" && (
          <div className="bg-[#0B1C2F] p-6 rounded-xl border border-white/10">

            <h2 className="text-xl text-[#C9A84C] mb-6">
              Earnings Summary
            </h2>

            <p className="text-gray-400 mb-2">
              Total Sales: {stats.total_sales}
            </p>

            <p className="text-green-400 text-2xl">
              ${Number(stats.total_earnings).toLocaleString("en-US")}
            </p>

          </div>
        )}
        {/* ================= BANK ================= */}
{active === "bank" && (
  <div className="bg-[#0B1C2F] p-6 rounded-xl border border-white/10 max-w-xl">

    <h2 className="text-xl text-[#C9A84C] mb-6">
      Bank Account Details
    </h2>

    <div className="space-y-4">

      <input
        value={accountHolder}
        onChange={(e) => setAccountHolder(e.target.value)}
        placeholder="Account Holder Name"
        className="w-full p-3 rounded bg-[#020617] border border-white/10"
      />

      <input
        value={bankName}
        onChange={(e) => setBankName(e.target.value)}
        placeholder="Bank Name"
        className="w-full p-3 rounded bg-[#020617] border border-white/10"
      />

      <input
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
        placeholder="Account Number"
        className="w-full p-3 rounded bg-[#020617] border border-white/10"
      />

      <input
        value={ifsc}
        onChange={(e) => setIfsc(e.target.value)}
        placeholder="IFSC Code"
        className="w-full p-3 rounded bg-[#020617] border border-white/10"
      />

      <button
        onClick={saveBank}
        disabled={saving}
        className="bg-[#C9A84C] text-black px-5 py-2 rounded-lg font-semibold w-full"
      >
        {saving ? "Saving..." : "Save Bank Details"}
      </button>

    </div>
  </div>
)}
{active === "wallet" && (
  <div className="bg-[#0B1C2F] p-6 rounded-xl border border-white/10 max-w-xl">

    <h2 className="text-xl text-[#C9A84C] mb-6">
      Wallet
    </h2>

    {/* BALANCE */}
    <div className="mb-6">
      <p className="text-gray-400">Available Balance</p>
      <h2 className="text-3xl text-green-400">
        ₹{wallet?.available_balance || 0}
      </h2>
    </div>

    {/* WITHDRAW */}
    <div className="space-y-4">

      <input
        type="number"
        value={withdrawAmount}
        onChange={(e) => setWithdrawAmount(e.target.value)}
        placeholder="Enter amount to withdraw"
        className="w-full p-3 rounded bg-[#020617] border border-white/10"
      />

      <button
        onClick={requestWithdraw}
        className="bg-[#C9A84C] text-black px-5 py-2 rounded-lg font-semibold w-full"
      >
        Request Withdraw
      </button>

    </div>

  </div>
)}

      </div>
    </div>
  );
  
};


const Card = ({ title, value, color = "" }: any) => (
  <div className="bg-[#0B1C2F] p-6 rounded-xl border border-white/10">
    <p className="text-gray-400">{title}</p>
    <h2 className={`text-2xl mt-2 ${color}`}>{value}</h2>
  </div>
);

export default SellerDashboard;