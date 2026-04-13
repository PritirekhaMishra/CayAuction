import { useEffect, useState } from "react";

const PaymentSuccess = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        console.log("Success page loaded");

        const params = new URLSearchParams(window.location.search);
        const session_id = params.get("session_id");

        console.log("SESSION ID:", session_id);

        if (!session_id) {
          setMessage("Session ID missing");
          setStatus("error");
          return;
        }

        const res = await fetch("http://127.0.0.1:8000/api/verify-payment/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ session_id }),
        });

        const data = await res.json();

        console.log("VERIFY RESPONSE:", data);

        if (!res.ok) {
          setMessage(data?.error || "Verification failed");
          setStatus("error");
          return;
        }

        // ✅ SUCCESS
        setStatus("success");

        setTimeout(() => {
          window.location.href = "/seller-dashboard";
        }, 2000);

      } catch (err: any) {
        console.error("ERROR:", err);
        setMessage("Server error. Please try again.");
        setStatus("error");
      }
    };

    // 🔥 Retry logic (important for Stripe delay)
    const timer = setTimeout(() => {
      verifyPayment();
    }, 2000); // increased delay

    return () => clearTimeout(timer);

  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
      {status === "loading" && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#C9A84C] mb-3">
            Processing Payment...
          </h1>
          <p className="text-gray-400">
            Please wait while we confirm your transaction.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-500 mb-3">
            Payment Successful 🎉
          </h1>
          <p className="text-gray-400">
            Redirecting to your dashboard...
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-3">
            Payment Failed ❌
          </h1>

          <p className="text-gray-400 mb-4">
            {message || "Something went wrong while verifying your payment."}
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-700 px-4 py-2 rounded-lg"
            >
              Retry
            </button>

            <button
              onClick={() => (window.location.href = "/subscription")}
              className="bg-[#C9A84C] text-black px-4 py-2 rounded-lg"
            >
              Back to Plans
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;