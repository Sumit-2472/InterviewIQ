import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { ServerUrl } from "../App";
import axios from "axios";
function Pricing() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loadingPlan, setloadingPlan] = useState(null);
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "₹0",
      credits: 100,
      description: "Perfect for beginners starting interview preparation.",
      features: [
        "100 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      default: true,
    },
    {
      id: "basic",
      name: "Starter Pack",
      price: "₹100",
      credits: 150,
      description: "Great for focused practice and skill improvement.",
      features: [
        "150 AI Interview Credits",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History",
      ],
    },
    {
      id: "pro",
      name: "Pro Pack",
      price: "₹500",
      credits: 650,
      description: "Best value for serious job preparation.",
      features: [
        "650 AI Interview Credits",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
      badge: "Best Value",
    },
  ];

  const handlePayment = async (plan) => {
    try {
      setloadingPlan(plan.id);

      const amount = plan.id === "basic" ? 100 : plan.id === "pro" ? 500 : 0;

      const result = await axios.post(
        ServerUrl + "/api/payment/order",
        {
          planId: plan.id,
          amount: amount,
          credits: plan.credits,
        },
        { withCredentials: true },
      );
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: result.data.amount,
        currency: "INR",
        name: "InterviewIQ.AI",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: result.data.id,

        handler: async function (response) {
  try {
    const verifyRes = await axios.post(
      ServerUrl + "/api/payment/verify",
      response,
      {
        withCredentials: true,
      }
    );

    console.log(verifyRes.data);

    alert("Payment Successful!");

    // Refresh current user so Redux gets updated credits
    window.location.reload();

  } catch (error) {
    console.log(error);
    alert("Payment verification failed");
  }
},
        theme: {
          color: "#10b981",
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();

      setloadingPlan(null);
    } catch (error) {
      console.log(error);
      setloadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-linear-to-br from-gray-50 to-emerald-50 px-4 py-10 sm:px-6 sm:py-16 transition-colors duration-300 dark:from-slate-950 dark:to-emerald-950/40">
      <div className="max-w-6xl mx-auto mb-10 sm:mb-14 flex items-start gap-3 sm:gap-4">
        <button
          onClick={() => navigate("/")}
          className="mt-2 p-3 rounded-full bg-white shadow hover:shadow-md transition dark:bg-slate-900 dark:border dark:border-slate-700"
        >
          <FaArrowLeft className="text-gray-600 dark:text-gray-300" />
        </button>
        <div className="text-center w-full">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-500 dark:text-gray-300 text-base sm:text-lg mb-4">
            Flexible pricing to match your interview preparation goals.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <motion.div
              key={plan.id}
              whileHover={!plan.default && { scale: 1.03 }}
              onClick={() => !plan.default && setSelectedPlan(plan.id)}
              className={`relative min-w-0 rounded-3xl p-6 sm:p-8 transition-all duration-300 
                  border
                    ${
                      isSelected
                        ? "border-emerald-600 shadow-2xl bg-white dark:bg-slate-900"
                        : "border-gray-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900"
                    }
                    ${plan.default ? "cursor-default" : "cursor-pointer"}
                    `}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute top-6 right-6">
                  <div className="bg-emerald-600 text-white text-xs px-4 py-1 rounded-full shadow">
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Default Tag */}
              {plan.default && (
                <div className="absolute top-6 right-6">
                  <div className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full dark:bg-slate-700 dark:text-gray-200">
                    Default
                  </div>
                </div>
              )}
              {/* Plan Name */}
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mt-4">
                <span className="text-3xl font-bold text-emerald-600">
                  {plan.price}
                </span>
                <p className="text-gray-500 dark:text-gray-300 mt-1">{plan.credits} Credits</p>
              </div>
              {/* Description */}
              <p className="text-gray-500 dark:text-gray-300 mt-4 text-sm leading-relaxed">
                {plan.description}
              </p>

              {/* Features */}
              <div className="mt-6 space-y-3 text-left">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <FaCheckCircle className="text-emerald-500 text-sm" />
                    <span className="text-gray-700 dark:text-gray-200 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {!plan.default && (
                <button
                  disabled={loadingPlan === plan.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelected) {
                      setSelectedPlan(plan.id);
                    } else {
                      handlePayment(plan);
                    }
                  }}
                  className={`w-full mt-8 py-3 rounded-xl font-semibold 
  transition ${
    isSelected
      ? "bg-emerald-600 text-white hover:opacity-90"
      : "bg-gray-100 text-gray-700 hover:bg-emerald-50 dark:bg-slate-800 dark:text-gray-100 dark:hover:bg-emerald-900/40"
  }`}
                >
                  {loadingPlan === plan.id
                    ? "Processing..."
                    : isSelected
                      ? "Proceed to Pay"
                      : "Select Plan"}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default Pricing;
