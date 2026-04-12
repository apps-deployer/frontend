import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "../components/Modal";

describe("Modal", () => {
  it("renders title and children", () => {
    render(
      <Modal title="Test Modal" onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("calls onClose when × button clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal title="Title" onClose={onClose}>
        <p>content</p>
      </Modal>
    );
    fireEvent.click(screen.getByText("×"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when backdrop clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal title="Title" onClose={onClose}>
        <p>content</p>
      </Modal>
    );
    // Click the outer backdrop div (first child of container)
    fireEvent.click(container.firstChild!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does NOT call onClose when modal panel clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal title="Title" onClose={onClose}>
        <p>content</p>
      </Modal>
    );
    // Click content inside the panel — should not close
    fireEvent.click(screen.getByText("content"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn();
    render(
      <Modal title="Title" onClose={onClose}>
        <p>content</p>
      </Modal>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
