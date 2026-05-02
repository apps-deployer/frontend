import { apiRequest } from "./client";
import type { User } from "../types/api";

export function getMe(): Promise<User> {
  return apiRequest<User>("/api/v1/auth/me");
}

export function loginWithGitHub(): void {
  const apiUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8002";
  window.location.href = `${apiUrl}/api/v1/auth/login/github`;
}
