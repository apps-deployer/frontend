import { useEffect, useState, type FormEvent } from "react";
import {
  createEnvVar,
  createProjectVar,
  deleteEnvVar,
  deleteProjectVar,
  listEnvVars,
  listProjectVars,
  updateEnvVar,
  updateProjectVar,
} from "../../api/projects";
import { Modal } from "../Modal";
import type { Env, Var } from "../../types/api";

interface Props {
  projectId: string;
  envs: Env[];
}

export function VariablesTab({ projectId, envs }: Props) {
  const [scope, setScope] = useState<"project" | string>("project");
  const [vars, setVars] = useState<Var[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editVar, setEditVar] = useState<Var | null>(null);

  const load = () => {
    setLoading(true);
    const req =
      scope === "project"
        ? listProjectVars(projectId)
        : listEnvVars(scope);
    req.then((r) => setVars(r.items)).finally(() => setLoading(false));
  };

  useEffect(load, [scope, projectId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this variable?")) return;
    try {
      if (scope === "project") await deleteProjectVar(id);
      else await deleteEnvVar(id);
      setVars((prev) => prev.filter((v) => v.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error");
    }
  };

  return (
    <div>
      {/* Scope selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setScope("project")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            scope === "project"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Project-level
        </button>
        {envs.map((env) => (
          <button
            key={env.id}
            onClick={() => setScope(env.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              scope === env.id
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {env.name}
          </button>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Add variable
        </button>
      </div>

      {loading && <p className="text-gray-500 py-4">Loading…</p>}

      {!loading && vars.length === 0 && (
        <p className="text-gray-400 text-sm py-4">No variables defined.</p>
      )}

      <div className="grid gap-2">
        {vars.map((v) => (
          <div
            key={v.id}
            className="border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between"
          >
            <span className="font-mono text-sm text-gray-800">{v.key}</span>
            <div className="flex gap-3">
              <button
                onClick={() => setEditVar(v)}
                className="text-gray-400 hover:text-gray-700 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(v.id)}
                className="text-gray-400 hover:text-red-500 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <VarModal
          title="New variable"
          onClose={() => setShowCreate(false)}
          onSave={async (key, value) => {
            try {
              const created =
                scope === "project"
                  ? await createProjectVar(projectId, { key, value })
                  : await createEnvVar(scope, { key, value });
              setVars((prev) => [...prev, created]);
              setShowCreate(false);
            } catch (e: unknown) {
              throw e;
            }
          }}
        />
      )}

      {editVar && (
        <VarModal
          title="Edit variable"
          initialKey={editVar.key}
          valueOnly
          onClose={() => setEditVar(null)}
          onSave={async (_key, value) => {
            try {
              if (scope === "project") await updateProjectVar(editVar.id, value);
              else await updateEnvVar(editVar.id, value);
              setEditVar(null);
            } catch (e: unknown) {
              throw e;
            }
          }}
        />
      )}
    </div>
  );
}

function VarModal({
  title,
  initialKey = "",
  valueOnly = false,
  onClose,
  onSave,
}: {
  title: string;
  initialKey?: string;
  valueOnly?: boolean;
  onClose: () => void;
  onSave: (key: string, value: string) => Promise<void>;
}) {
  const [key, setKey] = useState(initialKey);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(key, value);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!valueOnly && (
          <div>
            <label className="block text-sm text-gray-700 mb-1">Key</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
              placeholder="DATABASE_URL"
            />
          </div>
        )}
        {valueOnly && (
          <p className="text-sm text-gray-600">
            Key: <span className="font-mono font-medium">{key}</span>
          </p>
        )}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Value</label>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
