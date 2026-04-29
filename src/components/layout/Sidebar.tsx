import { useState, useRef, useMemo, useCallback } from "react";
import { useProjects, useCreateProject, useDeleteProject, useReorderProjects, useTasks } from "@/hooks";
import { useUIStore } from "@/stores/ui-store";
import {
  InboxIcon,
  ClockIcon,
  CalendarIcon,
  ChevronDown,
  PlusIcon,
  TrashIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
} from "@/components/icons";

const PROJECT_COLORS = [
  "#dc4c3e",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const views = [
  { id: "inbox", label: "收集箱", Icon: InboxIcon },
  { id: "today", label: "今天", Icon: ClockIcon },
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

export function Sidebar({
  activeView,
  onViewChange,
  activeProjectId,
  onProjectChange,
  onOpenSettings,
}: SidebarProps) {
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [addingProject, setAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const { data: projects = [] } = useProjects();
  const createMutation = useCreateProject();
  const deleteMutation = useDeleteProject();
  const reorderMutation = useReorderProjects();
  const { theme, toggleTheme } = useUIStore();

  const { data: allTasks = [] } = useTasks();
  const stats = useMemo(() => {
    const todo = allTasks.filter((t) => t.status !== "done").length;
    const today = allTasks.filter(
      (t) => t.dueDate && t.dueDate === new Date().toISOString().slice(0, 10) && t.status !== "done",
    ).length;
    return { todo, today };
  }, [allTasks]);

  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const dragY = useRef(0);
  const startY = useRef(0);
  const itemHeight = useRef(32);

  const activeProjects = useMemo(
    () => projects.filter((p) => !p.archived),
    [projects],
  );

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
      const newOver = Math.max(
        0,
        Math.min(activeProjects.length - 1, dragIdx + offset),
      );
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
    if (dragIdx === null || overIdx === null || dragIdx === overIdx)
      return activeProjects;
    return reorder(activeProjects, dragIdx, overIdx);
  }, [activeProjects, dragIdx, overIdx]);

  return (
    <aside className="flex w-64 shrink-0 flex-col select-none bg-surface-secondary border-r border-border">
      {/* Logo */}
      <div data-tauri-drag-region className="flex h-11 items-center px-5">
        <span className="text-sm font-bold tracking-tight text-primary">
          <span className="text-text-primary">Fish</span>odo
        </span>
      </div>

      {/* 统计概览 */}
      <div className="mx-3 mb-1 flex gap-2">
        <div className="flex-1 rounded-lg bg-surface px-3 py-2 text-center">
          <p className="text-lg font-bold text-primary">{stats.todo}</p>
          <p className="text-[10px] font-medium text-text-tertiary">待办</p>
        </div>
        <div className="flex-1 rounded-lg bg-surface px-3 py-2 text-center">
          <p className="text-lg font-bold text-warning">{stats.today}</p>
          <p className="text-[10px] font-medium text-text-tertiary">今日</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 视图导航 */}
        <nav className="flex flex-col gap-0.5 px-2">
          {views.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 ${
                activeView === id && !activeProjectId
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="mx-3 my-3 border-t border-border" />

        {/* 项目区域 */}
        <div className="px-3">
          <button
            onClick={() => setProjectsOpen(!projectsOpen)}
            className="flex w-full items-center gap-1.5 py-1.5 text-xs font-semibold text-text-tertiary transition-colors hover:text-text-secondary"
          >
            <span
              className={`transition-transform duration-200 ${projectsOpen ? "rotate-0" : "-rotate-90"}`}
            >
              <ChevronDown size={12} />
            </span>
            <span className="uppercase tracking-wider">项目</span>
            <span className="ml-auto rounded-full bg-surface px-1.5 py-0.5 text-[10px] text-text-tertiary">
              {activeProjects.length}
            </span>
          </button>

          <div
            className={`mt-1 flex flex-col gap-0.5 overflow-hidden transition-all duration-300 ${
              projectsOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {displayProjects.map((p, idx) => (
              <div
                key={p.id}
                onPointerDown={(e) => handlePointerDown(e, idx)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className={`group relative flex cursor-grab items-center rounded-md transition-all duration-150 active:cursor-grabbing ${
                  dragIdx === idx
                    ? "z-10 scale-[1.02] bg-primary/10 shadow-sm"
                    : ""
                } ${
                  overIdx === idx && dragIdx !== idx
                    ? "border-b-2 border-primary"
                    : ""
                }`}
              >
                <button
                  onClick={() => onProjectChange(p.id)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className={`pointer-events-auto flex flex-1 items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                    activeProjectId === p.id
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-surface-hover"
                  }`}
                >
                  <span
                    className="flex h-3 w-3 shrink-0 rounded-full ring-1 ring-black/10 dark:ring-white/10"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="truncate">{p.name}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(p.id);
                  }}
                  className="absolute right-1 hidden rounded-md p-1 text-text-tertiary opacity-0 transition-all hover:text-danger group-hover:flex group-hover:opacity-100"
                  title="删除项目"
                >
                  <TrashIcon size={13} />
                </button>
              </div>
            ))}

            {addingProject ? (
              <div className="flex items-center gap-1.5 px-2 py-1">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      PROJECT_COLORS[projects.length % PROJECT_COLORS.length],
                  }}
                />
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
                  className="flex-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-primary outline-none transition-colors focus:border-primary"
                  placeholder="项目名称"
                />
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleAddProject();
                  }}
                  className="rounded-md p-1 text-text-tertiary hover:text-primary"
                >
                  <PlusIcon size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingProject(true)}
                className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-secondary"
              >
                <PlusIcon size={14} />
                <span>添加项目</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <span className="text-[11px] font-medium text-text-tertiary">
          {stats.todo} 项待完成
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={toggleTheme}
            className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
            title={theme === "light" ? "切换到深色模式" : "切换到浅色模式"}
          >
            {theme === "light" ? <MoonIcon size={16} /> : <SunIcon size={16} />}
          </button>
          <button
            onClick={onOpenSettings}
            className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
            title="设置"
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
