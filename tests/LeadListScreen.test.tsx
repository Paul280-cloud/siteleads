import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LeadListScreen from "../src/screens/leads/LeadListScreen";
import { AuthProvider } from "../src/context/AuthContext";
import * as leadsLib from "../src/lib/leads";

vi.mock("../src/lib/auth", () => ({
  getMyProfile: vi.fn().mockResolvedValue({
    id: "owner-1",
    email: "owner@example.com",
    full_name: "Owner One",
    role: "owner",
    agency_id: "agency-1",
  }),
  logOut: vi.fn(),
}));

vi.mock("../src/lib/leads", async () => {
  const actual = await vi.importActual<typeof import("../src/lib/leads")>(
    "../src/lib/leads",
  );
  return { ...actual, listLeads: vi.fn(), addLead: vi.fn() };
});

function renderScreen() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LeadListScreen />
      </AuthProvider>
    </MemoryRouter>,
  );
}

const sample = [
  {
    id: "1",
    business_name: "Apex Plumbing",
    category: "Plumber",
    area: "Randburg",
    phone: "0110000001",
    status: "new" as const,
    assigned_to: null,
    assignee: null,
  },
  {
    id: "2",
    business_name: "Glow Hair",
    category: "Salon",
    area: "Sandton",
    phone: "0110000003",
    status: "converted" as const,
    assigned_to: "caller-1",
    assignee: { full_name: "Caller One" },
  },
];

describe("LeadListScreen", () => {
  beforeEach(() => {
    vi.mocked(leadsLib.listLeads).mockReset();
    vi.mocked(leadsLib.addLead).mockReset();
  });

  it("shows an empty state when there are no leads", async () => {
    vi.mocked(leadsLib.listLeads).mockResolvedValue([]);
    renderScreen();
    expect(await screen.findByText(/No leads yet/i)).toBeInTheDocument();
  });

  it("lists leads with their status and assigned caller", async () => {
    vi.mocked(leadsLib.listLeads).mockResolvedValue(sample);
    renderScreen();
    expect(await screen.findByText("Apex Plumbing")).toBeInTheDocument();
    expect(screen.getByText("Glow Hair")).toBeInTheDocument();
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
    expect(screen.getByText("Caller One")).toBeInTheDocument();
  });

  it("filters the list by status", async () => {
    vi.mocked(leadsLib.listLeads).mockResolvedValue(sample);
    renderScreen();
    await screen.findByText("Apex Plumbing");

    await userEvent.selectOptions(screen.getByLabelText("Status"), "converted");

    expect(screen.queryByText("Apex Plumbing")).not.toBeInTheDocument();
    expect(screen.getByText("Glow Hair")).toBeInTheDocument();
  });

  it("adds a lead for the owner's agency", async () => {
    vi.mocked(leadsLib.listLeads).mockResolvedValue([]);
    vi.mocked(leadsLib.addLead).mockResolvedValue();
    renderScreen();
    await screen.findByText(/No leads yet/i);

    await userEvent.type(screen.getByLabelText("Business name"), "Bright Minds");
    await userEvent.click(screen.getByRole("button", { name: "Add lead" }));

    expect(leadsLib.addLead).toHaveBeenCalledWith(
      expect.objectContaining({
        agencyId: "agency-1",
        businessName: "Bright Minds",
      }),
    );
  });
});
