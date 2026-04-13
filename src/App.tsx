import { Routes, Route } from "react-router-dom";

import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import SellWithUs from "./pages/SellWithUs";
import HowItWorks from "./pages/HowItWorks";
import Auctions from "./pages/Auctions";
import AuctionDetail from "./pages/AuctionDetail";
import Upcoming from "./pages/Upcoming";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";

import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

import SellerLogin from "./pages/SellerLogin";
import CreateListing from "./pages/CreateListing";
import SellerDashboard from "./pages/SellerDashboard";

import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Deposit from "./pages/Deposit";
import Subscription from "./pages/Subscription";
import PaymentSuccess from "./pages/PaymentSuccess";


const Privacy = () => <div className="p-10 text-white">Privacy Page</div>;
const Terms = () => <div className="p-10 text-white">Terms Page</div>;
const Accessibility = () => <div className="p-10 text-white">Accessibility Page</div>;

function App() {
  return (
    <Routes>

      <Route element={<MainLayout />}>

        <Route path="/" element={<Home />} />
        <Route path="/sell" element={<SellWithUs />} />
        <Route path="/how-it-works" element={<HowItWorks />} />

        <Route path="/auctions" element={<Auctions />} />
        <Route path="/upcoming" element={<Upcoming />} />
        <Route path="/auction/:id" element={<AuctionDetail />} />

        <Route path="/dashboard" element={<Dashboard />} />
        

        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/accessibility" element={<Accessibility />} />

        <Route
          path="/admin-dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

      </Route>

      <Route path="/login" element={<Auth />} />
      <Route path="/sign-up-login" element={<Auth />} />
      <Route path="/admin" element={<AdminLogin />} />

      <Route path="/seller-login" element={<SellerLogin />} />
      <Route path="/create-listing" element={<CreateListing />} />
      <Route path="/seller-dashboard" element={<SellerDashboard />} />
      <Route path="/deposit" element={<Deposit />} />
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/success" element={<PaymentSuccess />} />
    </Routes>
  )
}

export default App;