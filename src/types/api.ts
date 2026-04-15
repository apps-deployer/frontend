export interface Project {
  id: string;
  name: string;
  repo_url: string;
  owner_id: string;
}

export interface Env {
  id: string;
  name: string;
  project_id: string;
  target_branch: string;
}

export interface Var {
  id: string;
  key: string;
}

export interface DeployConfig {
  id: string;
  project_id: string;
  framework_id: string;
  root_dir_override: string;
  output_dir_override: string;
  base_image_override: string;
  install_cmd_override: string;
  build_cmd_override: string;
  run_cmd_override: string;
}

export interface Framework {
  id: string;
  name: string;
  root_dir: string;
  output_dir: string;
  base_image: string;
  install_cmd: string;
  build_cmd: string;
  run_cmd: string;
}

export type RunStatus = "pending" | "running" | "success" | "failed";
export type JobType = "build" | "deploy";

export interface Job {
  id: string;
  type: JobType;
  status: RunStatus;
  started_at: string | null;
  finished_at: string | null;
  error: string | null;
  created_at: string;
}

export interface Artifact {
  id: string;
  image: string;
  url: string | null;
  created_at: string;
}

export interface DeploymentRun {
  id: string;
  project_id: string;
  env_id: string;
  status: RunStatus;
  trigger_type: "manual" | "webhook";
  commit_sha: string | null;
  commit_message: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
  jobs: Job[];
  artifact: Artifact | null;
}

export interface User {
  id: string;
  github_login: string;
  avatar_url: string;
}
