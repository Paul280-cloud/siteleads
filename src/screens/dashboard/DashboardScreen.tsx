import { useCallback, useEffect, useState } from "react";
import OwnerNav from "../../components/OwnerNav";
import { getDashboardStats, type DashboardStats } from "../../lib/dashboard";
import { STATUS_LABELS } from "../../lib/leads";

const STATUS_DOT: Record<string, string> = {
  new: "bg-slate-400",
  contacted: "bg-blue-500",
  interested: "bg-amber-500",
  converted: "bg-green-500",
  not_interested: "bg-red-500",
};

export default function DashboardScreen() {
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

  return (
    <main className="min-h-screen bg-surface p-6 md:p-8">
      <OwnerNav title="Dashboard" />

      {loading && <p className="text-on-surface-variant">Loading...</p>}
      {loadError && <p className="text-red-600">{loadError}</p>}

      {stats && (
        <>
          <div className="grid grid-cols-3 border-t border-b border-line mb-8">
            <div className="p-5 border-r border-line">
              <p className="text-sm text-on-surface-variant mb-1">
                Total leads
              </p>
              <p className="font-mono text-4xl font-semibold text-on-surface">
                {stats.total}
              </p>
            </div>
            <div className="p-5 border-r border-line">
              <p className="text-sm text-on-surface-variant mb-1">
                Conversion rate
              </p>
              <p className="font-mono text-4xl font-semibold text-on-surface">
                {Math.round(stats.conversionRate * 100)}%
              </p>
            </div>
            <div className="p-5">
              <p className="text-sm text-on-surface-variant mb-1">
                Added this week
              </p>
              <p className="font-mono text-4xl font-semibold text-on-surface">
                {stats.addedThisWeek}
              </p>
            </div>
          </div>

          <h2 className="font-display font-bold text-xl text-on-surface mb-3">
            Leads by status
          </h2>
          <div className="border-t border-line divide-y divide-line mb-8">
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <div key={value} className="flex justify-between items-center p-4">
                <span className="flex items-center gap-2 text-on-surface">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[value]}`}
                  />
                  {label}
                </span>
                <span className="font-semibold text-on-surface">
                  {stats.byStatus[value as keyof typeof stats.byStatus]}
                </span>
              </div>
            ))}
          </div>

          <h2 className="font-display font-bold text-xl text-on-surface mb-3">
            Leads per caller
          </h2>
          {stats.perCaller.length === 0 && (
            <p className="text-on-surface-variant">
              No leads assigned to a caller yet.
            </p>
          )}
          {stats.perCaller.length > 0 && (
            <div className="border border-line overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-on-surface-variant border-b border-line">
                  <tr>
                    <th className="p-3 font-semibold">Caller</th>
                    <th className="p-3 font-semibold">Assigned</th>
                    <th className="p-3 font-semibold">Converted</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.perCaller.map((c) => (
                    <tr
                      key={c.callerId}
                      className="border-b border-line last:border-0 hover:bg-surface-container/40 transition-colors"
                    >
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
