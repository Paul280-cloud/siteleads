import { useAuth } from "../../context/AuthContext";
import { logOut } from "../../lib/auth";
import { useNavigate } from "react-router-dom";

export default function LeadListScreen() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  async function handleLogOut() {
    await logOut();
    navigate("/log-in", { replace: true });
  }

  return (
    <main className="min-h-screen bg-surface p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Leads</h1>
        <button onClick={handleLogOut} className="text-sm text-primary">
          Log out
        </button>
      </div>
      <p className="text-on-surface-variant">
        Welcome, {profile?.full_name}. No leads yet — this screen is built
        next.
      </p>
    </main>
  );
}
