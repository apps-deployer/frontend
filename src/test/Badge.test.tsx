import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../components/Badge";

describe("StatusBadge", () => {
  it.each(["pending", "running", "success", "failed"] as const)(
    "renders %s status",
    (status) => {
      render(<StatusBadge status={status} />);
      expect(screen.getByText(status)).toBeInTheDocument();
    }
  );

  it("applies green color for success", () => {
    render(<StatusBadge status="success" />);
    expect(screen.getByText("success")).toHaveClass("bg-green-100");
  });

  it("applies red color for failed", () => {
    render(<StatusBadge status="failed" />);
    expect(screen.getByText("failed")).toHaveClass("bg-red-100");
  });

  it("applies blue color for running", () => {
    render(<StatusBadge status="running" />);
    expect(screen.getByText("running")).toHaveClass("bg-blue-100");
  });
});
