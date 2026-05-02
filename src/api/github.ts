import { apiRequest } from "./client";

export interface InstallationStatus {
  installed: boolean;
  install_url: string;
}

export function getInstallationStatus(): Promise<InstallationStatus> {
  return apiRequest<InstallationStatus>("/api/v1/github/installations/status");
}
