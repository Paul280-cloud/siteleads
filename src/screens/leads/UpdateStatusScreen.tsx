import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getLead,
  listLeadNotes,
  STATUS_LABELS,
  updateLeadStatus,
  type Lead,
  type LeadNote,
  type LeadStatus,
} from "../../lib/leads";
import StatusBadge from "../../components/StatusBadge";

export default function UpdateStatusScreen() {
  const { id } = useParams<{ id: string }>();

  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [status, setStatus] = useState<LeadStatus>("new");
  const [note, setNote] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [leadRow, noteRows] = await Promise.all([
        getLead(id),
        listLeadNotes(id),
      ]);
      setLead(leadRow);
      setStatus(leadRow.status);
      setNotes(noteRows);
      setLoadError(null);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Could not load this lead",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSaveError(null);
    setSaved(false);
    setSaving(true);
    try {
      await updateLeadStatus(id, status, note);
      setNote("");
      setSaved(true);
      await load();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not update this lead",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-surface p-6 md:p-8">
        <p className="text-on-surface-variant">Loading...</p>
      </main>
    );
  }

  if (loadError || !lead) {
    return (
      <main className="min-h-screen bg-surface p-6 md:p-8">
        <p className="text-red-600">{loadError ?? "Lead not found"}</p>
        <Link to="/my-leads" className="text-sm text-primary">
          Back to My Leads
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface p-6 md:p-8">
      <Link to="/my-leads" className="text-sm text-primary">
        Back to My Leads
      </Link>

      <div className="flex items-center justify-between mt-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">
            {lead.business_name}
          </h1>
          <p className="text-sm text-on-surface-variant">
            {[lead.category, lead.area, lead.phone].filter(Boolean).join(" · ")}
          </p>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow p-6 mb-6 max-w-md"
        aria-label="Update lead status"
      >
        <label className="block text-sm font-medium mb-1" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as LeadStatus)}
          className="w-full mb-4 px-3 py-2 border rounded-lg bg-white"
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium mb-1" htmlFor="note">
          Add a note
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full mb-4 px-3 py-2 border rounded-lg"
          placeholder="What happened on the call?"
        />

        {saveError && <p className="text-red-600 text-sm mb-4">{saveError}</p>}
        {saved && (
          <p className="text-green-700 text-sm mb-4">Saved.</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-full bg-primary text-white font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </form>

      <h2 className="text-lg font-semibold text-on-surface mb-3">Notes</h2>
      {notes.length === 0 && (
        <p className="text-on-surface-variant">No notes yet.</p>
      )}
      {notes.length > 0 && (
        <ul className="bg-white rounded-2xl shadow divide-y max-w-md">
          {notes.map((n) => (
            <li key={n.id} className="p-4">
              <p className="text-on-surface">{n.note}</p>
              <p className="text-xs text-on-surface-variant mt-1">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
