import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MapScreen from "../src/screens/map/MapScreen";
import * as leadsLib from "../src/lib/leads";

vi.mock("../src/lib/auth", () => ({
  logOut: vi.fn(),
}));

// react-leaflet needs real browser layout (it measures the container),
// which jsdom doesn't provide. Replace it with plain markup so we can
// assert on what MapScreen passes in, without touching the real Leaflet.
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  TileLayer: () => null,
  CircleMarker: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pin">{children}</div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("../src/lib/leads", async () => {
  const actual = await vi.importActual<typeof import("../src/lib/leads")>(
    "../src/lib/leads",
  );
  return { ...actual, listLeads: vi.fn() };
});

function renderScreen() {
  return render(
    <MemoryRouter>
      <MapScreen />
    </MemoryRouter>,
  );
}

describe("MapScreen", () => {
  beforeEach(() => {
    vi.mocked(leadsLib.listLeads).mockReset();
  });

  it("shows a pin for each lead that has a location", async () => {
    vi.mocked(leadsLib.listLeads).mockResolvedValue([
      {
        id: "1",
        business_name: "Apex Plumbing",
        category: "Plumber",
        area: "Randburg",
        phone: "0110000001",
        status: "new",
        assigned_to: null,
        assignee: null,
        lat: -26.1,
        lng: 28.0,
      },
      {
        id: "2",
        business_name: "No Location Yet",
        category: null,
        area: null,
        phone: null,
        status: "new",
        assigned_to: null,
        assignee: null,
        lat: null,
        lng: null,
      },
    ]);

    renderScreen();

    await screen.findByTestId("map");
    expect(screen.getAllByTestId("pin")).toHaveLength(1);
    expect(screen.getByText("Apex Plumbing")).toBeInTheDocument();
    expect(screen.queryByText("No Location Yet")).not.toBeInTheDocument();
  });

  it("tells the owner when no leads have a location yet", async () => {
    vi.mocked(leadsLib.listLeads).mockResolvedValue([
      {
        id: "1",
        business_name: "Apex Plumbing",
        category: null,
        area: null,
        phone: null,
        status: "new",
        assigned_to: null,
        assignee: null,
        lat: null,
        lng: null,
      },
    ]);

    renderScreen();

    expect(
      await screen.findByText(/None of your leads have a location yet/i),
    ).toBeInTheDocument();
  });
});
