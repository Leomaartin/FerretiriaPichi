import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useRef } from "react";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const isAdmin = user?.admin === true;
  const toastShown = useRef(false);

  useEffect(() => {
    if (!isAdmin && !toastShown.current) {
      toastShown.current = true;
      toast.error("No tenés permisos para acceder a esta página.");
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
