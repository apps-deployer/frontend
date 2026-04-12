import { render, screen, fireEvent } from "@testing-library/react";
import { LoginPage } from "../pages/LoginPage";

// Prevent actual navigation
const assignMock = vi.fn();
Object.defineProperty(window, "location", {
  value: { ...window.location, get href() { return "http://localhost/"; }, set href(v) { assignMock(v); } },
  writable: true,
});

describe("LoginPage", () => {
  it("renders app name", () => {
    render(<LoginPage />);
    expect(screen.getByText("AutoDeploy")).toBeInTheDocument();
  });

  it("renders sign in button", () => {
    render(<LoginPage />);
    expect(screen.getByText("Sign in with GitHub")).toBeInTheDocument();
  });

  it("navigates to auth URL on button click", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText("Sign in with GitHub"));
    expect(assignMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/auth/login/github")
    );
  });
});
