import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const SellerBanks = () => {
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  const fetchBanks = async () => {
    try {
      const res = await apiRequest("/admin/seller-banks/");
      setBanks(Array.isArray(res) ? res : []);
    } catch {
      alert("Failed to load seller banks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  // ================= VERIFY =================
  const verifyBank = async (id: number) => {
    try {
      await apiRequest(`/admin/verify-bank/${id}/`, {
        method: "POST",
      });
      alert("Bank verified");
      fetchBanks(); // 🔥 refresh
    } catch {
      alert("Verification failed");
    }
  };

  // ================= PAY =================
  const paySeller = async (id: number) => {
    try {
      await apiRequest(`/admin/pay-seller/${id}/`, {
        method: "POST",
      });
      alert("Payment successful");
      fetchBanks(); // 🔥 refresh
    } catch {
      alert("Payment failed");
    }
  };

  // ================= LOADING =================
  if (loading) {
    return <div className="p-6 text-white">Loading seller banks...</div>;
  }

  // ================= UI =================
  return (
    <div className="bg-[#111] border border-[#C9A84C]/20 rounded-xl p-6">

      <h2 className="text-xl text-[#C9A84C] mb-6">
        Seller Bank Accounts
      </h2>

      {banks.length === 0 ? (
        <p className="text-gray-400">No seller bank accounts found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">

            {/* HEADER */}
            <thead className="border-b border-white/10 text-gray-400">
              <tr>
                <th className="py-3">User</th>
                <th>Email</th>
                <th>Account Holder</th>
                <th>Bank</th>
                <th>Account No</th>
                <th>IFSC</th>
                <th>Status</th>
                <th>Actions</th> {/* 🔥 NEW */}
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {banks.map((b) => (
                <tr key={b.id} className="border-b border-white/5">

                  <td className="py-4">{b.user}</td>
<td>{b.email}</td>
<td>{b.account_holder}</td>
<td>{b.bank_name}</td>
<td>{b.account_number}</td>
<td>{b.ifsc_code}</td>

                  {/* STATUS */}
                  <td>
                    <span className={`px-2 py-1 rounded text-sm ${
                      b.is_verified
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {b.is_verified ? "Verified" : "Pending"}
                    </span>
                  </td>

                  {/* 🔥 ACTION BUTTONS */}
                  <td className="flex gap-2 py-2">

                    {/* VERIFY */}
                    {!b.is_verified && (
                      <button
                        onClick={() => verifyBank(b.id)}
                        className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                      >
                        Verify
                      </button>
                    )}

                    {/* PAY (ONLY IF VERIFIED) */}
                    {b.is_verified && (
                      <button
                        onClick={() => paySeller(b.id)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                      >
                        Pay
                      </button>
                    )}

                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default SellerBanks;