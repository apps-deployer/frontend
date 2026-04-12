import type { RunStatus } from "../types/api";

const colors: Record<RunStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  running: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: RunStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}
