import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logOut } from "../../lib/auth";
import {
  addLead,
  listLeads,
  STATUS_LABELS,
  type Lead,
  type LeadStatus,
} from "../../lib/leads";
import StatusBadge from "../../components/StatusBadge";

export default function LeadListScreen() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
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

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setFormError(null);
    setSaving(true);
    try {
      await addLead({
        agencyId: profile.agency_id,
        businessName,
        category,
        area,
        phone,
      });
      setBusinessName("");
      setCategory("");
      setArea("");
      setPhone("");
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not add lead");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogOut() {
    await logOut();
    navigate("/log-in", { replace: true });
  }

  const visible =
    statusFilter === "all"
      ? leads
      : leads.filter((l) => l.status === statusFilter);

  return (
    <main className="min-h-screen bg-surface p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Leads</h1>
        <button onClick={handleLogOut} className="text-sm text-primary">
          Log out
        </button>
      </div>

      <form
        onSubmit={handleAdd}
        className="bg-white rounded-2xl shadow p-4 mb-6 grid gap-3 md:grid-cols-5"
        aria-label="Add a lead"
      >
        <input
          required
          placeholder="Business name"
          aria-label="Business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="px-3 py-2 border rounded-lg md:col-span-2"
        />
        <input
          placeholder="Category"
          aria-label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        />
        <input
          placeholder="Area"
          aria-label="Area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        />
        <input
          placeholder="Phone"
          aria-label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        />
        <button
          type="submit"
          disabled={saving}
          className="py-2 rounded-full bg-primary text-white font-semibold disabled:opacity-50 md:col-span-5"
        >
          {saving ? "Adding..." : "Add lead"}
        </button>
        {formError && (
          <p className="text-red-600 text-sm md:col-span-5">{formError}</p>
        )}
      </form>

      <div className="flex items-center gap-3 mb-4">
        <label htmlFor="statusFilter" className="text-sm text-on-surface-variant">
          Status
        </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "all")}
          className="px-3 py-2 border rounded-lg bg-white"
        >
          <option value="all">All</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-on-surface-variant">Loading leads...</p>}
      {loadError && <p className="text-red-600">{loadError}</p>}

      {!loading && !loadError && visible.length === 0 && (
        <p className="text-on-surface-variant">
          No leads yet. Add your first one above.
        </p>
      )}

      {visible.length > 0 && (
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-on-surface-variant border-b">
              <tr>
                <th className="p-3">Business</th>
                <th className="p-3">Category</th>
                <th className="p-3">Area</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned to</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((lead) => (
                <tr key={lead.id} className="border-b last:border-0">
                  <td className="p-3 font-medium text-on-surface">
                    {lead.business_name}
                  </td>
                  <td className="p-3">{lead.category ?? "-"}</td>
                  <td className="p-3">{lead.area ?? "-"}</td>
                  <td className="p-3">{lead.phone ?? "-"}</td>
                  <td className="p-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="p-3">
                    {lead.assignee?.full_name ?? "Unassigned"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
