import { useEffect, useState } from "react";

const Subscription = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // =============================
  // FETCH PLANS
  // =============================
  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/plans/", {
        credentials: "include",
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setPlans(data);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error("Fetch plans error:", err);
      setPlans([]);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // =============================
  // BUY PLAN (STRIPE FIXED)
  // =============================
  const buyPlan = async (plan: any) => {
    try {
      setLoadingId(plan.id);

      // =============================
      // FREE PLAN FLOW
      // =============================
      if (plan.price === 0) {
        const res = await fetch(
          `/api/activate-subscription/?plan_id=${plan.id}`,
          { credentials: "include" }
        );

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Activation failed");
          return;
        }

        alert(`${plan.name} activated successfully 🚀`);
        window.location.href = "/seller-dashboard";
        return;
      }

      // =============================
      // PAID PLAN → STRIPE CHECKOUT
      // =============================
      const res = await fetch("/api/buy-plan/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ plan_id: plan.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Payment failed");
        return;
      }

      // ✅ REDIRECT TO STRIPE
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert("Stripe session not created");
      }

    } catch (err) {
      console.error("Buy plan error:", err);
      alert("Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-10">
      
      {/* HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#C9A84C] mb-3">
          Choose Your Plan
        </h1>
        <p className="text-gray-400">
          Start selling with flexible subscription options
        </p>
      </div>

      {/* PLANS */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

        {plans.length > 0 ? (
          plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-[#0B1C2F] border border-[#C9A84C]/20 rounded-xl p-6 hover:scale-105 transition-all duration-300"
            >
              <h2 className="text-xl font-bold text-[#C9A84C] mb-2">
                {plan.name}
              </h2>

              <p className="text-3xl font-semibold mb-4">
                {plan.price === 0
                  ? "Free"
                  : `$${Number(plan.price).toLocaleString("en-US")}`}
              </p>

              <ul className="space-y-2 text-gray-300 text-sm mb-6">
                <li>
                  ✔ {plan.max_listings === -1
                    ? "Unlimited Listings"
                    : `${plan.max_listings} Listings`}
                </li>
                <li>✔ {plan.duration_days} Days Access</li>
                <li>✔ {plan.free_trial_days || 0} Days Trial</li>
                <li>✔ Seller Dashboard</li>
              </ul>

              <button
                onClick={() => buyPlan(plan)}
                disabled={loadingId === plan.id}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  plan.price === 0
                    ? "bg-green-500 text-black"
                    : "bg-[#C9A84C] text-black"
                } ${
                  loadingId === plan.id
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {loadingId === plan.id
                  ? "Processing..."
                  : plan.price === 0
                  ? "Start Free Trial"
                  : "Buy Plan"}
              </button>
            </div>
          ))
        ) : (
          <div className="text-center mt-10 text-gray-400">
            No plans available
          </div>
        )}

      </div>
    </div>
  );
};

export default Subscription;