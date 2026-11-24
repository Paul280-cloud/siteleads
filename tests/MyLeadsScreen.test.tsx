import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MyLeadsScreen from "../src/screens/leads/MyLeadsScreen";
import { AuthProvider } from "../src/context/AuthContext";
import * as leadsLib from "../src/lib/leads";

vi.mock("../src/lib/auth", () => ({
  getMyProfile: vi.fn().mockResolvedValue({
    id: "caller-1",
    email: "caller@example.com",
    full_name: "Caller One",
    role: "caller",
    agency_id: "agency-1",
  }),
  logOut: vi.fn(),
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
      <AuthProvider>
        <MyLeadsScreen />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("MyLeadsScreen", () => {
  beforeEach(() => {
    vi.mocked(leadsLib.listLeads).mockReset();
  });

  it("shows an empty state when no leads are assigned", async () => {
    vi.mocked(leadsLib.listLeads).mockResolvedValue([]);
    renderScreen();
    expect(
      await screen.findByText(/No leads assigned to you yet/i),
    ).toBeInTheDocument();
  });

  it("lists leads assigned to the caller, each linking to its own page", async () => {
    vi.mocked(leadsLib.listLeads).mockResolvedValue([
      {
        id: "lead-1",
        business_name: "Apex Plumbing",
        category: "Plumber",
        area: "Randburg",
        phone: "0110000001",
        status: "contacted",
        assigned_to: "caller-1",
        assignee: { full_name: "Caller One" },
        lat: null,
        lng: null,
      },
    ]);
    renderScreen();

    const link = await screen.findByRole("link", { name: /Apex Plumbing/i });
    expect(link).toHaveAttribute("href", "/my-leads/lead-1");
    expect(screen.getByText("Contacted")).toBeInTheDocument();
  });
});
