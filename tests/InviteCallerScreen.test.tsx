import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InviteCallerScreen from "../src/screens/team/InviteCallerScreen";
import * as team from "../src/lib/team";

vi.mock("../src/lib/team", () => ({
  listCallers: vi.fn(),
  inviteCaller: vi.fn(),
}));

function renderScreen() {
  return render(
    <MemoryRouter>
      <InviteCallerScreen />
    </MemoryRouter>,
  );
}

async function fillForm() {
  await userEvent.type(screen.getByLabelText("Full name"), "Caller One");
  await userEvent.type(screen.getByLabelText("Email"), "caller@example.com");
  await userEvent.type(screen.getByLabelText("Temporary password"), "secret12");
}

describe("InviteCallerScreen", () => {
  beforeEach(() => {
    vi.mocked(team.listCallers).mockReset();
    vi.mocked(team.inviteCaller).mockReset();
  });

  it("shows an empty state when there are no callers", async () => {
    vi.mocked(team.listCallers).mockResolvedValue([]);
    renderScreen();
    expect(await screen.findByText("No callers yet.")).toBeInTheDocument();
  });

  it("lists the agency's callers", async () => {
    vi.mocked(team.listCallers).mockResolvedValue([
      { id: "1", full_name: "Thandi Caller", email: "thandi@example.com" },
    ]);
    renderScreen();
    expect(await screen.findByText("Thandi Caller")).toBeInTheDocument();
    expect(screen.getByText("thandi@example.com")).toBeInTheDocument();
  });

  it("sends what the owner typed and confirms the new caller", async () => {
    vi.mocked(team.listCallers).mockResolvedValue([]);
    vi.mocked(team.inviteCaller).mockResolvedValue({
      id: "9",
      email: "caller@example.com",
    });
    renderScreen();
    await screen.findByText("No callers yet.");

    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: "Create caller" }));

    expect(team.inviteCaller).toHaveBeenCalledWith({
      fullName: "Caller One",
      email: "caller@example.com",
      password: "secret12",
    });
    expect(
      await screen.findByText(/Caller caller@example.com created/i),
    ).toBeInTheDocument();
  });

  it("shows the server's error message when the invite fails", async () => {
    vi.mocked(team.listCallers).mockResolvedValue([]);
    vi.mocked(team.inviteCaller).mockRejectedValue(
      new Error("Only an agency owner can invite callers"),
    );
    renderScreen();
    await screen.findByText("No callers yet.");

    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: "Create caller" }));

    expect(
      await screen.findByText("Only an agency owner can invite callers"),
    ).toBeInTheDocument();
  });
});
