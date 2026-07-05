import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isLoggingOut =
    sessionStorage.getItem("logout-redirect") === "true";

  if (isAuthenticated) {
    return <>{children}</>;
  }

  if (isLoggingOut) {
    return <Navigate to="/products" replace />;
  }

  const redirectTo = `${location.pathname}${location.search}`;

  return (
    <Navigate
      to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
      replace
    />
  );
}