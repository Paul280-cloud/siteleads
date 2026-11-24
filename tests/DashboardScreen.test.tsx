import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardScreen from "../src/screens/dashboard/DashboardScreen";
import * as dashboardLib from "../src/lib/dashboard";

vi.mock("../src/lib/auth", () => ({
  logOut: vi.fn(),
}));

vi.mock("../src/lib/dashboard", async () => {
  const actual = await vi.importActual<typeof import("../src/lib/dashboard")>(
    "../src/lib/dashboard",
  );
  return { ...actual, getDashboardStats: vi.fn() };
});

function renderScreen() {
  return render(
    <MemoryRouter>
      <DashboardScreen />
    </MemoryRouter>,
  );
}

describe("DashboardScreen", () => {
  beforeEach(() => {
    vi.mocked(dashboardLib.getDashboardStats).mockReset();
  });

  it("shows stat cards, status breakdown, and per-caller table", async () => {
    vi.mocked(dashboardLib.getDashboardStats).mockResolvedValue({
      total: 4,
      conversionRate: 0.5,
      addedThisWeek: 2,
      byStatus: {
        new: 1,
        contacted: 1,
        interested: 0,
        converted: 2,
        not_interested: 0,
      },
      perCaller: [
        { callerId: "c1", fullName: "Caller One", assigned: 3, converted: 2 },
      ],
    });

    renderScreen();

    expect(await screen.findByText("4")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("Caller One")).toBeInTheDocument();
  });

  it("shows an empty state for leads per caller", async () => {
    vi.mocked(dashboardLib.getDashboardStats).mockResolvedValue({
      total: 0,
      conversionRate: 0,
      addedThisWeek: 0,
      byStatus: {
        new: 0,
        contacted: 0,
        interested: 0,
        converted: 0,
        not_interested: 0,
      },
      perCaller: [],
    });

    renderScreen();

    expect(
      await screen.findByText("No leads assigned to a caller yet."),
    ).toBeInTheDocument();
  });
});
