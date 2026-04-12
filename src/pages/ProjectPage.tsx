import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProject, listEnvs } from "../api/projects";
import { Layout } from "../components/Layout";
import { DeployConfigTab } from "../components/tabs/DeployConfigTab";
import { DeploymentsTab } from "../components/tabs/DeploymentsTab";
import { EnvironmentsTab } from "../components/tabs/EnvironmentsTab";
import { VariablesTab } from "../components/tabs/VariablesTab";
import type { Env, Project } from "../types/api";

type Tab = "environments" | "variables" | "deploy-config" | "deployments";

const TABS: { id: Tab; label: string }[] = [
  { id: "environments", label: "Environments" },
  { id: "variables", label: "Variables" },
  { id: "deploy-config", label: "Deploy Config" },
  { id: "deployments", label: "Deployments" },
];

export function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [envs, setEnvs] = useState<Env[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("environments");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([getProject(id), listEnvs(id)])
      .then(([proj, envsResp]) => {
        setProject(proj);
        setEnvs(envsResp.items);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnvsChange = (updated: Env[]) => setEnvs(updated);

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-500">Loading…</p>
      </Layout>
    );
  }

  if (error || !project || !id) {
    return (
      <Layout>
        <p className="text-red-600">{error ?? "Project not found"}</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">
          ← Projects
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 mt-2">{project.name}</h1>
        <a
          href={project.repo_url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          {project.repo_url}
        </a>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "environments" && (
        <EnvironmentsTab
          projectId={id}
          onEnvsChange={handleEnvsChange}
        />
      )}
      {activeTab === "variables" && (
        <VariablesTab projectId={id} envs={envs} />
      )}
      {activeTab === "deploy-config" && <DeployConfigTab projectId={id} />}
      {activeTab === "deployments" && (
        <DeploymentsTab projectId={id} envs={envs} />
      )}
    </Layout>
  );
}
