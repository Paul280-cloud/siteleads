import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logOut } from "../../lib/auth";
import { listLeads, type Lead } from "../../lib/leads";
import StatusBadge from "../../components/StatusBadge";

export default function MyLeadsScreen() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      // RLS already limits this to leads assigned to the logged-in caller.
      setLeads(await listLeads());
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleLogOut() {
    await logOut();
    navigate("/log-in", { replace: true });
  }

  return (
    <main className="min-h-screen bg-surface p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-6 h-6 bg-primary flex items-center justify-center text-surface font-display font-bold text-xs">
          S
        </span>
        <span className="font-display font-bold text-sm tracking-wide text-on-surface">
          SITELEADS
        </span>
      </div>

      <div className="flex justify-between items-end mb-6 border-b border-line pb-4">
        <div>
          <h1 className="font-display font-black text-4xl text-on-surface">
            My Leads
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Welcome, {profile?.full_name}.
          </p>
        </div>
        <button
          onClick={handleLogOut}
          className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
        >
          Log out
        </button>
      </div>

      {loading && <p className="text-on-surface-variant">Loading leads...</p>}
      {loadError && <p className="text-red-600">{loadError}</p>}

      {!loading && !loadError && leads.length === 0 && (
        <p className="text-on-surface-variant">
          No leads assigned to you yet.
        </p>
      )}

      {leads.length > 0 && (
        <div className="bg-white border border-line divide-y divide-line">
          {leads.map((lead) => (
            <Link
              key={lead.id}
              to={`/my-leads/${lead.id}`}
              className="flex items-center justify-between p-4 hover:bg-surface-container transition-colors"
            >
              <div>
                <p className="font-medium text-on-surface">
                  {lead.business_name}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {[lead.category, lead.area].filter(Boolean).join(" · ") ||
                    "-"}
                </p>
              </div>
              <StatusBadge status={lead.status} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
