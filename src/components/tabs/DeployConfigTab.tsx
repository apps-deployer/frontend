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

  if (loading) return <p className="text-gray-500 py-4">Loading…</p>;
  if (!config) return <p className="text-red-600 py-4">{error}</p>;

  const selectedFramework = frameworks.find((fw) => fw.id === form.framework_id);
  const isCustom = selectedFramework?.name === "Custom";

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm text-gray-700 mb-1">Framework</label>
        <select
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.framework_id}
          onChange={(e) => setForm((prev) => ({ ...prev, framework_id: e.target.value }))}
        >
          {frameworks.map((fw) => (
            <option key={fw.id} value={fw.id}>{fw.name}</option>
          ))}
        </select>
      </div>

      {selectedFramework && !isCustom && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Template defaults</p>
          {[
            ["Base image", selectedFramework.base_image],
            ["Root dir", selectedFramework.root_dir],
            ["Output dir", selectedFramework.output_dir],
            ["Install command", selectedFramework.install_cmd],
            ["Build command", selectedFramework.build_cmd],
            ["Run command", selectedFramework.run_cmd],
          ]
            .filter(([, val]) => val)
            .map(([label, val]) => (
              <div key={label} className="flex gap-2 text-sm">
                <span className="text-gray-500 w-32 shrink-0">{label}</span>
                <span className="font-mono text-gray-800">{val}</span>
              </div>
            ))}
        </div>
      )}

      {isCustom && (
        <div className="space-y-3">
          {(
            [
              ["Base image", "base_image_override", "python:3.12-slim"],
              ["Root directory", "root_dir_override", "."],
              ["Output directory", "output_dir_override", "."],
              ["Install command", "install_cmd_override", "pip install -r requirements.txt"],
              ["Build command", "build_cmd_override", ""],
              ["Run command", "run_cmd_override", "python main.py"],
            ] as [string, keyof typeof form, string][]
          ).map(([label, key, placeholder]) => (
            <div key={key}>
              <label className="block text-sm text-gray-700 mb-1">{label}</label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form[key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      )}

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
