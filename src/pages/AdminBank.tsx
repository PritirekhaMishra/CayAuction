import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const AdminBank = () => {
  const [bank, setBank] = useState({
    account_holder: "",
    bank_name: "",
    account_number: "",
    ifsc: "",
    upi: ""
  });

  useEffect(() => {
    const loadBank = async () => {
      try {
        const res = await apiRequest("/admin/bank/");
        if (res) {
          setBank({
            account_holder: res.account_holder || "",
            bank_name: res.bank_name || "",
            account_number: res.account_number || "",
            ifsc: res.ifsc || "",
            upi: res.upi || ""
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadBank();
  }, []);

  const saveBank = async () => {
    try {
      await apiRequest("/admin/bank/", {
        method: "POST",
        body: bank
      });
      alert("Saved");
    } catch {
      alert("Failed");
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-2xl font-bold text-[#E8DCC4]">
        Admin Bank Details
      </h2>

      <div className="bg-[#111] p-6 rounded-xl space-y-4">

        <input
          value={bank.account_holder}
          onChange={(e) => setBank({ ...bank, account_holder: e.target.value })}
          placeholder="Account Holder"
          className="w-full p-3 bg-black border rounded"
        />

        <input
          value={bank.bank_name}
          onChange={(e) => setBank({ ...bank, bank_name: e.target.value })}
          placeholder="Bank Name"
          className="w-full p-3 bg-black border rounded"
        />

        <input
          value={bank.account_number}
          onChange={(e) => setBank({ ...bank, account_number: e.target.value })}
          placeholder="Account Number"
          className="w-full p-3 bg-black border rounded"
        />

        <input
          value={bank.ifsc}
          onChange={(e) => setBank({ ...bank, ifsc: e.target.value })}
          placeholder="IFSC"
          className="w-full p-3 bg-black border rounded"
        />

        <input
          value={bank.upi}
          onChange={(e) => setBank({ ...bank, upi: e.target.value })}
          placeholder="UPI"
          className="w-full p-3 bg-black border rounded"
        />

        <button
          type="button"
          onClick={saveBank}
          className="w-full bg-[#C9A84C] text-black py-3 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default AdminBank;