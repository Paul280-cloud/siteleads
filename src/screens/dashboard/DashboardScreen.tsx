import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logOut } from "../../lib/auth";
import { getDashboardStats, type DashboardStats } from "../../lib/dashboard";
import { STATUS_LABELS } from "../../lib/leads";

export default function DashboardScreen() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setStats(await getDashboardStats());
      setLoadError(null);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Could not load dashboard",
      );
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Link to="/leads" className="text-sm text-primary">
            Leads
          </Link>
          <Link to="/map" className="text-sm text-primary">
            Map
          </Link>
          <Link to="/team/invite" className="text-sm text-primary">
            Invite a caller
          </Link>
          <button onClick={handleLogOut} className="text-sm text-primary">
            Log out
          </button>
        </div>
      </div>

      {loading && <p className="text-on-surface-variant">Loading...</p>}
      {loadError && <p className="text-red-600">{loadError}</p>}

      {stats && (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="bg-white rounded-2xl shadow p-5">
              <p className="text-sm text-on-surface-variant">Total leads</p>
              <p className="text-3xl font-bold text-on-surface">
                {stats.total}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow p-5">
              <p className="text-sm text-on-surface-variant">
                Conversion rate
              </p>
              <p className="text-3xl font-bold text-on-surface">
                {Math.round(stats.conversionRate * 100)}%
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow p-5">
              <p className="text-sm text-on-surface-variant">
                Added this week
              </p>
              <p className="text-3xl font-bold text-on-surface">
                {stats.addedThisWeek}
              </p>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-on-surface mb-3">
            Leads by status
          </h2>
          <div className="bg-white rounded-2xl shadow divide-y mb-6">
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <div key={value} className="flex justify-between p-4">
                <span className="text-on-surface">{label}</span>
                <span className="font-medium text-on-surface">
                  {stats.byStatus[value as keyof typeof stats.byStatus]}
                </span>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-semibold text-on-surface mb-3">
            Leads per caller
          </h2>
          {stats.perCaller.length === 0 && (
            <p className="text-on-surface-variant">
              No leads assigned to a caller yet.
            </p>
          )}
          {stats.perCaller.length > 0 && (
            <div className="bg-white rounded-2xl shadow overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-on-surface-variant border-b">
                  <tr>
                    <th className="p-3">Caller</th>
                    <th className="p-3">Assigned</th>
                    <th className="p-3">Converted</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.perCaller.map((c) => (
                    <tr key={c.callerId} className="border-b last:border-0">
                      <td className="p-3 font-medium text-on-surface">
                        {c.fullName}
                      </td>
                      <td className="p-3">{c.assigned}</td>
                      <td className="p-3">{c.converted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
