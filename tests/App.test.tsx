import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../src/App";

describe("App", () => {
  it("renders the welcome screen headline", () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    expect(
      screen.getByText(/Stop hunting for clients/i),
    ).toBeInTheDocument();
  });
});
