import { useState, useCallback, useMemo } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useProjects } from "@/hooks";
import { useUIStore } from "@/stores/ui-store";
import { Sidebar } from "@/components/layout/Sidebar";
import { TaskList } from "@/features/tasks/components/TaskList";
import { SearchBar } from "@/components/search/SearchBar";
import { CommandPalette } from "@/components/command-palette/CommandPalette";

const viewLabels: Record<string, string> = {
  inbox: "收集箱",
  today: "今天",
  upcoming: "计划",
};

function App() {
  const [view, setView] = useState("today");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { data: projects = [] } = useProjects();
  const { setSearchOpen } = useUIStore();

  const handleViewChange = useCallback((id: string) => {
    setView(id);
    setProjectId(null);
  }, []);

  const handleProjectChange = useCallback((id: string | null) => {
    setProjectId(id);
    if (id) setView("");
  }, []);

  const currentProject = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId],
  );

  const title = projectId
    ? (currentProject?.name ?? "项目")
    : viewLabels[view] ?? view;

  return (
    <div className="flex h-screen w-screen">
      <Sidebar
        activeView={view}
        onViewChange={handleViewChange}
        activeProjectId={projectId}
        onProjectChange={handleProjectChange}
        onOpenSettings={() => setShowSettings(true)}
      />

      <main className="flex flex-1 flex-col bg-surface min-w-0">
        <div
          data-tauri-drag-region
          className="flex h-11 shrink-0 items-center justify-between border-b border-border px-6"
        >
          <div className="flex items-center gap-3">
            {projectId && currentProject && (
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: currentProject.color }}
              />
            )}
            <h1 className="text-sm font-semibold text-text-primary">{title}</h1>
            {projectId && currentProject && (
              <span className="rounded-md bg-surface-hover px-2 py-0.5 text-[10px] text-text-tertiary">
                项目
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-hover hover:text-text-secondary transition-colors"
              title="搜索 (Ctrl+F)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <button
              onClick={() => getCurrentWindow().close()}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-danger hover:text-white transition-colors"
              data-tauri-drag-region={undefined}
              title="关闭"
            >
              <svg width="12" height="12" viewBox="0 0 12 12">
                <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <TaskList projectId={projectId} view={view} />
      </main>

      <SearchBar />
      <CommandPalette onViewChange={handleViewChange} />

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in">
          <div className="w-96 animate-scale-in rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <h2 className="text-base font-semibold text-text-primary">设置</h2>
            <p className="mt-3 text-sm text-text-secondary">更多设置项即将推出</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-hover"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
