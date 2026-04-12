import { useEffect, useState, type FormEvent } from "react";
import { createDeployment, listDeployments } from "../../api/deployments";
import { StatusBadge } from "../Badge";
import { Modal } from "../Modal";
import type { DeploymentRun, Env } from "../../types/api";

interface Props {
  projectId: string;
  envs: Env[];
}

export function DeploymentsTab({ projectId, envs }: Props) {
  const [runs, setRuns] = useState<DeploymentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnv, setSelectedEnv] = useState<string>("all");
  const [showDeploy, setShowDeploy] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    listDeployments({
      project_id: projectId,
      env_id: selectedEnv !== "all" ? selectedEnv : undefined,
      limit: 20,
    })
      .then((r) => setRuns(r.items))
      .finally(() => setLoading(false));
  };

  useEffect(load, [projectId, selectedEnv]);

  const envName = (envId: string) => envs.find((e) => e.id === envId)?.name ?? envId;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedEnv("all")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedEnv === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {envs.map((env) => (
            <button
              key={env.id}
              onClick={() => setSelectedEnv(env.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedEnv === env.id
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {env.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowDeploy(true)}
            disabled={envs.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            Deploy now
          </button>
        </div>
      </div>

      {loading && <p className="text-gray-500 py-4">Loading…</p>}

      {!loading && runs.length === 0 && (
        <p className="text-gray-400 text-sm py-4">No deployments yet.</p>
      )}

      <div className="space-y-2">
        {runs.map((run) => (
          <div key={run.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedId(expandedId === run.id ? null : run.id)}
            >
              <div className="flex items-center gap-3">
                <StatusBadge status={run.status} />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {envName(run.env_id)}
                    {run.commit_sha && (
                      <span className="ml-2 font-mono text-xs text-gray-500">
                        {run.commit_sha.slice(0, 7)}
                      </span>
                    )}
                  </p>
                  {run.commit_message && (
                    <p className="text-xs text-gray-500 truncate max-w-xs">{run.commit_message}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{run.trigger_type}</p>
                <p className="text-xs text-gray-400">
                  {new Date(run.created_at).toLocaleString()}
                </p>
              </div>
            </button>

            {expandedId === run.id && (
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                <div className="space-y-2">
                  {run.jobs.map((job) => (
                    <div key={job.id} className="flex items-center gap-3">
                      <StatusBadge status={job.status} />
                      <span className="text-sm text-gray-700 capitalize">{job.type}</span>
                      {job.error && (
                        <span className="text-xs text-red-600 truncate">{job.error}</span>
                      )}
                    </div>
                  ))}
                  {run.artifact && (
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      Image: {run.artifact.image}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showDeploy && (
        <DeployModal
          projectId={projectId}
          envs={envs}
          onClose={() => setShowDeploy(false)}
          onDeployed={(run) => {
            setRuns((prev) => [run, ...prev]);
            setShowDeploy(false);
          }}
        />
      )}
    </div>
  );
}

function DeployModal({
  projectId,
  envs,
  onClose,
  onDeployed,
}: {
  projectId: string;
  envs: Env[];
  onClose: () => void;
  onDeployed: (run: DeploymentRun) => void;
}) {
  const [envId, setEnvId] = useState(envs[0]?.id ?? "");
  const [commitSha, setCommitSha] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setDeploying(true);
    setError(null);
    try {
      const run = await createDeployment({
        project_id: projectId,
        env_id: envId,
        commit_sha: commitSha || undefined,
      });
      onDeployed(run);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setDeploying(false);
    }
  };

  return (
    <Modal title="Deploy now" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Environment</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={envId}
            onChange={(e) => setEnvId(e.target.value)}
            required
          >
            {envs.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name} ({env.target_branch})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Commit SHA <span className="text-gray-400">(optional, defaults to HEAD)</span>
          </label>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={commitSha}
            onChange={(e) => setCommitSha(e.target.value)}
            placeholder="abc1234"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">
            Cancel
          </button>
          <button
            type="submit"
            disabled={deploying}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            {deploying ? "Starting…" : "Deploy"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
