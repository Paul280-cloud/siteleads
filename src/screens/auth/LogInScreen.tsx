import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { logIn } from "../../lib/auth";

export default function LogInScreen() {
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
      await logIn(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-7 h-7 bg-primary flex items-center justify-center text-surface font-display font-bold text-xs">
          S
        </span>
        <span className="font-display font-bold text-sm tracking-wide text-on-surface">
          SITELEADS
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-line p-8"
      >
        <h1 className="font-display font-black text-3xl text-on-surface mb-6">
          Welcome back
        </h1>

        <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />

        <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />

        {error && (
          <p className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-full bg-primary text-white font-semibold disabled:opacity-50 hover:bg-primary-dark transition-colors"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>

        <p className="text-sm text-on-surface-variant mt-4 text-center">
          No agency account yet?{" "}
          <Link to="/sign-up" className="text-primary font-medium">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}
