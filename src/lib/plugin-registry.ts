import type { PluginManifest } from "@/types";

type PluginHook = (...args: unknown[]) => void | Promise<void>;

class PluginRegistry {
  private plugins: Map<string, PluginManifest> = new Map();

  register(manifest: PluginManifest): void {
    if (this.plugins.has(manifest.id)) {
      console.warn(`[PluginRegistry] 插件 "${manifest.id}" 已存在，将被覆盖`);
    }
    this.plugins.set(manifest.id, manifest);
  }

  unregister(id: string): boolean {
    return this.plugins.delete(id);
  }

  getAll(): PluginManifest[] {
    return Array.from(this.plugins.values());
  }

  async trigger<K extends keyof PluginManifest["hooks"]>(
    hook: K,
    ...args: PluginManifest["hooks"][K] extends (...a: infer P) => unknown ? P : never
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const plugin of this.plugins.values()) {
      const handler = plugin.hooks[hook];
      if (handler) {
        promises.push(
          Promise.resolve((handler as PluginHook)(...args)).catch((err) => {
            console.error(`[PluginRegistry] 插件 "${plugin.id}" hook "${hook}" 执行失败:`, err);
          }),
        );
      }
    }

    await Promise.all(promises);
  }

  clear(): void {
    this.plugins.clear();
  }
}

export const pluginRegistry = new PluginRegistry();
