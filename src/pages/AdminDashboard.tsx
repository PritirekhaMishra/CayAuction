import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminBank from "./AdminBank";
import SellerBanks from "./SellerBanks";

import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  DollarSign, 
  Gavel, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Search,
  Filter,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  Shield,
  AlertCircle,
  Calendar,
  User,
  Tag,
  Timer,
  MoreHorizontal,
  Eye,
  Download
} from "lucide-react";
import { 
  apiRequest 
} from "../services/api";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

interface User {
  id: number;
  username: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  joined: string;
}

interface Deposit {
  id: number;
  user_name: string;
  user_email: string;
  amount: number;
  utr_number: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface Settlement {
  id: number;
  buyer: string;
  winning_amount: number;
  commission: number;
  seller_amount: number;
  created_at: string;
}

interface Listing {
  id: number;
  title: string;
  description: string;
  starting_price: number;
  category: string;
  duration_hours: number;
  status: 'pending' | 'approved' | 'rejected';
  seller: string;
  seller_email: string;
  images: string[];
  created_at: string;
   price?: number; 
   video?: string; 
}

interface RevenueDataPoint {
  month: string;
  revenue: number;
  target: number;
}

interface ChatDataPoint {
  month: string;
  new_users: number;
  users: number;
}

const COLORS = {
  bg: "#020617",
  card: "#0B1220",
  border: "#1E293B",
  gold: "#D4AF37",
  text: "#E5E7EB",
  muted: "#94A3B8",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [chatData, setChatData] = useState<ChatDataPoint[]>([]);
  const [increment, setIncrement] = useState<string>("100");
const [startDelay, setStartDelay] = useState<string>("0");
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [auctionRevenue, setAuctionRevenue] = useState(0);
const [subscriptionRevenue, setSubscriptionRevenue] = useState(0);
const [auctions, setAuctions] = useState<any[]>([]);
const [withdrawals, setWithdrawals] = useState<any[]>([]);
const [delayType, setDelayType] = useState<"minutes" | "hours" | "days">("hours");
  
    

const totalVolume = settlements.reduce((sum, s) => sum + s.winning_amount, 0);
const [totalRevenue, setTotalRevenue] = useState(0);
const totalPayout = settlements.reduce((sum, s) => sum + s.seller_amount, 0);
const pendingUsers = useMemo(
  () => users.filter(u => u.status === "pending").length,
  [users]
);
const pendingDeposits = useMemo(
  () => deposits.filter(d => d.status === "pending").length,
  [deposits]
);

const pendingListings = useMemo(
  () => listings.filter(l => l.status === "pending").length,
  [listings]
);

// ✅ THEN: use them
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users, badge: pendingUsers },
  { id: "deposits", label: "Deposits", icon: Wallet, badge: pendingDeposits },
  { id: "listings", label: "Assets", icon: Package, badge: pendingListings },
  { id: "settlements", label: "Settlements", icon: DollarSign },
  { id: "auctions", label: "Auctions", icon: Gavel },
  { id: "subscriptions", label: "Subscriptions", icon: Shield },
  { id: "bank", label: "Bank Settings", icon: DollarSign },
  { id: "seller-banks", label: "Seller Banks", icon: DollarSign },
  { id: "withdrawals", label: "Withdrawals", icon: DollarSign }
];


  const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const approveUser = async (userId: number) => {
  await apiRequest(`/admin/users/${userId}/approve/`, { method: "POST" });
  await fetchAll();   // 🔥 MUST
};

const rejectUser = async (userId: number) => {
  await apiRequest(`/admin/users/${userId}/reject/`, { method: "POST" });
  await fetchAll();   // 🔥 MUST
};

const approveDeposit = async (depositId: number) => {
  try {
    await apiRequest(`/admin/deposits/${depositId}/approve/`, { method: "POST" });
    await fetchAll();

  } catch (err) {
    console.error(err);
    alert("Approval failed");
  }
};

const rejectDeposit = async (depositId: number) => {
  try {
    await apiRequest(`/admin/deposits/${depositId}/reject/`, { method: "POST" });
    fetchAll(); // 🔥 IMPORTANT
  } catch (err) {
    alert("Reject failed");
  }
};
const deletePlan = async (id: number) => {
  try {
    await apiRequest(`/admin/plans/${id}/delete/`, {
      method: "DELETE"
    });
    fetchAll();
  } catch (err) {
    alert("Delete failed");
  }
};

const approveListing = async (listingId: number, reservePrice?: number, commission?: number, duration?: number) => {
 await apiRequest(`/admin/listings/${listingId}/approve/`, {
  method: "POST",
  body: {
  reserve_price: reservePrice,
  commission: commission,
  duration_hours: duration,

  increment: Number(increment),       
  start_delay: Number(startDelay), 
  delay_type: delayType
}
});
  
  fetchAll();
};

const rejectListing = async (listingId: number) => {
  await apiRequest(`/admin/listings/${listingId}/reject/`, {
    method: "POST"
  });
  await fetchAll();
};

  // Check auth first, then load data
  useEffect(() => {
    const checkAuth = async () => {
      const authRes = await apiRequest("/user/");
      if (authRes?.error || !authRes?.is_admin) {
        navigate("/admin");
        return;
      }
      fetchAll();
    };
    checkAuth();
  }, [navigate]);
useEffect(() => {
  const interval = setInterval(async () => {
  await apiRequest("/auto-end-auctions/");
await fetchAll(); // 🔥 REQUIRED
  
}, 100000); // every 10 sec

  return () => clearInterval(interval);
}, []);
      // ================= FETCH =================
const fetchAll = async () => {
  setLoading(true);
  setError(null);

  try {
    const [
  usersRes,
  depositsRes,
  settlementsRes,
  listingsRes,
  revenueChartRes,
  chatRes,
  plansRes,
  revenueSummaryRes,
  auctionsRes ,
  withdrawalsRes 
] = await Promise.all([
  apiRequest("/admin/users/"),
  apiRequest("/admin/deposits/"),
  apiRequest("/admin/settlements/"),
  apiRequest("/admin/listings/"),
  apiRequest("/admin/revenue-chart/"),
  apiRequest("/admin/chat-stats/"),
  apiRequest("/admin/plans/"),
  apiRequest("/admin/revenue/"),
  apiRequest("/admin/auctions/"),
  apiRequest("/admin/withdrawals/")   
]);

    // ✅ SAFE DATA
    const safeUsers = Array.isArray(usersRes) ? usersRes : [];
    const safeDeposits = Array.isArray(depositsRes) ? depositsRes : [];
    const safeSettlements = Array.isArray(settlementsRes) ? settlementsRes : [];
    const safeListings = Array.isArray(listingsRes) ? listingsRes : [];
    const safeRevenue = Array.isArray(revenueChartRes) ? revenueChartRes : [];
    const safeChat = Array.isArray(chatRes) ? chatRes : [];
    const safePlans = Array.isArray(plansRes) ? plansRes : [];
    
    setPlans(safePlans);

    // ✅ SET DATA
setUsers(safeUsers);
setDeposits(safeDeposits);
setSettlements(safeSettlements);
setListings(safeListings);
setRevenueData(safeRevenue);
setChatData(safeChat);
setAuctions(Array.isArray(auctionsRes) ? auctionsRes : []);
setWithdrawals(Array.isArray(withdrawalsRes) ? withdrawalsRes : []);

const fallbackRevenue = safeSettlements.reduce(
  (sum, s) => sum + s.commission,
  0
);

setTotalRevenue(
  revenueSummaryRes?.total_revenue || fallbackRevenue
);
setAuctionRevenue(revenueSummaryRes?.auction_revenue || 0);
setSubscriptionRevenue(revenueSummaryRes?.subscription_revenue || 0);

// ✅ FIX ERROR CHECK
if (
  [usersRes, depositsRes, settlementsRes, listingsRes, revenueChartRes, chatRes]
    .some((res: any) => res?.error)
) {
  setError("Permission error. Login as admin (is_staff=True).");
}

  } catch (err) {
    console.error("Dashboard fetch error:", err);
    setError("Backend unavailable.");
  } finally {
    // ✅ ALWAYS RUNS
    setLoading(false);
  }
};
  // ================= MOBILE SIDEBAR =================
  const MobileSidebar = () => (
    <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => setSidebarOpen(false)} />
      <div className={`w-72 bg-[#020617] border-r border-[#1E293B] transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-[#C9A84C]">CayAdmin</h1>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">
              <X className="w-5 h-5 text-[#8B7355]" />
            </button>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActive(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active === item.id ? 'bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30' : 'text-[#8B7355] hover:bg-white/5 hover:text-[#C9A84C]'}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-[#C9A84C] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );

  // ================= DESKTOP SIDEBAR =================
  // ================= DESKTOP SIDEBAR =================
const DesktopSidebar = () => (
  <div className="w-60 bg-[#020617] border-r border-[#C9A84C]/30 fixed top-0 left-0 h-screen overflow-y-auto 
                  scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#C9A84C]/40 hover:scrollbar-thumb-[#C9A84C]">

    <div className="p-5">
      
      {/* HEADER */}
      <h1 className="text-xl font-semibold text-[#C9A84C] mb-6 tracking-wider">
        CayAdmin
      </h1>

      {/* NAV */}
      <nav className="space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative
              ${
                active === item.id
                  ? 'bg-gradient-to-r from-[#C9A84C]/20 to-transparent text-[#C9A84C] border border-[#C9A84C]/30 shadow-[0_0_10px_rgba(201,168,76,0.15)]'
                  : 'text-[#8B7355] hover:bg-[#C9A84C]/10 hover:text-[#C9A84C]'
              }`}
          >
            {/* ICON */}
            <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />

            {/* TEXT */}
            <span className="text-sm font-medium tracking-wide">
              {item.label}
            </span>

            {/* BADGE */}
            {item.badge && item.badge > 0 && (
              <span className="ml-auto bg-[#C9A84C] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

    </div>
  </div>
);

  // ================= STAT CARD =================
  const StatCard = ({ title, value, subtext, icon: Icon }: { title: string, value: string, subtext?: string, icon: React.ComponentType<{ className?: string }> }) => (
    <div className="bg-[#0B1220] border border-[#1E293B] rounded-xl p-6 hover:border-[#1E293B] transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-[#C9A84C]/10 rounded-lg">
          <Icon className="w-6 h-6 text-[#C9A84C]" />
        </div>
      </div>
      <p className="text-[#8B7355] text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold text-[#E8DCC4]">{value}</p>
      {subtext && <p className="text-xs text-[#8B7355] mt-2">{subtext}</p>}
    </div>
  );

  // ================= LISTING MODAL =================
 type ListingModalType = {
  id: number;
  title: string;
  description: string;
  starting_price: number;
  category: string;
  duration_hours: number;
  status: 'pending' | 'approved' | 'rejected';
  seller: string;
  seller_email: string;
  images: string[];
  price?: number;
  final_price?: number;
  created_at: string;

  // ✅ FIXED
  video?: string | null;

  original_starting_price?: number;
  admin_updated_price?: number;
  admin_commission?: number;
  admin_duration_hours?: number;
};
type ListingModalProps = {
  listing: ListingModalType;
  onClose: () => void;
};

  const ListingDetailModal: React.FC<ListingModalProps> = ({ listing, onClose }) => {
  const [currentImage, setCurrentImage] = useState<number>(
  listing.video ? -1 : 0
);
const [reservePrice, setReservePrice] = useState<number>(listing?.starting_price || 0);
const [commission, setCommission] = useState<number>(5);
const [duration, setDuration] = useState<number>(listing?.duration_hours || 0);

  if (!listing) return null;

  const images = listing.images || [];

  // ✅ FORMAT DURATION
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

    return result.trim();
  };

  // ✅ PRICE CHANGE
  const original =
  listing.starting_price ||
  (listing as any).price ||
  (listing as any).final_price ||
  0;
  const updated = null;
  const finalPrice =
  (listing as any).price ||
  (listing as any).final_price ||
  listing.starting_price ||
  0;
  const safeDate = listing.created_at
  ? formatDate(listing.created_at)
  : "N/A";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#020617] border border-[#1E293B] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="sticky top-0 bg-[#0a0a0a] border-b border-[#C9A84C]/20 p-6 flex justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#E8DCC4]">{listing.title}</h2>
            <p className="text-[#8B7355]">
              Submitted by {listing.seller} on {safeDate}
            </p>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="p-6 grid lg:grid-cols-2 gap-8">

          {/* LEFT: IMAGES */}
          <div className="space-y-4">

  {/* MAIN IMAGE / VIDEO */}
  <div className="aspect-square bg-[#111] rounded-xl overflow-hidden border relative">

    {listing.video && currentImage === -1 ? (
      <video
        src={listing.video}
        controls
        className="w-full h-full object-cover"
      />
    ) : images.length > 0 ? (
      <img
        src={images[currentImage]}
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="flex items-center justify-center h-full text-[#555]">
        No Media
      </div>
    )}

  </div>

  {/* 🔥 THUMBNAILS (LIKE AMAZON) */}
  <div className="flex gap-3 overflow-x-auto">

    {/* VIDEO THUMBNAIL */}
    {listing.video && (
      <div
        onClick={() => setCurrentImage(-1)}
        className={`w-20 h-20 border cursor-pointer rounded overflow-hidden ${
          currentImage === -1 ? "border-[#C9A84C]" : "border-gray-700"
        }`}
      >
        <video
  src={listing.video}
  muted
  className="w-full h-full object-cover"
/>
      </div>
    )}

    {/* IMAGE THUMBNAILS */}
    {images.map((img, i) => (
      <img
        key={i}
        src={img}
        onClick={() => setCurrentImage(i)}
        className={`w-20 h-20 object-cover rounded cursor-pointer border ${
          currentImage === i ? "border-[#C9A84C]" : "border-gray-700"
        }`}
      />
    ))}

  </div>

</div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* 🔥 PRICE REVIEW */}
            <div className="bg-[#111] p-4 rounded-lg border border-[#C9A84C]/10">
              <p className="text-[#8B7355] text-sm mb-1">Price Review</p>

              <p className="text-sm text-[#8B7355]">
                Original: {formatCurrency(original)}

              </p>

              <p className="text-2xl font-bold text-[#C9A84C]">
                Final: {formatCurrency(finalPrice)}
              </p>

              
            </div>

            {/* 🔥 ADMIN SETTINGS */}
            {listing.admin_commission && (
              <div className="bg-[#111] p-4 rounded-lg border border-[#C9A84C]/10">
                <p className="text-[#8B7355] text-sm mb-1">Admin Settings</p>
                <p className="text-[#E8DCC4]">Commission: {listing.admin_commission}%</p>
                <p className="text-[#E8DCC4]">
                  Duration: {formatDuration(listing.admin_duration_hours ?? 0)}
                </p>
              </div>
            )}

            {/* BASIC INFO */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#111] p-4 rounded">
                <p className="text-sm text-[#8B7355]">Category</p>
                <p>{listing.category}</p>
              </div>

              <div className="bg-[#111] p-4 rounded">
                <p className="text-sm text-[#8B7355]">Status</p>
                <p>{listing.status}</p>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="bg-[#111] p-4 rounded">
              {listing.description}
            </div>

            {/* SELLER */}
            <div className="bg-[#111] p-4 rounded">
              <p className="text-[#8B7355] text-sm">Seller</p>
              <p>{listing.seller_email}</p>
            </div>

            {/* 🔥 ADMIN INPUT PANEL */}
            {listing.status === "pending" && (
              <div className="space-y-5 pt-4 border-t border-[#C9A84C]/20">

                <div>
                  <label className="text-sm text-[#C9A84C]">Reserve Price</label>
                  <input
                    type="number"
                    value={reservePrice}
                    onChange={(e) => setReservePrice(Number(e.target.value))}
                    className="w-full mt-1 p-2 bg-[#111] border rounded"
                  />
                </div>

                <div>
                  <label className="text-sm text-[#C9A84C]">Commission (%)</label>
                  <input
                    type="number"
                    value={commission}
                    onChange={(e) => setCommission(Number(e.target.value))}
                    className="w-full mt-1 p-2 bg-[#111] border rounded"
                  />
                </div>

                <div>
                  <label className="text-sm text-[#C9A84C]">Duration (hours)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full mt-1 p-2 bg-[#111] border rounded"
                  />
                  <p className="text-xs text-[#8B7355] mt-1">
                    Preview: {formatDuration(duration)}
                  </p>
                </div>
                <div>
                    <label className="text-sm text-[#C9A84C]">Bid Increment</label>
                    <input
                      type="number"
                      value={increment}
                      onChange={(e) => setIncrement(e.target.value)}
                      className="w-full mt-1 p-2 bg-[#111] border rounded"
                    />
                  </div>
                  <div>
  <label className="text-sm text-[#C9A84C]">Auction Start After</label>

  <div className="flex gap-2 mt-1">
    <input
      type="number"
      value={startDelay}
      onChange={(e) => setStartDelay(e.target.value)}
      className="w-full p-2 bg-[#111] border rounded"
      placeholder="Enter time"
    />

    <select
      value={delayType}
      onChange={(e) => setDelayType(e.target.value as any)}
      className="p-2 bg-[#111] border rounded"
    >
      <option value="minutes">Minutes</option>
      <option value="hours">Hours</option>
      <option value="days">Days</option>
    </select>
  </div>
</div>
                <div className="flex gap-3">
                  <button
                    onClick={() => approveListing(listing.id, reservePrice, commission, duration)}
                    className="flex-1 py-3 bg-[#C9A84C] text-black rounded-lg"
                  >
                    Approve & Publish
                  </button>

                  <button
                    onClick={() => rejectListing(listing.id)}
                    className="flex-1 py-3 bg-red-500/10 text-red-400 border rounded-lg"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

            {/* APPROVED */}
            {listing.status === "approved" && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
                Live on platform
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
  // ================= DASHBOARD VIEW =================
  const DashboardView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#E8DCC4]">Platform Overview</h2>
          <p className="text-[#8B7355]">Monitor your auction platform performance</p>
        </div>
        <button onClick={fetchAll} className="px-4 py-2 bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30 rounded-lg transition-colors flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Volume" value={formatCurrency(totalVolume)} subtext="All time transactions" icon={DollarSign} />
        <StatCard title="Platform Revenue" value={formatCurrency(totalRevenue)} subtext="Commission + Subscriptions" icon={TrendingUp} />
        <StatCard title="Seller Payouts" value={formatCurrency(totalPayout)} subtext="Net to sellers" icon={Wallet} />
        <StatCard title="Pending Reviews" value={String(pendingDeposits + pendingListings + pendingUsers)} subtext="Action required" icon={AlertCircle} />
        <StatCard 
          title="Auction Revenue" 
          value={formatCurrency(auctionRevenue)} 
          subtext="From commissions" 
          icon={Gavel} 
        />

        <StatCard 
          title="Subscription Revenue" 
          value={formatCurrency(subscriptionRevenue)} 
          subtext="From plans" 
          icon={Shield} 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111] border border-[#C9A84C]/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#E8DCC4]">Revenue Analytics</h3>
              <p className="text-sm text-[#8B7355]">Monthly commission revenue</p>
            </div>
            <select className="bg-[#0a0a0a] border border-[#C9A84C]/30 text-[#E8DCC4] rounded-lg px-3 py-1 text-sm">
              <option>Last 6 Months</option>
              <option>Last Year</option>
              <option>All Time</option>
            </select>
          </div>
          <div className="h-80">
            <div className="h-80">
  {revenueData.length === 0 ? (
    <div className="flex items-center justify-center h-full text-[#8B7355]">
      <div className="flex flex-col items-center">
        <AlertCircle className="w-10 h-10 mb-2" />
        <p>No revenue yet</p>
        <p className="text-xs text-gray-500">
          Revenue will appear after auctions or subscriptions
        </p>
      </div>
    </div>
  ) : (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={revenueData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
        <XAxis dataKey="month" stroke="#8B7355" />
        <YAxis stroke="#8B7355" />
        <Tooltip />
        <Bar dataKey="revenue" fill="#C9A84C" />
      </BarChart>
    </ResponsiveContainer>
  )}
</div>
          </div>
        </div>

        <div className="bg-[#111] border border-[#C9A84C]/20 rounded-xl p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#E8DCC4]">Platform Activity</h3>
            <p className="text-sm text-[#8B7355]">User engagement metrics</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chatData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="month" stroke="#8B7355" />
                <YAxis stroke="#8B7355" />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #C9A84C', borderRadius: '8px' }} />
                <Bar dataKey="new_users" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#C9A84C] rounded-full" />
              <span className="text-sm text-[#8B7355]">New Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#8B7355] rounded-full" />
              <span className="text-sm text-[#8B7355]">Active Users</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => setActive("users")} className="p-6 bg-[#111] border border-[#C9A84C]/20 rounded-xl hover:border-[#C9A84C]/40 transition-all text-left group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-[#E8DCC4]">{pendingUsers}</span>
          </div>
          <p className="text-[#8B7355] group-hover:text-[#C9A84C] transition-colors">Pending User Verifications</p>
        </button>
        <button onClick={() => setActive("deposits")} className="p-6 bg-[#111] border border-[#C9A84C]/20 rounded-xl hover:border-[#C9A84C]/40 transition-all text-left group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-[#E8DCC4]">{pendingDeposits}</span>
          </div>
          <p className="text-[#8B7355] group-hover:text-[#C9A84C] transition-colors">Pending Deposit Reviews</p>
        </button>
        <button onClick={() => setActive("listings")} className="p-6 bg-[#111] border border-[#C9A84C]/20 rounded-xl hover:border-[#C9A84C]/40 transition-all text-left group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <Package className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-2xl font-bold text-[#E8DCC4]">{pendingListings}</span>
          </div>
          <p className="text-[#8B7355] group-hover:text-[#C9A84C] transition-colors">Pending Asset Reviews</p>
        </button>
      </div>
    </div>
  );

  // ================= USERS VIEW =================
  const UsersView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#E8DCC4]">User Management</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7355]" />
            <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 bg-[#111] border border-[#C9A84C]/20 rounded-lg text-[#E8DCC4] placeholder-[#8B7355] focus:outline-none focus:border-[#C9A84C] w-64" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 bg-[#111] border border-[#C9A84C]/20 rounded-lg text-[#E8DCC4] focus:outline-none focus:border-[#C9A84C]">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-[#111] border border-[#C9A84C]/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0a0a0a] border-b border-[#C9A84C]/20">
              <tr>
                <th className="text-left text-[#8B7355] font-medium p-4">User</th>
                <th className="text-left text-[#8B7355] font-medium p-4">Email</th>
                <th className="text-left text-[#8B7355] font-medium p-4">Status</th>
                <th className="text-left text-[#8B7355] font-medium p-4">Joined</th>
                <th className="text-left text-[#8B7355] font-medium p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9A84C]/10">
              {(() => {
                const filteredUsers = users.filter((u: User) => 
                  (filterStatus === 'all' || u.status === filterStatus) &&
                  u.username.toLowerCase().includes(searchTerm.toLowerCase())
                );
                if (filteredUsers.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} className="p-12 text-center">
                        <AlertCircle className="w-12 h-12 text-[#8B7355] mx-auto mb-4" />
                        <p className="text-[#8B7355]">No users found</p>
                        <p className="text-sm text-[#6B7280]">Try adjusting filters</p>
                      </td>
                    </tr>
                  );
                }
                return filteredUsers.map((u: User) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
  <div className="w-10 h-10 rounded-full bg-[#C9A84C] text-black flex items-center justify-center font-bold">
    </div>
                        <div className="w-10 h-10 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] font-bold">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-[#E8DCC4]">{u.username}</span>
                          <p className="text-xs text-[#8B7355]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[#8B7355]">{formatDate(u.joined)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        u.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30' :
                        u.status === 'rejected' ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/30' :
                        'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30'
                      }`}>
                        {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4"></td>
                    <td className="p-4">
                      {u.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => approveUser(u.id)}
                            className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md text-sm font-medium transition-all"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => rejectUser(u.id)}
                            className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-md text-sm font-medium transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#8B7355] text-sm font-medium">Completed</span>
                      )}
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
 
  // ================= DEPOSITS VIEW =================
  const DepositsView = () => {
    const filteredDeposits = deposits.filter((d: Deposit) => 
      (filterStatus === 'all' || d.status === filterStatus) &&
      d.utr_number.includes(searchTerm)
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-[#E8DCC4]">Deposit Control</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7355]" />
              <input type="text" placeholder="Search UTR..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 bg-[#111] border border-[#C9A84C]/20 rounded-lg text-[#E8DCC4] placeholder-[#8B7355] focus:outline-none focus:border-[#C9A84C] w-64" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 bg-[#111] border border-[#C9A84C]/20 rounded-lg text-[#E8DCC4] focus:outline-none focus:border-[#C9A84C]">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          {filteredDeposits.length === 0 ? (
            <div className="col-span-full p-12 text-center border-2 border-dashed border-[#C9A84C]/20 rounded-xl">
              <AlertCircle className="w-12 h-12 text-[#8B7355] mx-auto mb-4" />
              <p className="text-[#8B7355]">No deposits found</p>
              <p className="text-sm text-[#6B7280]">No deposits match your filters</p>
            </div>
          ) : (
            filteredDeposits.map((d: Deposit) => (
  <div
  key={d.id}
  onClick={() => setSelectedDeposit(d)}
  className="bg-[#0B1220] cursor-pointer border border-[#1E293B] rounded-2xl p-5 hover:border-[#C9A84C]/50 transition-all shadow-lg hover:shadow-[#C9A84C]/10"
>

    {/* 🔥 TOP HEADER */}
    <div className="flex items-center justify-between mb-4">

      <div className="flex items-center gap-4">

        {/* AVATAR */}
        <div className="w-12 h-12 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] font-bold text-lg">
          {d.user_name?.charAt(0).toUpperCase()}
        </div>

        {/* USER INFO */}
        <div>
          {/* ✅ NAME (PRIMARY) */}
          <div className="max-w-[180px]">

  {/* NAME */}
  <p className="text-lg font-semibold text-[#E8DCC4] truncate">
    {d.user_name}
  </p>

  {/* EMAIL */}
  <p className="text-xs text-[#8B7355] truncate">
    {d.user_email}
  </p>

</div>

          {/* DATE */}
          <p className="text-xs text-[#6B7280] mt-1">
            {formatDate(d.created_at)}
          </p>
        </div>

      </div>

      {/* STATUS BADGE */}
      <span
  className={`ml-2 shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
    d.status === "approved"
      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
      : d.status === "rejected"
      ? "bg-red-500/10 text-red-400 border border-red-500/30"
      : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
  }`}
>
  {d.status.toUpperCase()}
</span>

    </div>

    {/* DIVIDER */}
    <div className="border-t border-[#1E293B] my-4"></div>

    {/* 🔥 DETAILS */}
    <div className="space-y-3">

      <div className="flex justify-between items-center">
        <span className="text-[#8B7355] text-sm">Amount</span>
        <span className="text-[#C9A84C] text-lg font-bold">
          {formatCurrency(d.amount)}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-[#8B7355] text-sm">UTR</span>
        <div className="flex items-center gap-2">
          <span className="text-[#E8DCC4] font-mono text-sm tracking-wide">
            {d.utr_number}
          </span>

          {/* COPY BUTTON */}
          <button
            onClick={() => navigator.clipboard.writeText(d.utr_number)}
            className="text-xs text-[#C9A84C] hover:underline"
          >
            Copy
          </button>
        </div>
      </div>

    </div>

    {/* 🔥 ACTION BUTTONS */}
    {d.status === "pending" && (
      <div className="flex gap-3 mt-5">

        <button
          onClick={() => approveDeposit(d.id)}
          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-all"
        >
          Approve
        </button>

        <button
          onClick={() => rejectDeposit(d.id)}
          className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold rounded-lg transition-all"
        >
          Reject
        </button>

      </div>
    )}

  </div>
))
          )}
        </div>
      </div>
    );
  };

  const SubscriptionsView = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#E8DCC4]">Subscription Plans</h2>
         <div className="bg-[#111] p-6 rounded-xl border border-[#C9A84C]/20">
          <h3 className="text-[#C9A84C] mb-4">Create Plan</h3>

          <input id="name" placeholder="Plan Name" className="w-full mb-2 p-2 bg-[#0a0a0a] border border-[#333] rounded" />
          <input id="price" type="number" placeholder="Price" className="w-full mb-2 p-2 bg-[#0a0a0a] border border-[#333] rounded" />
          <input id="listings" type="number" placeholder="Max Listings" className="w-full mb-2 p-2 bg-[#0a0a0a] border border-[#333] rounded" />
          <input id="duration" type="number" placeholder="Duration (days)" className="w-full mb-2 p-2 bg-[#0a0a0a] border border-[#333] rounded" />
          <input id="trial" type="number" placeholder="Free Trial Days" className="w-full mb-2 p-2 bg-[#0a0a0a] border border-[#333] rounded" />

          <button
            onClick={async () => {
              const plan = {
                name: (document.getElementById("name") as HTMLInputElement).value,
                price: Number((document.getElementById("price") as HTMLInputElement).value),
                max_listings: Number((document.getElementById("listings") as HTMLInputElement).value),
                duration_days: Number((document.getElementById("duration") as HTMLInputElement).value),
                free_trial_days: Number((document.getElementById("trial") as HTMLInputElement).value)
              };

              await apiRequest("/admin/plans/create/", {
                method: "POST",
                body: plan
              });

              fetchAll(); // refresh page
            }}
            className="bg-[#C9A84C] text-black px-4 py-2 mt-3 rounded"
          >
            Create Plan
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan: any) => (
            <div key={plan.id} className="bg-[#111] border border-[#C9A84C]/20 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-[#C9A84C]">{plan.name}</h3>

              <p className="text-xl font-semibold mt-2">
                {formatCurrency(plan.price)}
              </p>

              <p className="text-sm text-[#8B7355] mt-2">
                Listings: {plan.max_listings}
              </p>

              <p className="text-sm text-[#8B7355]">
                Duration: {plan.duration_days} days
              </p>
               <p className="text-sm text-[#8B7355]">
                Trial: {plan.free_trial_days || 0} days
              </p>

              <p className="text-xs text-[#C9A84C]">
                {plan.price == 0 ? "Free Plan" : "Paid Plan"}
              </p>
              <div className="flex gap-2 mt-4">
                <button
  onClick={() => editPlan(plan)}
  className="flex-1 bg-blue-500/10 text-blue-400 py-2 rounded"
>
  Edit
</button>

                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="flex-1 bg-red-500/10 text-red-400 py-2 rounded"
                  >
                    Delete
                  </button>
                                </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  // ================= LISTINGS VIEW =================
 const ListingsView = () => {
  const filteredListings = listings.filter((l: Listing) => 
    (filterStatus === 'all' || l.status === filterStatus) &&
    l.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#E8DCC4]">Asset Review</h2>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7355]" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#111] border border-[#C9A84C]/20 rounded-lg text-[#E8DCC4]"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-[#111] border border-[#C9A84C]/20 rounded-lg text-[#E8DCC4]"
          >
            <option value="all">All Assets</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {filteredListings.length === 0 ? (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-[#C9A84C]/20 rounded-xl">
            <AlertCircle className="w-12 h-12 text-[#8B7355] mx-auto mb-4" />
            <p className="text-[#8B7355]">No listings found</p>
          </div>
        ) : (

          filteredListings.map((listing: Listing) => {

            // ✅ CLEAN PRICE LOGIC
            const displayPrice = listing.price ?? listing.starting_price ?? 0;

            return (
              <div
                key={listing.id}
                onClick={() => setSelectedListing({ ...listing })}
                className="bg-[#111] border border-[#C9A84C]/20 rounded-xl overflow-hidden hover:border-[#C9A84C]/40 transition-all group cursor-pointer"
              >

                {/* 🔥 MEDIA SECTION FIXED */}
                <div className="relative h-48 bg-[#0a0a0a] overflow-hidden">

                  <div className="flex gap-2 overflow-x-auto p-2">

                    {/* ✅ VIDEO */}
                    {listing.video && (
                      <video
                        src={listing.video}
                        controls
                        className="w-32 h-32 object-cover rounded border"
                      />
                    )}

                    {/* ✅ IMAGES */}
                    {listing.images?.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        className="w-32 h-32 object-cover rounded border"
                      />
                    ))}

                    {/* ✅ EMPTY */}
                    {!listing.video && (!listing.images || listing.images.length === 0) && (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-[#333]" />
                      </div>
                    )}

                  </div>

                  {/* STATUS */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      listing.status === 'approved'
                        ? 'bg-emerald-500 text-black'
                        : listing.status === 'rejected'
                        ? 'bg-red-500 text-white'
                        : 'bg-[#C9A84C] text-black'
                    }`}>
                      {listing.status === 'pending' ? 'Pending' : listing.status}
                    </span>
                  </div>

                </div>

                {/* CONTENT */}
                <div className="p-5">

                  <h3 className="font-semibold text-[#E8DCC4] text-lg line-clamp-1">
                    {listing.title}
                  </h3>

                  <p className="text-sm text-[#8B7355] mb-4 line-clamp-2">
                    {listing.description}
                  </p>

                  {/* PRICE */}
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-[#C9A84C] font-bold text-lg">
                      {formatCurrency(Number(displayPrice))}
                    </span>
                    <span className="text-[#8B7355]">
                      {listing.category}
                    </span>
                  </div>

                  {/* FOOTER */}
                  <div className="flex items-center gap-2 text-xs text-[#8B7355] border-t border-[#C9A84C]/10 pt-4">
                    <User className="w-3.5 h-3.5" />
                    <span>{listing.seller}</span>
                    <span className="mx-2">•</span>
                    <Timer className="w-3.5 h-3.5" />
                    <span>{listing.duration_hours}h</span>
                  </div>

                </div>

              </div>
            );
          })

        )}
      </div>

      {/* MODAL */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}

    </div>
  );
};

  // ================= SETTLEMENTS VIEW =================
  const SettlementsView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#E8DCC4]">Settlement Ledger</h2>
      <div className="bg-[#111] border border-[#C9A84C]/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0a0a0a] border-b border-[#C9A84C]/20">
              <tr>
                <th className="text-left text-[#8B7355] font-medium p-4">ID</th>
                <th className="text-left text-[#8B7355] font-medium p-4">Buyer</th>
                <th className="text-left text-[#8B7355] font-medium p-4">Winning Bid</th>
                <th className="text-left text-[#8B7355] font-medium p-4">Commission</th>
                <th className="text-left text-[#8B7355] font-medium p-4">Seller Payout</th>
                <th className="text-left text-[#8B7355] font-medium p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9A84C]/10">
              {settlements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-[#8B7355] mx-auto mb-4" />
                    <p className="text-[#8B7355]">No settlements yet</p>
                    <p className="text-sm text-[#6B7280]">Settlements appear after auctions complete</p>
                  </td>
                </tr>
              ) : (
                settlements.map((s: Settlement) => (
                  <tr key={s.id} className="hover:bg-white/[0.02]">
                    <td className="p-4"><span className="font-mono text-sm text-[#8B7355]">#{s.id}</span></td>
                    <td className="p-4 text-[#E8DCC4]">{s.buyer}</td>
                    <td className="p-4 text-[#E8DCC4]">{formatCurrency(s.winning_amount)}</td>
                    <td className="p-4 text-[#C9A84C]">{formatCurrency(s.commission)}</td>
                    <td className="p-4 text-emerald-400">{formatCurrency(s.seller_amount)}</td>
                    <td className="p-4 text-[#8B7355]">{formatDate(s.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  // ================== SUBSCRIPTION EDIT ================
  const editPlan = async (plan: any) => {
  const name = prompt("Enter plan name", plan.name);
  const price = prompt("Enter price", plan.price);
  const listings = prompt("Max listings", plan.max_listings);
  const duration = prompt("Duration days", plan.duration_days);
  const trial = prompt("Trial days", plan.free_trial_days);

  if (!name || !price) return;

  try {
    await apiRequest(`/admin/plans/${plan.id}/update/`, {
      method: "PUT",
      body: {
        name,
        price: Number(price),
        max_listings: Number(listings),
        duration_days: Number(duration),
        free_trial_days: Number(trial)
      }
    });

    fetchAll();
  } catch (err) {
    alert("Edit failed");
  }
};
  // ================= AUCTIONS VIEW =================
  const AuctionsView = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-[#E8DCC4]">Live Auctions</h2>

    {auctions.length === 0 ? (
      <div className="bg-[#111] p-10 text-center rounded-xl">
        No auctions found
      </div>
    ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map((a) => (
          <div key={a.id} className="bg-[#111] p-5 rounded-xl border">

            <h3 className="text-lg font-bold">{a.title}</h3>

            <p className="text-sm text-gray-400">
              Seller: {a.seller}
            </p>

            <p className="text-yellow-400 text-xl mt-2">
              ₹ {a.current_price}
            </p>

            <p className="text-sm mt-1">
              Highest Bid: ₹ {a.highest_bid}
            </p>

            <p className="text-sm mt-1">
              Status: {a.status}
            </p>

            <p className="text-xs text-gray-500 mt-2">
              Ends: {new Date(a.end_time).toLocaleString()}
            </p>

            {a.winner && (
              <p className="text-green-400 mt-2">
                Winner: {a.winner}
              </p>
            )}

          </div>
        ))}
      </div>
    )}
  </div>
);
const WithdrawalsView = () => {

  const approve = async (id: number) => {
    await apiRequest(`/admin/withdraw/${id}/approve/`, { method: "POST" });
    fetchAll();
  };

  const reject = async (id: number) => {
    await apiRequest(`/admin/withdraw/${id}/reject/`, { method: "POST" });
    fetchAll();
  };

  return (
    <div className="space-y-4">

      <h2 className="text-2xl font-bold text-[#E8DCC4]">
        Withdraw Requests
      </h2>

      {withdrawals.length === 0 ? (
        <p>No withdrawals</p>
      ) : (
        withdrawals.map((w) => (
          <div key={w.id} className="p-4 border rounded">

            <p>User: {w.user}</p>
            <p>Amount: ₹ {w.amount}</p>
            <p>Status: {w.status}</p>

            {w.status === "pending" && (
              <div className="flex gap-2 mt-2">
                <div className="flex gap-3 mt-3">

  {/*APPROVE BUTTON */}
  <button
    onClick={() => approve(w.id)}
    className="px-4 py-2 rounded-lg font-semibold text-sm 
               bg-emerald-500/10 text-emerald-400 border border-emerald-500/30
               hover:bg-emerald-500 hover:text-black
               transition-all duration-200 shadow-md hover:shadow-emerald-500/30"
  >
    Approve
  </button>

  {/* REJECT BUTTON */}
  <button
    onClick={() => reject(w.id)}
    className="px-4 py-2 rounded-lg font-semibold text-sm 
               bg-red-500/10 text-red-400 border border-red-500/30
               hover:bg-red-500 hover:text-white
               transition-all duration-200 shadow-md hover:shadow-red-500/30"
  >
     Reject
  </button>

</div>
              </div>
            )}

          </div>
        ))
      )}

    </div>
  );
};
  // ================= ERROR STATE =================
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
        <div className="bg-[#111] border border-red-500/30 p-8 rounded-2xl max-w-md text-center max-h-[80vh] overflow-y-auto">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#E8DCC4] mb-2">Load Failed</h2>
          <p className="text-[#8B7355] mb-6">{error}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={fetchAll} className="px-6 py-2 bg-[#C9A84C] hover:bg-[#B8983F] text-black font-medium rounded-lg transition-colors">
              Retry
            </button>
            <button onClick={() => window.location.href = "/admin-login"} className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-medium rounded-lg transition-colors">
              Re-login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-[#C9A84C]/20 border-t-[#C9A84C] rounded-full animate-spin" />
          <p className="text-[#8B7355]">Loading platform data...</p>
        </div>
      </div>
    );
  }

  // ================= MAIN LAYOUT =================
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#E8DCC4] font-sans selection:bg-[#C9A84C]/30">
      <MobileSidebar />
      <DesktopSidebar />
      
      <div className="lg:ml-64">
        <header className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#C9A84C]/20">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-white/5 rounded-lg">
                <Menu className="w-6 h-6 text-[#8B7355]" />
              </button>
              <h1 className="text-xl font-bold text-[#E8DCC4] capitalize">{active.replace('-', ' ')}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-[#8B7355]" />
                {(pendingUsers + pendingDeposits + pendingListings) > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#C9A84C] rounded-full border-2 border-[#0a0a0a]" />
                )}
              </button>
              <div className="w-10 h-10 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] font-bold border border-[#C9A84C]/30 cursor-pointer hover:bg-[#C9A84C]/30 transition-colors">
                A
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {active === "dashboard" && <DashboardView />}
          {active === "users" && <UsersView />}
          {active === "deposits" && <DepositsView />}
          {active === "listings" && <ListingsView />}
          {active === "settlements" && <SettlementsView />}
          {active === "auctions" && <AuctionsView />}
          {active === "subscriptions" && <SubscriptionsView />}
          {active === "bank" && <AdminBank />}
          {active === "seller-banks" && <SellerBanks />}
          {active === "withdrawals" && <WithdrawalsView />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

