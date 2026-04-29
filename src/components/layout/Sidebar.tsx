import { useState, useRef, useMemo, useCallback } from "react";
import { useProjects, useCreateProject, useDeleteProject, useReorderProjects, useTasks } from "@/hooks";

const InboxIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-6l-2 3H10l-2-3H2" />
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
  </svg>
);

const TodayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const PlusIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const PROJECT_COLORS = ["#dc4c3e", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];

const views = [
  { id: "inbox", label: "收集箱", Icon: InboxIcon },
  { id: "today", label: "今天", Icon: TodayIcon },
  { id: "upcoming", label: "计划", Icon: CalendarIcon },
];

interface SidebarProps {
  activeView: string;
  onViewChange: (id: string) => void;
  activeProjectId: string | null;
  onProjectChange: (id: string | null) => void;
  onOpenSettings: () => void;
}

function reorder<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [moved] = result.splice(from, 1);
  result.splice(to, 0, moved);
  return result;
}

export function Sidebar({ activeView, onViewChange, activeProjectId, onProjectChange, onOpenSettings }: SidebarProps) {
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [addingProject, setAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const { data: projects = [] } = useProjects();
  const createMutation = useCreateProject();
  const deleteMutation = useDeleteProject();
  const reorderMutation = useReorderProjects();

  const { data: allTasks = [] } = useTasks();
  const totalCount = useMemo(() => allTasks.filter((t) => t.status !== "done").length, [allTasks]);

  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const dragY = useRef(0);
  const startY = useRef(0);
  const itemHeight = useRef(32);

  const activeProjects = useMemo(() => projects.filter((p) => !p.archived), [projects]);

  const handleAddProject = () => {
    const name = newProjectName.trim();
    if (!name) return;
    const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length];
    createMutation.mutate({ name, color });
    setNewProjectName("");
    setAddingProject(false);
  };

  const handleDelete = (id: string) => {
    if (activeProjectId === id) onProjectChange(null);
    deleteMutation.mutate(id);
  };

  const handlePointerDown = (e: React.PointerEvent, idx: number) => {
    const el = e.currentTarget as HTMLElement;
    itemHeight.current = el.offsetHeight;
    startY.current = e.clientY;
    dragY.current = e.clientY;
    setDragIdx(idx);
    setOverIdx(idx);
    el.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (dragIdx === null) return;
      dragY.current = e.clientY;
      const delta = dragY.current - startY.current;
      const offset = Math.round(delta / itemHeight.current);
      const newOver = Math.max(0, Math.min(activeProjects.length - 1, dragIdx + offset));
      if (newOver !== overIdx) {
        setOverIdx(newOver);
      }
    },
    [dragIdx, overIdx, activeProjects.length],
  );

  const handlePointerUp = useCallback(() => {
    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
      const ordered = reorder(
        activeProjects.map((p) => p.id),
        dragIdx,
        overIdx,
      );
      reorderMutation.mutate(ordered);
    }
    setDragIdx(null);
    setOverIdx(null);
  }, [dragIdx, overIdx, activeProjects, reorderMutation]);

  const displayProjects = useMemo(() => {
    if (dragIdx === null || overIdx === null || dragIdx === overIdx) return activeProjects;
    return reorder(activeProjects, dragIdx, overIdx);
  }, [activeProjects, dragIdx, overIdx]);

  return (
    <aside className="flex w-60 shrink-0 flex-col select-none bg-surface-secondary">
      <div data-tauri-drag-region className="flex h-11 items-center px-5">
        <span className="text-sm font-semibold tracking-tight text-primary">Fishodo</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="flex flex-col gap-0.5 px-2">
          {views.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                activeView === id && !activeProjectId
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-text-secondary hover:bg-surface-hover"
              }`}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="mx-3 my-3 border-t border-border" />

        <div className="px-3">
          <button
            onClick={() => setProjectsOpen(!projectsOpen)}
            className="flex w-full items-center gap-1 py-1 text-xs font-medium text-text-tertiary hover:text-text-secondary"
          >
            <span className={`transition-transform duration-150 ${projectsOpen ? "rotate-0" : "-rotate-90"}`}>
              <ChevronDown />
            </span>
            <span>项目</span>
          </button>

          <div
            className={`mt-1 flex flex-col gap-0.5 overflow-hidden transition-all duration-200 ${
              projectsOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {displayProjects.map((p, idx) => (
              <div
                key={p.id}
                onPointerDown={(e) => handlePointerDown(e, idx)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className={`group relative flex cursor-grab items-center rounded-md transition-transform duration-150 active:cursor-grabbing ${
                  dragIdx === idx ? "z-10 scale-[1.02] bg-primary/10 shadow-sm" : ""
                } ${overIdx === idx && dragIdx !== idx ? "border-b-2 border-primary" : ""}`}
              >
                <button
                  onClick={() => onProjectChange(p.id)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className={`pointer-events-auto flex flex-1 items-center gap-2.5 rounded-md px-1.5 py-1.5 text-sm transition-colors ${
                    activeProjectId === p.id
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-text-secondary"
                  }`}
                >
                  <span
                    className="flex h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <span>{p.name}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(p.id);
                  }}
                  className="absolute right-0.5 hidden rounded p-1 text-text-tertiary hover:text-danger group-hover:flex"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
            {addingProject ? (
              <div className="flex items-center gap-1 px-1.5 py-1">
                <input
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddProject();
                    if (e.key === "Escape") {
                      setAddingProject(false);
                      setNewProjectName("");
                    }
                  }}
                  onBlur={() => {
                    if (!newProjectName.trim()) {
                      setAddingProject(false);
                      setNewProjectName("");
                    }
                  }}
                  className="flex-1 rounded border border-border bg-surface px-2 py-0.5 text-xs text-text-primary outline-none focus:border-primary"
                  placeholder="项目名称"
                />
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleAddProject();
                  }}
                  className="rounded p-0.5 text-text-tertiary hover:text-primary"
                >
                  <PlusIcon size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingProject(true)}
                className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-sm text-text-tertiary hover:bg-surface-hover hover:text-text-secondary"
              >
                <PlusIcon size={14} />
                <span>添加项目</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 text-xs text-text-tertiary">
        <span>{totalCount} 项待完成</span>
        <button
          onClick={onOpenSettings}
          className="rounded p-1 text-text-tertiary hover:text-text-primary"
        >
          <SettingsIcon />
        </button>
      </div>
    </aside>
  );
}
