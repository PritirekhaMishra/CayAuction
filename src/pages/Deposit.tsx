import { useState, useEffect } from "react";

const Deposit = () => {
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [bank, setBank] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ================= FETCH BANK DETAILS =================
  const fetchBank = async () => {
    try {
      const res = await fetch("/api/admin/bank/", {
        credentials: "include"
      });
      const data = await res.json();
      console.log("BANK:", data);
      setBank(data);
    } catch (err) {
      console.error("Bank fetch error", err);
    }
  };

  // ================= SUBMIT =================
  const submitDeposit = async () => {
    if (!amount || !utr) {
      alert("Please enter amount and UTR");
      return;
    }

    if (Number(amount) <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/deposit/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount,
          utr_number: utr
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Submitted for verification");
        setAmount("");
        setUtr("");
        fetchHistory();
      } else {
        alert(data.error || "Submission failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }

    setLoading(false);
  };

  // ================= HISTORY =================
  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/deposit-history/", {
        credentials: "include"
      });
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchBank();
  }, []);

  // ================= HELPERS =================
  const formatDate = (date: string) =>
    new Date(date).toLocaleString();

  const formatCurrency = (value: number) =>
    `$${Number(value).toLocaleString()}`;

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-[#020617] text-white p-10">

      {/* TITLE */}
      <h1 className="text-3xl font-bold text-[#C9A84C] mb-8">
        Add Funds
      </h1>

      {/* 🔥 PREMIUM BANK CARD */}
      {bank && bank.account_holder ? (
        <div className="bg-gradient-to-br from-[#0B1C2F] to-[#020617] p-6 rounded-xl border border-[#C9A84C]/30 shadow-lg mb-8">

          <h3 className="text-lg font-semibold text-[#C9A84C] mb-4">
            Transfer to Admin Account
          </h3>

          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-400">Name:</span> {bank.account_holder}
            </p>

            <p>
              <span className="text-gray-400">Bank:</span> {bank.bank_name}
            </p>

            <p>
              <span className="text-gray-400">Account No:</span> {bank.account_number}
              <button
                onClick={() => copyText(bank.account_number)}
                className="ml-2 text-[#C9A84C]"
              >
                Copy
              </button>
            </p>

            <p>
              <span className="text-gray-400">IFSC:</span> {bank.ifsc}
            </p>

            {bank.upi && (
              <p>
                <span className="text-gray-400">UPI:</span> {bank.upi}
                <button
                  onClick={() => copyText(bank.upi)}
                  className="ml-2 text-[#C9A84C]"
                >
                  Copy
                </button>
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-gray-400 mb-6">
          Admin has not added bank details yet
        </p>
      )}

      {/* FORM */}
      <div className="bg-[#0B1C2F] p-6 rounded-xl border border-[#C9A84C]/20 max-w-md shadow-lg">

        <input
          type="number"
          placeholder="Enter Amount ($)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full mb-4 p-3 bg-[#020617] border border-[#C9A84C]/20 rounded-lg focus:outline-none"
        />

        <input
          type="text"
          placeholder="Enter UTR / Transaction ID"
          value={utr}
          onChange={(e) => setUtr(e.target.value)}
          className="w-full mb-4 p-3 bg-[#020617] border border-[#C9A84C]/20 rounded-lg focus:outline-none"
        />

        <button
          onClick={submitDeposit}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold ${
            loading
              ? "bg-gray-500"
              : "bg-[#C9A84C] text-black hover:opacity-90"
          }`}
        >
          {loading ? "Submitting..." : "Submit for Verification"}
        </button>
      </div>

      {/* HISTORY */}
      <div className="mt-10">
        <h2 className="text-xl mb-4">Deposit History</h2>

        {history.length === 0 ? (
          <p className="text-gray-400">No deposits yet</p>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:justify-between gap-2 bg-[#0B1C2F] p-4 mb-3 rounded-lg shadow"
            >
              <div>
                <p className="font-semibold">
                  {formatCurrency(item.amount)}
                </p>
                <p className="text-sm text-gray-400">
                  UTR: {item.utr_number}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(item.created_at)}
                </p>
              </div>

              <div className="flex items-center">
                <span
                  className={
                    item.status === "approved"
                      ? "text-green-400 font-semibold"
                      : item.status === "rejected"
                      ? "text-red-400 font-semibold"
                      : "text-yellow-400 font-semibold"
                  }
                >
                  {item.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Deposit;