import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UpdateStatusScreen from "../src/screens/leads/UpdateStatusScreen";
import * as leadsLib from "../src/lib/leads";

vi.mock("../src/lib/leads", async () => {
  const actual = await vi.importActual<typeof import("../src/lib/leads")>(
    "../src/lib/leads",
  );
  return {
    ...actual,
    getLead: vi.fn(),
    listLeadNotes: vi.fn(),
    updateLeadStatus: vi.fn(),
  };
});

const sampleLead = {
  id: "lead-1",
  business_name: "Apex Plumbing",
  category: "Plumber",
  area: "Randburg",
  phone: "0110000001",
  status: "new" as const,
  assigned_to: "caller-1",
  assignee: { full_name: "Caller One" },
};

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={["/my-leads/lead-1"]}>
      <Routes>
        <Route path="/my-leads/:id" element={<UpdateStatusScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("UpdateStatusScreen", () => {
  beforeEach(() => {
    vi.mocked(leadsLib.getLead).mockReset();
    vi.mocked(leadsLib.listLeadNotes).mockReset();
    vi.mocked(leadsLib.updateLeadStatus).mockReset();
  });

  it("shows the lead's details and an empty notes state", async () => {
    vi.mocked(leadsLib.getLead).mockResolvedValue(sampleLead);
    vi.mocked(leadsLib.listLeadNotes).mockResolvedValue([]);
    renderScreen();

    expect(await screen.findByText("Apex Plumbing")).toBeInTheDocument();
    expect(screen.getByText(/No notes yet/i)).toBeInTheDocument();
  });

  it("shows existing notes", async () => {
    vi.mocked(leadsLib.getLead).mockResolvedValue(sampleLead);
    vi.mocked(leadsLib.listLeadNotes).mockResolvedValue([
      { id: "n1", note: "Left a voicemail", created_at: "2026-11-24T10:00:00Z" },
    ]);
    renderScreen();

    expect(await screen.findByText("Left a voicemail")).toBeInTheDocument();
  });

  it("saves a new status and note", async () => {
    vi.mocked(leadsLib.getLead).mockResolvedValue(sampleLead);
    vi.mocked(leadsLib.listLeadNotes).mockResolvedValue([]);
    vi.mocked(leadsLib.updateLeadStatus).mockResolvedValue();
    renderScreen();
    await screen.findByText("Apex Plumbing");

    await userEvent.selectOptions(screen.getByLabelText("Status"), "contacted");
    await userEvent.type(
      screen.getByLabelText("Add a note"),
      "Spoke to the owner",
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(leadsLib.updateLeadStatus).toHaveBeenCalledWith(
      "lead-1",
      "contacted",
      "Spoke to the owner",
    );
    expect(await screen.findByText("Saved.")).toBeInTheDocument();
  });

  it("shows an error if saving fails", async () => {
    vi.mocked(leadsLib.getLead).mockResolvedValue(sampleLead);
    vi.mocked(leadsLib.listLeadNotes).mockResolvedValue([]);
    vi.mocked(leadsLib.updateLeadStatus).mockRejectedValue(
      new Error("You can only update leads assigned to you"),
    );
    renderScreen();
    await screen.findByText("Apex Plumbing");

    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("You can only update leads assigned to you"),
    ).toBeInTheDocument();
  });
});
