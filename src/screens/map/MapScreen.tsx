import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { logOut } from "../../lib/auth";
import { listLeads, STATUS_LABELS, type Lead } from "../../lib/leads";
import StatusBadge from "../../components/StatusBadge";

// Matches the badge colors in StatusBadge.tsx, as hex for map pins.
const PIN_COLORS: Record<Lead["status"], string> = {
  new: "#64748b",
  contacted: "#2563eb",
  interested: "#d97706",
  converted: "#16a34a",
  not_interested: "#dc2626",
};

// Johannesburg CBD — a sane default center when there's nothing to fit to yet.
const DEFAULT_CENTER: [number, number] = [-26.2041, 28.0473];

export default function MapScreen() {
  const navigate = useNavigate();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  async function handleLogOut() {
    await logOut();
    navigate("/log-in", { replace: true });
  }

  const located = leads.filter(
    (l): l is Lead & { lat: number; lng: number } =>
      l.lat != null && l.lng != null,
  );
  const center: [number, number] =
    located.length > 0 ? [located[0].lat, located[0].lng] : DEFAULT_CENTER;

  return (
    <main className="min-h-screen bg-surface p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Map</h1>
        <div className="flex items-center gap-4">
          <Link to="/leads" className="text-sm text-primary">
            Leads
          </Link>
          <Link to="/dashboard" className="text-sm text-primary">
            Dashboard
          </Link>
          <button onClick={handleLogOut} className="text-sm text-primary">
            Log out
          </button>
        </div>
      </div>

      {loading && <p className="text-on-surface-variant">Loading leads...</p>}
      {loadError && <p className="text-red-600">{loadError}</p>}

      {!loading && !loadError && leads.length > 0 && located.length === 0 && (
        <p className="text-on-surface-variant mb-4">
          None of your leads have a location yet. Add latitude/longitude when
          adding a lead on the Leads page to see it here.
        </p>
      )}

      {!loading && !loadError && (
        <div
          className="rounded-2xl overflow-hidden shadow"
          style={{ height: "70vh" }}
          data-testid="map-container"
        >
          <MapContainer
            center={center}
            zoom={located.length > 0 ? 12 : 11}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {located.map((lead) => (
              <CircleMarker
                key={lead.id}
                center={[lead.lat, lead.lng]}
                radius={9}
                pathOptions={{
                  color: PIN_COLORS[lead.status],
                  fillColor: PIN_COLORS[lead.status],
                  fillOpacity: 0.9,
                }}
              >
                <Popup>
                  <div>
                    <p className="font-semibold">{lead.business_name}</p>
                    <p className="text-sm text-slate-600">
                      {[lead.category, lead.area].filter(Boolean).join(" · ")}
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={lead.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {lead.assignee?.full_name
                        ? `Assigned to ${lead.assignee.full_name}`
                        : "Unassigned"}
                    </p>
                    <Link
                      to="/leads"
                      className="text-xs text-primary block mt-2"
                    >
                      Go assign in Leads &rarr;
                    </Link>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      )}

      <div className="flex gap-4 mt-4 text-xs text-on-surface-variant">
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <span key={value} className="flex items-center gap-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: PIN_COLORS[value as Lead["status"]] }}
            />
            {label}
          </span>
        ))}
      </div>
    </main>
  );
}
