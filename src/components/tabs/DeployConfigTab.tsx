import { useEffect, useState, type FormEvent } from "react";
import { getDeployConfig, listFrameworks, updateDeployConfig } from "../../api/projects";
import type { Framework } from "../../types/api";

const OVERRIDE_FIELDS = [
  { key: "base_image_override",   label: "Base image",       fwKey: "base_image"   },
  { key: "root_dir_override",     label: "Root directory",   fwKey: "root_dir"     },
  { key: "output_dir_override",   label: "Output directory", fwKey: "output_dir"   },
  { key: "install_cmd_override",  label: "Install command",  fwKey: "install_cmd"  },
  { key: "build_cmd_override",    label: "Build command",    fwKey: "build_cmd"    },
  { key: "run_cmd_override",      label: "Run command",      fwKey: "run_cmd"      },
] as const;

type OverrideKey = (typeof OVERRIDE_FIELDS)[number]["key"];
type FwKey = (typeof OVERRIDE_FIELDS)[number]["fwKey"];

type FormState = { framework_id: string } & Record<OverrideKey, string>;

export function DeployConfigTab({ projectId }: { projectId: string }) {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    framework_id:          "",
    base_image_override:   "",
    root_dir_override:     "",
    output_dir_override:   "",
    install_cmd_override:  "",
    build_cmd_override:    "",
    run_cmd_override:      "",
  });

  useEffect(() => {
    Promise.all([getDeployConfig(projectId), listFrameworks()])
      .then(([cfg, fws]) => {
        setFrameworks(fws.items);
        setForm({
          framework_id:         cfg.framework_id,
          base_image_override:  cfg.base_image_override,
          root_dir_override:    cfg.root_dir_override,
          output_dir_override:  cfg.output_dir_override,
          install_cmd_override: cfg.install_cmd_override,
          build_cmd_override:   cfg.build_cmd_override,
          run_cmd_override:     cfg.run_cmd_override,
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
  if (error && !form.framework_id) return <p className="text-red-600 py-4">{error}</p>;

  const selectedFw = frameworks.find((fw) => fw.id === form.framework_id);

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

      <div className="space-y-3">
        {OVERRIDE_FIELDS.map(({ key, label, fwKey }) => {
          const fwDefault = selectedFw?.[fwKey as FwKey] ?? "";
          const override  = form[key];
          const resolved  = override || fwDefault;

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-gray-700">{label}</label>
                {override && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, [key]: "" }))}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Reset to default
                  </button>
                )}
              </div>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={override}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={fwDefault || "—"}
              />
              {override && fwDefault && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Default: <span className="font-mono">{fwDefault}</span>
                  {" · "}
                  Resolved: <span className="font-mono text-blue-600">{resolved}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

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
