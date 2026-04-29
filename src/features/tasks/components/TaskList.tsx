import { useState, useMemo, useCallback, useRef } from "react";
import { useTasks, useCreateTask, useUpdateTask, useReorderTasks } from "@/hooks";
import type { Task, TaskPriority } from "@/types";
import { TaskItem } from "./TaskItem";
import {
  PlusIcon,
  ChevronRight,
  ChevronLeft,
  FlagIcon,
  CalendarIcon,
  CheckCircle,
} from "@/components/icons";

/* ------------------------------------------------------------------ */
/*  优先级选项                                                           */
/* ------------------------------------------------------------------ */

const priorityOptions: { value: TaskPriority; label: string; emoji: string }[] = [
  { value: "urgent", label: "紧急", emoji: "🔴" },
  { value: "high", label: "高", emoji: "🟠" },
  { value: "medium", label: "中", emoji: "🔵" },
  { value: "low", label: "低", emoji: "⚪" },
  { value: "none", label: "无", emoji: "" },
];

/* ------------------------------------------------------------------ */
/*  工具函数                                                           */
/* ------------------------------------------------------------------ */

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysInRange(weekStart: Date): string[] {
  const result: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["日", "一", "二", "三", "四", "五", "六"];
  return `${d.getMonth() + 1}/${d.getDate()} 周${days[d.getDay()]}`;
}

function isToday(dateStr: string): boolean {
  return dateStr === todayStr();
}

function formatWeekRange(weekStart: Date, weekDays: string[]): string {
  const endDay = weekDays[6];
  const endDate = new Date(endDay);
  const start = `${weekStart.getFullYear()}年${weekStart.getMonth() + 1}月${weekStart.getDate()}日`;
  const endStr =
    weekDays[6].slice(5) === weekDays[0].slice(5)
      ? endDay.slice(8) + "日"
      : `${endDate.getMonth() + 1}月${endDate.getDate()}日`;
  return `${start} - ${endStr}`;
}

/* ------------------------------------------------------------------ */
/*  TaskList                                                           */
/* ------------------------------------------------------------------ */

interface TaskListProps {
  projectId: string | null;
  view: string;
}

export function TaskList({ projectId, view }: TaskListProps) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("none");
  const [newDueDate, setNewDueDate] = useState("");
  const [doneOpen, setDoneOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const filter =
    view === "inbox"
      ? { projectIdIsNull: true }
      : view === "today"
        ? { status: "todo" as const }
        : view === "upcoming"
          ? { hasDueDate: true, status: "todo" as const }
          : projectId
            ? { projectId }
            : { status: "todo" as const };

  const { data: tasks = [], isLoading } = useTasks(filter);
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const reorderMutation = useReorderTasks();

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    createMutation.mutate({
      title,
      priority: newPriority,
      projectId: projectId ?? undefined,
      dueDate: newDueDate || undefined,
    });
    setNewTitle("");
    setNewPriority("none");
    setNewDueDate("");
    setAdding(false);
  };

  const handleToggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === "done" ? "todo" : "done";
    updateMutation.mutate({ id, updates: { status: newStatus } });
  };

  /* ---- 拖拽排序 ---- */
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const dragY = useRef(0);
  const startIdx = useRef(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, idx: number) => {
      if (view === "upcoming") return;
      const el = e.currentTarget as HTMLElement;
      startIdx.current = idx;
      dragY.current = e.clientY;
      setDragIdx(idx);
      el.setPointerCapture(e.pointerId);
    },
    [view],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (dragIdx === null) return;
      dragY.current = e.clientY;
    },
    [dragIdx],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (dragIdx === null) return;
      const el = e.currentTarget as HTMLElement;
      const items = Array.from(el.parentElement!.children);
      const targetIdx = items.findIndex((child) => {
        const cr = child.getBoundingClientRect();
        return dragY.current >= cr.top && dragY.current <= cr.bottom;
      });

      if (targetIdx !== -1 && targetIdx !== startIdx.current) {
        const ordered = [...tasks];
        const [moved] = ordered.splice(startIdx.current, 1);
        ordered.splice(targetIdx, 0, moved);
        reorderMutation.mutate(ordered.map((t) => t.id));
      }
      setDragIdx(null);
    },
    [dragIdx, tasks, reorderMutation],
  );

  /* ---- 分组 ---- */
  const { sections, isEmpty, doneTasks } = useMemo(() => {
    if (view === "inbox") {
      const todoItems = tasks.filter((t) => t.status !== "done");
      const doneItems = tasks.filter((t) => t.status === "done");
      return {
        sections: [{ label: "", tasks: todoItems }],
        doneTasks: doneItems,
        isEmpty: tasks.length === 0,
      };
    }

    if (view === "today") {
      const overdue = tasks.filter(
        (t) => t.dueDate && t.dueDate < todayStr() && t.status !== "done",
      );
      const today = tasks.filter(
        (t) => (!t.dueDate || t.dueDate.startsWith(todayStr())) && t.status !== "done",
      );
      const done = tasks.filter((t) => t.status === "done");
      const result: { label: string; tasks: Task[] }[] = [];
      if (overdue.length) result.push({ label: "逾期", tasks: overdue });
      if (today.length) result.push({ label: overdue.length ? "今天" : "", tasks: today });
      return {
        sections: result,
        doneTasks: done,
        isEmpty: tasks.length === 0,
      };
    }

    if (view === "upcoming") {
      const upcoming = tasks.filter((t) => t.status !== "done");
      const done = tasks.filter((t) => t.status === "done");
      return {
        sections: [{ label: "计划中", tasks: upcoming }],
        doneTasks: done,
        isEmpty: tasks.length === 0,
      };
    }

    const todoItems = tasks.filter((t) => t.status !== "done");
    const doneItems = tasks.filter((t) => t.status === "done");
    return {
      sections: [{ label: "", tasks: todoItems }],
      doneTasks: doneItems,
      isEmpty: tasks.length === 0,
    };
  }, [tasks, view]);

  const weekStart = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + weekOffset * 7);
    return monday;
  }, [weekOffset]);

  const weekDays = useMemo(() => daysInRange(weekStart), [weekStart]);

  const tasksByDay = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const t of tasks) {
      if (t.status !== "done" && t.dueDate) {
        if (!map[t.dueDate]) map[t.dueDate] = [];
        map[t.dueDate].push(t);
      }
    }
    return map;
  }, [tasks]);

  /* ---- 添加任务输入框 ---- */
  const renderAddInput = () => (
    <div className="animate-slide-in-up border-t border-border bg-surface p-4">
      <div className="space-y-3">
        <input
          autoFocus
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
            if (e.key === "Escape") {
              setAdding(false);
              setNewTitle("");
              setNewPriority("none");
              setNewDueDate("");
            }
          }}
          onBlur={() => {
            setTimeout(() => {
              if (!newTitle.trim()) {
                setAdding(false);
                setNewTitle("");
                setNewPriority("none");
                setNewDueDate("");
              }
            }, 200);
          }}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="输入任务名称，Enter 确认"
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <FlagIcon size={13} className="text-text-tertiary" />
            {priorityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setNewPriority(opt.value)}
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  newPriority === opt.value
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "text-text-tertiary hover:bg-surface-hover hover:text-text-secondary"
                }`}
                title={opt.label}
              >
                {opt.emoji || opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <CalendarIcon size={13} className="text-text-tertiary" />
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] text-text-primary outline-none transition-colors focus:border-primary"
            />
            {newDueDate && (
              <button
                onClick={() => setNewDueDate("")}
                className="rounded p-0.5 text-text-tertiary hover:text-text-primary"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onMouseDown={(e) => { e.preventDefault(); handleAdd(); }}
            className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover"
          >
            添加任务
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              setAdding(false);
              setNewTitle("");
              setNewPriority("none");
              setNewDueDate("");
            }}
            className="rounded-lg bg-surface-hover px-4 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-active"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );

  const renderAddButton = () =>
    !adding && (
      <button
        onClick={() => setAdding(true)}
        className="sticky bottom-0 flex w-full items-center gap-2 border-t border-border bg-surface/95 px-6 py-3 text-sm text-text-tertiary backdrop-blur-sm transition-colors hover:bg-surface-hover hover:text-primary"
      >
        <PlusIcon size={16} />
        <span>添加任务</span>
      </button>
    );

  /* ---- 计划视图 ---- */
  if (view === "upcoming") {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="rounded p-1 text-text-tertiary hover:text-text-primary transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-sm font-medium text-text-primary">
              {formatWeekRange(weekStart, weekDays)}
            </span>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="rounded p-1 text-text-tertiary hover:text-text-primary transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
          <button
            onClick={() => setWeekOffset(0)}
            className="rounded-md px-3 py-1 text-xs font-medium text-text-tertiary transition-colors hover:bg-surface-hover hover:text-primary"
          >
            今天
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {weekDays.map((day) => {
            const dayTasks = tasksByDay[day] || [];
            const current = isToday(day);
            return (
              <div
                key={day}
                className={`flex flex-1 flex-col border-r border-border last:border-r-0 transition-colors ${
                  current ? "bg-primary/5" : ""
                }`}
              >
                <div
                  className={`px-2 py-2 text-center ${current ? "text-primary" : "text-text-tertiary"}`}
                >
                  <p className="text-[11px] font-semibold leading-tight">
                    {formatDateLabel(day)}
                  </p>
                  {dayTasks.length > 0 && (
                    <p className="mt-0.5 text-[10px]">{dayTasks.length} 项</p>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto px-1 space-y-0.5">
                  {dayTasks.map((t) => (
                    <TaskItem key={t.id} task={t} onToggle={() => handleToggle(t.id)} />
                  ))}
                  {dayTasks.length === 0 && (
                    <p className="px-2 py-4 text-center text-[11px] text-text-tertiary/50">无任务</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {adding && renderAddInput()}
        {renderAddButton()}
      </div>
    );
  }

  /* ---- 默认列表视图 ---- */
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-text-tertiary">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            加载中...
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="flex flex-col">
          {sections.map((section, si) => (
            <div key={si} className={si > 0 && section.label ? "pt-1" : ""}>
              {section.label && (
                <div className="flex items-center gap-2 px-6 py-2">
                  <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                    {section.label}
                  </p>
                  <span className="rounded-full bg-surface-hover px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">
                    {section.tasks.length}
                  </span>
                </div>
              )}
              <div className="px-2 space-y-0.5">
                {section.tasks.map((task, idx) => (
                  <div
                    key={task.id}
                    onPointerDown={(e) => handlePointerDown(e, idx)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className={`rounded-lg transition-all duration-150 ${
                      dragIdx === idx
                        ? "z-10 scale-[1.01] bg-primary/5 shadow-sm ring-1 ring-primary/20"
                        : ""
                    }`}
                  >
                    <TaskItem task={task} onToggle={() => handleToggle(task.id)} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {isEmpty && doneTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-24">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-hover">
                <CheckCircle size={32} className="text-text-tertiary/40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-text-secondary">
                  {view === "inbox" ? "收集箱为空" : projectId ? "此项目暂无任务" : "暂无任务"}
                </p>
                <p className="mt-1 text-xs text-text-tertiary">
                  {view === "inbox"
                    ? "没有指定项目的任务将出现在这里"
                    : "点击下方按钮添加新任务"}
                </p>
              </div>
            </div>
          )}

          {!isEmpty && sections.every((s) => s.tasks.length === 0) && (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <p className="text-sm text-text-tertiary">所有任务已完成</p>
            </div>
          )}

          {doneTasks.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setDoneOpen(!doneOpen)}
                className="flex w-full items-center gap-2 px-6 py-2 text-xs font-medium text-text-tertiary transition-colors hover:text-text-secondary"
              >
                <span
                  className={`inline-flex transition-transform duration-200 ${doneOpen ? "rotate-90" : ""}`}
                >
                  <ChevronRight size={13} />
                </span>
                <span>已完成</span>
                <span className="rounded-full bg-surface-hover px-1.5 py-0.5 text-[10px] text-text-tertiary">
                  {doneTasks.length}
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  doneOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-2 pb-4 space-y-0.5">
                  {doneTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onToggle={() => handleToggle(task.id)} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {adding && renderAddInput()}
      {renderAddButton()}
    </div>
  );
}
