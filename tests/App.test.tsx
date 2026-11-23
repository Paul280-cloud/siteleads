import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import App from "../src/App";
import { AuthProvider } from "../src/context/AuthContext";

vi.mock("../src/lib/auth", () => ({
  getMyProfile: vi.fn().mockResolvedValue(null),
  logIn: vi.fn(),
  logOut: vi.fn(),
  signUpOwner: vi.fn(),
}));

describe("App", () => {
  it("shows the welcome screen when logged out", async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>,
    );
    expect(
      await screen.findByText(/Stop hunting for clients/i),
    ).toBeInTheDocument();
  });
});
