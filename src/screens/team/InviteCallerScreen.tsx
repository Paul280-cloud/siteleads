import { useCallback, useEffect, useState, type FormEvent } from "react";
import { inviteCaller, listCallers, type TeamCaller } from "../../lib/team";
import OwnerNav from "../../components/OwnerNav";

export default function InviteCallerScreen() {
  const [callers, setCallers] = useState<TeamCaller[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setCallers(await listCallers());
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load team");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const created = await inviteCaller({ fullName, email, password });
      setSuccess(
        `Caller ${created.email} created. Share their email and the temporary password with them.`,
      );
      setFullName("");
      setEmail("");
      setPassword("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not invite caller");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface p-6 md:p-8">
      <OwnerNav title="Invite a Caller" />

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-line p-6 mb-6 max-w-md"
        aria-label="Invite a caller"
      >
        <label className="block text-sm font-medium mb-1" htmlFor="callerName">
          Full name
        </label>
        <input
          id="callerName"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded-lg"
        />

        <label className="block text-sm font-medium mb-1" htmlFor="callerEmail">
          Email
        </label>
        <input
          id="callerEmail"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded-lg"
        />

        <label className="block text-sm font-medium mb-1" htmlFor="callerPassword">
          Temporary password
        </label>
        <input
          id="callerPassword"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-1 px-3 py-2 border rounded-lg"
        />
        <p className="text-xs text-on-surface-variant mb-4">
          At least 6 characters. You will share this with the caller yourself.
        </p>

        {error && (
          <p className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}
        {success && (
          <p className="bg-green-50 text-green-700 text-sm rounded-lg px-3 py-2 mb-4">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-full bg-primary text-white font-semibold disabled:opacity-50 hover:bg-primary-dark transition-colors"
        >
          {saving ? "Creating..." : "Create caller"}
        </button>
      </form>

      <h2 className="font-display font-bold text-xl text-on-surface mb-3">Your callers</h2>
      {loadError && <p className="text-red-600">{loadError}</p>}
      {!loadError && callers.length === 0 && (
        <p className="text-on-surface-variant">No callers yet.</p>
      )}
      {callers.length > 0 && (
        <ul className="bg-white border border-line divide-y divide-line max-w-md">
          {callers.map((c) => (
            <li key={c.id} className="p-4 flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-surface-container text-primary font-bold flex items-center justify-center text-sm shrink-0">
                {c.full_name.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="font-medium text-on-surface">{c.full_name}</p>
                <p className="text-sm text-on-surface-variant">{c.email}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
