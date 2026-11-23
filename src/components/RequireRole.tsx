import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../lib/auth";

export default function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { loading, profile } = useAuth();

  if (loading) return <div className="p-8 text-on-surface-variant">Loading...</div>;
  if (!profile) return <Navigate to="/log-in" replace />;
  if (profile.role !== role) {
    return <Navigate to={profile.role === "owner" ? "/leads" : "/my-leads"} replace />;
  }
  return <>{children}</>;
}
