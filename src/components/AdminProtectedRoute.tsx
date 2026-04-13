import { useEffect, useState, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { apiRequest } from "../services/api";

interface Props {
  children: ReactNode;
}

const AdminProtectedRoute = ({ children }: Props) => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await apiRequest("/user/");   // ✅ use central API

        if (!data || data.error) {
          setIsAuth(false);
          return;
        }

        // 🔥 ONLY ADMIN ACCESS
        if (data.is_admin) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }

      } catch (err) {
        console.error("Auth check failed:", err);
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 🔄 Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Checking authentication...
      </div>
    );
  }

  // 🔐 Protected render
  return isAuth ? children : <Navigate to="/admin" replace />;
};

export default AdminProtectedRoute;