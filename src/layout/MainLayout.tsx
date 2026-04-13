import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const MainLayout = () => {
  return (
    <div className="bg-[#030A18] text-white min-h-screen flex flex-col">

      <Header />

      {/* ✅ IMPORTANT */}
      <main className="flex-grow pt-[80px]">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      <Footer />

    </div>
  );
};

export default MainLayout;