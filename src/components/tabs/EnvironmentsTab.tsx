import { useEffect, useState, type FormEvent } from "react";
import { createEnv, deleteEnv, listEnvs, updateEnv } from "../../api/projects";
import { Modal } from "../Modal";
import type { Env } from "../../types/api";

interface EnvironmentsTabProps {
  projectId: string;
  onEnvsChange?: (envs: Env[]) => void;
}

export function EnvironmentsTab({ projectId, onEnvsChange }: EnvironmentsTabProps) {
  const [envs, setEnvs] = useState<Env[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editEnv, setEditEnv] = useState<Env | null>(null);

  const setEnvsAndNotify = (updated: Env[] | ((prev: Env[]) => Env[])) => {
    setEnvs((prev) => {
      const next = typeof updated === "function" ? updated(prev) : updated;
      onEnvsChange?.(next);
      return next;
    });
  };

  const load = () => {
    listEnvs(projectId)
      .then((r) => {
        setEnvs(r.items);
        onEnvsChange?.(r.items);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [projectId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this environment?")) return;
    try {
      await deleteEnv(id);
      setEnvsAndNotify((prev) => prev.filter((e) => e.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error");
    }
  };

  if (loading) return <p className="text-gray-500 py-4">Loading…</p>;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Add environment
        </button>
      </div>

      {envs.length === 0 && (
        <p className="text-gray-400 text-sm py-4">No environments. Add one to start deploying.</p>
      )}

      <div className="grid gap-2">
        {envs.map((env) => (
          <div
            key={env.id}
            className="border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-gray-900 text-sm">{env.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Branch: <span className="font-mono">{env.target_branch}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditEnv(env)}
                className="text-gray-400 hover:text-gray-700 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(env.id)}
                className="text-gray-400 hover:text-red-500 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <EnvModal
          projectId={projectId}
          onClose={() => setShowCreate(false)}
          onSave={(env) => {
            setEnvsAndNotify((prev) => [...prev, env]);
            setShowCreate(false);
          }}
        />
      )}
      {editEnv && (
        <EnvModal
          projectId={projectId}
          env={editEnv}
          onClose={() => setEditEnv(null)}
          onSave={(updated) => {
            setEnvsAndNotify((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
            setEditEnv(null);
          }}
        />
      )}
    </div>
  );
}

function EnvModal({
  projectId,
  env,
  onClose,
  onSave,
}: {
  projectId: string;
  env?: Env;
  onClose: () => void;
  onSave: (env: Env) => void;
}) {
  const [name, setName] = useState(env?.name ?? "");
  const [branch, setBranch] = useState(env?.target_branch ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (env) {
        await updateEnv(env.id, { name, target_branch: branch, domain_name: "" });
        onSave({ ...env, name, target_branch: branch, domain_name: "" });
      } else {
        const created = await createEnv(projectId, { name, target_branch: branch, domain_name: "" });
        onSave(created);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={env ? "Edit environment" : "New environment"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Name</label>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="production"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Branch</label>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            required
            placeholder="main"
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
