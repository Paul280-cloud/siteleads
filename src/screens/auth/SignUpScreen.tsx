import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUpOwner } from "../../lib/auth";

export default function SignUpScreen() {
  const [agencyName, setAgencyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signUpOwner({ email, password, fullName, agencyName });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign up");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl shadow p-8"
      >
        <h1 className="text-2xl font-bold text-on-surface mb-2">
          Create Agency Account
        </h1>
        <p className="text-sm text-on-surface-variant mb-6">
          Callers are invited by their agency owner, not signed up directly.
        </p>

        <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="agencyName">
          Agency name
        </label>
        <input
          id="agencyName"
          required
          value={agencyName}
          onChange={(e) => setAgencyName(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded-lg"
        />

        <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="fullName">
          Your full name
        </label>
        <input
          id="fullName"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded-lg"
        />

        <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded-lg"
        />

        <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded-lg"
        />

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-full bg-primary text-white font-semibold disabled:opacity-50"
        >
          {submitting ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-sm text-on-surface-variant mt-4 text-center">
          Already have an account?{" "}
          <Link to="/log-in" className="text-primary font-medium">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
