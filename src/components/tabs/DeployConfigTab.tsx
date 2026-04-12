import { useEffect, useState, type FormEvent } from "react";
import { getDeployConfig, listFrameworks, updateDeployConfig } from "../../api/projects";
import type { DeployConfig, Framework } from "../../types/api";

export function DeployConfigTab({ projectId }: { projectId: string }) {
  const [config, setConfig] = useState<DeployConfig | null>(null);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    framework_id: "",
    root_dir_override: "",
    output_dir_override: "",
    base_image_override: "",
    install_cmd_override: "",
    build_cmd_override: "",
    run_cmd_override: "",
  });

  useEffect(() => {
    Promise.all([getDeployConfig(projectId), listFrameworks()])
      .then(([cfg, fws]) => {
        setConfig(cfg);
        setFrameworks(fws.items);
        setForm({
          framework_id: cfg.framework_id,
          root_dir_override: cfg.root_dir_override,
          output_dir_override: cfg.output_dir_override,
          base_image_override: cfg.base_image_override,
          install_cmd_override: cfg.install_cmd_override,
          build_cmd_override: cfg.build_cmd_override,
          run_cmd_override: cfg.run_cmd_override,
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateDeployConfig(projectId, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    key: keyof typeof form,
    placeholder?: string,
    mono = true
  ) => (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <input
        className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${mono ? "font-mono" : ""}`}
        value={form[key]}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
      />
    </div>
  );

  if (loading) return <p className="text-gray-500 py-4">Loading…</p>;
  if (!config) return <p className="text-red-600 py-4">{error}</p>;

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm text-gray-700 mb-1">Framework template</label>
        <select
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.framework_id}
          onChange={(e) => setForm((prev) => ({ ...prev, framework_id: e.target.value }))}
        >
          <option value="">— Custom (no template) —</option>
          {frameworks.map((fw) => (
            <option key={fw.id} value={fw.id}>
              {fw.name}
            </option>
          ))}
        </select>
      </div>

      {field("Root directory", "root_dir_override", ".")}
      {field("Output directory", "output_dir_override", "dist")}
      {field("Base image", "base_image_override", "node:20-alpine")}
      {field("Install command", "install_cmd_override", "npm install")}
      {field("Build command", "build_cmd_override", "npm run build")}
      {field("Run command", "run_cmd_override", "node server.js")}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-green-600 text-sm">Saved!</span>}
      </div>
    </form>
  );
}
