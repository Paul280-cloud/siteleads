import { Link, useLocation, useNavigate } from "react-router-dom";
import { logOut } from "../lib/auth";

const LINKS = [
  { to: "/leads", label: "Leads" },
  { to: "/map", label: "Map" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/team/invite", label: "Invite a caller" },
];

export default function OwnerNav({ title }: { title: string }) {
  const location = useLocation();
  const navigate = useNavigate();

  async function handleLogOut() {
    await logOut();
    navigate("/log-in", { replace: true });
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-6 h-6 bg-primary flex items-center justify-center text-surface font-display font-bold text-xs">
          S
        </span>
        <span className="font-display font-bold text-sm tracking-wide text-on-surface">
          SITELEADS
        </span>
      </div>

      <div className="flex justify-between items-end flex-wrap gap-4 border-b border-line pb-0">
        <h1 className="font-display font-black text-4xl text-on-surface">
          {title}
        </h1>
        <nav className="flex items-center gap-5">
          {LINKS.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium pb-3 border-b-2 -mb-px transition-colors ${
                  active
                    ? "border-accent text-on-surface"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogOut}
            className="text-sm font-medium pb-3 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Log out
          </button>
        </nav>
      </div>
    </div>
  );
}
