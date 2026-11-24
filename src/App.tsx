import { Routes, Route } from "react-router-dom";
import WelcomeScreen from "./screens/welcome/WelcomeScreen";
import LogInScreen from "./screens/auth/LogInScreen";
import SignUpScreen from "./screens/auth/SignUpScreen";
import LeadListScreen from "./screens/leads/LeadListScreen";
import MyLeadsScreen from "./screens/leads/MyLeadsScreen";
import UpdateStatusScreen from "./screens/leads/UpdateStatusScreen";
import InviteCallerScreen from "./screens/team/InviteCallerScreen";
import DashboardScreen from "./screens/dashboard/DashboardScreen";
import MapScreen from "./screens/map/MapScreen";
import RequireRole from "./components/RequireRole";
import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

function HomeRedirect() {
  const { loading, profile } = useAuth();
  if (loading) return <div className="p-8">Loading...</div>;
  if (!profile) return <WelcomeScreen />;
  return <Navigate to={profile.role === "owner" ? "/leads" : "/my-leads"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/log-in" element={<LogInScreen />} />
      <Route path="/sign-up" element={<SignUpScreen />} />
      <Route
        path="/leads"
        element={
          <RequireRole role="owner">
            <LeadListScreen />
          </RequireRole>
        }
      />
      <Route
        path="/map"
        element={
          <RequireRole role="owner">
            <MapScreen />
          </RequireRole>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireRole role="owner">
            <DashboardScreen />
          </RequireRole>
        }
      />
      <Route
        path="/team/invite"
        element={
          <RequireRole role="owner">
            <InviteCallerScreen />
          </RequireRole>
        }
      />
      <Route
        path="/my-leads"
        element={
          <RequireRole role="caller">
            <MyLeadsScreen />
          </RequireRole>
        }
      />
      <Route
        path="/my-leads/:id"
        element={
          <RequireRole role="caller">
            <UpdateStatusScreen />
          </RequireRole>
        }
      />
    </Routes>
  );
}
