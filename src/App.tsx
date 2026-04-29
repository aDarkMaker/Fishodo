import { useState, useCallback, useMemo } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useProjects } from "@/hooks";
import { Sidebar } from "@/components/layout/Sidebar";
import { TaskList } from "@/features/tasks/components/TaskList";

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
    ? currentProject?.name ?? "项目"
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
      <main className="flex flex-1 flex-col bg-surface">
        <div
          data-tauri-drag-region
          className="flex h-11 shrink-0 items-center justify-between border-b border-border px-6"
        >
          <h1 className="text-sm font-semibold text-text-primary">{title}</h1>
          <button
            onClick={() => getCurrentWindow().close()}
            className="flex h-6 w-6 items-center justify-center rounded text-text-tertiary hover:bg-danger hover:text-white"
            data-tauri-drag-region={undefined}
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="1.2" />
              <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>
        <TaskList projectId={projectId} view={view} />
      </main>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-80 rounded-lg border border-border bg-surface p-6 shadow-lg">
            <h2 className="text-sm font-semibold text-text-primary">设置</h2>
            <p className="mt-2 text-xs text-text-tertiary">更多设置项即将推出</p>
            <button
              onClick={() => setShowSettings(false)}
              className="mt-4 rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-primary-hover"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
