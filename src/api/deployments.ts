import { apiRequest } from "./client";
import type { DeploymentRun } from "../types/api";

export function listDeployments(params: {
  project_id?: string;
  env_id?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: DeploymentRun[]; total: number }> {
  const qs = new URLSearchParams();
  if (params.project_id) qs.set("project_id", params.project_id);
  if (params.env_id) qs.set("env_id", params.env_id);
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.offset != null) qs.set("offset", String(params.offset));
  return apiRequest(`/api/v1/deployments?${qs}`);
}

export function getDeployment(id: string): Promise<DeploymentRun> {
  return apiRequest(`/api/v1/deployments/${id}`);
}

export function createDeployment(data: {
  project_id: string;
  env_id: string;
  commit_sha?: string;
}): Promise<DeploymentRun> {
  return apiRequest("/api/v1/deployments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
