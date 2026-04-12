import { authRequest } from "./client";
import type { User } from "../types/api";

export function getMe(): Promise<User> {
  return authRequest<User>("/api/v1/auth/me");
}

export function loginWithGitHub(): void {
  const authUrl = import.meta.env.VITE_AUTH_URL ?? "http://localhost:8001";
  window.location.href = `${authUrl}/api/v1/auth/login/github`;
}
