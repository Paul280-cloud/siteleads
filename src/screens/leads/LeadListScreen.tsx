import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import OwnerNav from "../../components/OwnerNav";
import {
  addLead,
  assignLead,
  listLeads,
  STATUS_LABELS,
  type Lead,
  type LeadStatus,
} from "../../lib/leads";
import { listCallers, type TeamCaller } from "../../lib/team";
import StatusBadge from "../../components/StatusBadge";

export default function LeadListScreen() {
  const { profile } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [callers, setCallers] = useState<TeamCaller[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [leadRows, callerRows] = await Promise.all([
        listLeads(),
        listCallers(),
      ]);
      setLeads(leadRows);
      setCallers(callerRows);
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
        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined,
      });
      setBusinessName("");
      setCategory("");
      setArea("");
      setPhone("");
      setLat("");
      setLng("");
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not add lead");
    } finally {
      setSaving(false);
    }
  }

  async function handleAssign(leadId: string, callerId: string) {
    if (!callerId) return;
    setAssignError(null);
    setAssigningId(leadId);
    try {
      await assignLead(leadId, callerId);
      await load();
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : "Could not assign lead");
    } finally {
      setAssigningId(null);
    }
  }

  const visible =
    statusFilter === "all"
      ? leads
      : leads.filter((l) => l.status === statusFilter);

  return (
    <main className="min-h-screen bg-surface p-6 md:p-8">
      <OwnerNav title="Leads" />

      <form
        onSubmit={handleAdd}
        className="bg-white border border-line p-5 mb-6 grid gap-3 md:grid-cols-5"
        aria-label="Add a lead"
      >
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide md:col-span-5 -mb-1">
          Add a lead
        </p>
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
        <input
          placeholder="Latitude (optional, for map)"
          aria-label="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        />
        <input
          placeholder="Longitude (optional, for map)"
          aria-label="Longitude"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        />
        <button
          type="submit"
          disabled={saving}
          className="py-2.5 rounded-full bg-primary text-white font-semibold disabled:opacity-50 md:col-span-5 hover:bg-primary-dark transition-colors"
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
      {assignError && <p className="text-red-600 mb-2">{assignError}</p>}

      {!loading && !loadError && visible.length === 0 && (
        <p className="text-on-surface-variant">
          No leads yet. Add your first one above.
        </p>
      )}

      {visible.length > 0 && (
        <div className="bg-white border border-line overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-on-surface-variant border-b border-line">
              <tr>
                <th className="p-3 font-semibold">Business</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Area</th>
                <th className="p-3 font-semibold">Phone</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Assigned to</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-line last:border-0 hover:bg-surface-container/40 transition-colors"
                >
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
                    <select
                      aria-label={`Assign ${lead.business_name}`}
                      value={lead.assigned_to ?? ""}
                      disabled={assigningId === lead.id}
                      onChange={(e) => handleAssign(lead.id, e.target.value)}
                      className="px-2 py-1 border rounded-lg bg-white text-sm"
                    >
                      <option value="" disabled>
                        {lead.assignee?.full_name ?? "Unassigned"}
                      </option>
                      {callers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.full_name}
                        </option>
                      ))}
                    </select>
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
