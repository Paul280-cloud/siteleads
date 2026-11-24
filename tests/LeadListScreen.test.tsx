import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LeadListScreen from "../src/screens/leads/LeadListScreen";
import { AuthProvider } from "../src/context/AuthContext";
import * as leadsLib from "../src/lib/leads";
import * as teamLib from "../src/lib/team";

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
  return { ...actual, listLeads: vi.fn(), addLead: vi.fn(), assignLead: vi.fn() };
});

vi.mock("../src/lib/team", () => ({
  listCallers: vi.fn(),
  inviteCaller: vi.fn(),
}));

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

const sampleCallers = [{ id: "caller-1", full_name: "Caller One", email: "caller1@example.com" }];

describe("LeadListScreen", () => {
  beforeEach(() => {
    vi.mocked(leadsLib.listLeads).mockReset();
    vi.mocked(leadsLib.addLead).mockReset();
    vi.mocked(leadsLib.assignLead).mockReset();
    vi.mocked(teamLib.listCallers).mockReset().mockResolvedValue(sampleCallers);
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
    expect(screen.getAllByText("Caller One").length).toBeGreaterThan(0);
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

  it("assigns an unassigned lead to a caller", async () => {
    vi.mocked(leadsLib.listLeads).mockResolvedValue(sample);
    vi.mocked(leadsLib.assignLead).mockResolvedValue();
    renderScreen();
    await screen.findByText("Apex Plumbing");

    await userEvent.selectOptions(
      screen.getByLabelText("Assign Apex Plumbing"),
      "caller-1",
    );

    expect(leadsLib.assignLead).toHaveBeenCalledWith("1", "caller-1");
  });

  it("shows an error if assigning fails", async () => {
    vi.mocked(leadsLib.listLeads).mockResolvedValue(sample);
    vi.mocked(leadsLib.assignLead).mockRejectedValue(
      new Error("Caller not found in your agency"),
    );
    renderScreen();
    await screen.findByText("Apex Plumbing");

    await userEvent.selectOptions(
      screen.getByLabelText("Assign Apex Plumbing"),
      "caller-1",
    );

    expect(
      await screen.findByText("Caller not found in your agency"),
    ).toBeInTheDocument();
  });
});
