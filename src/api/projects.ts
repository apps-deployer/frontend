import { apiRequest } from "./client";
import type { DeployConfig, Env, Framework, Project, Var } from "../types/api";

// --- Projects ---

export function listProjects(): Promise<{ items: Project[] }> {
  return apiRequest("/api/v1/projects");
}

export function getProject(id: string): Promise<Project> {
  return apiRequest(`/api/v1/projects/${id}`);
}

export function createProject(data: { name: string; repo_url: string; framework_id?: string }): Promise<Project> {
  return apiRequest("/api/v1/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProject(id: string, data: { name: string; repo_url: string }): Promise<void> {
  return apiRequest(`/api/v1/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProject(id: string): Promise<void> {
  return apiRequest(`/api/v1/projects/${id}`, { method: "DELETE" });
}

// --- Environments ---

export function listEnvs(projectId: string): Promise<{ items: Env[] }> {
  return apiRequest(`/api/v1/projects/${projectId}/envs`);
}

export function createEnv(
  projectId: string,
  data: { name: string; target_branch: string; domain_name?: string }
): Promise<Env> {
  return apiRequest(`/api/v1/projects/${projectId}/envs`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateEnv(
  envId: string,
  data: { name: string; target_branch: string; domain_name?: string }
): Promise<void> {
  return apiRequest(`/api/v1/envs/${envId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteEnv(envId: string): Promise<void> {
  return apiRequest(`/api/v1/envs/${envId}`, { method: "DELETE" });
}

// --- Project Variables ---

export function listProjectVars(projectId: string): Promise<{ items: Var[] }> {
  return apiRequest(`/api/v1/projects/${projectId}/vars`);
}

export function createProjectVar(projectId: string, data: { key: string; value: string }): Promise<Var> {
  return apiRequest(`/api/v1/projects/${projectId}/vars`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProjectVar(varId: string, value: string): Promise<void> {
  return apiRequest(`/api/v1/vars/project/${varId}`, {
    method: "PUT",
    body: JSON.stringify({ value }),
  });
}

export function deleteProjectVar(varId: string): Promise<void> {
  return apiRequest(`/api/v1/vars/project/${varId}`, { method: "DELETE" });
}

// --- Env Variables ---

export function listEnvVars(envId: string): Promise<{ items: Var[] }> {
  return apiRequest(`/api/v1/envs/${envId}/vars`);
}

export function createEnvVar(envId: string, data: { key: string; value: string }): Promise<Var> {
  return apiRequest(`/api/v1/envs/${envId}/vars`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateEnvVar(varId: string, value: string): Promise<void> {
  return apiRequest(`/api/v1/vars/env/${varId}`, {
    method: "PUT",
    body: JSON.stringify({ value }),
  });
}

export function deleteEnvVar(varId: string): Promise<void> {
  return apiRequest(`/api/v1/vars/env/${varId}`, { method: "DELETE" });
}

// --- Deploy Config ---

export function getDeployConfig(projectId: string): Promise<DeployConfig> {
  return apiRequest(`/api/v1/projects/${projectId}/deploy-config`);
}

export function updateDeployConfig(
  projectId: string,
  data: Partial<Omit<DeployConfig, "id" | "project_id">>
): Promise<void> {
  return apiRequest(`/api/v1/projects/${projectId}/deploy-config`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// --- Frameworks ---

export function listFrameworks(): Promise<{ items: Framework[] }> {
  return apiRequest("/api/v1/frameworks");
}
