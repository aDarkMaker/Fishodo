import { useState, useMemo } from "react";
import { useTasks, useCreateTask, useUpdateTask } from "@/hooks";
import type { Task } from "@/types";
import { TaskItem } from "./TaskItem";

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

interface TaskListProps {
  projectId: string | null;
  view: string;
}

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
  const endIdx = 6;
  const start = `${weekStart.getFullYear()}年${weekStart.getMonth() + 1}月${weekStart.getDate()}日`;
  const endDay = weekDays[endIdx];
  const endDate = new Date(endDay);
  const endStr =
    weekDays[endIdx].slice(5) === weekDays[0].slice(5)
      ? endDay.slice(8) + "日"
      : `${endDate.getMonth() + 1}月${endDate.getDate()}日`;
  return `${start} - ${endStr}`;
}

export function TaskList({ projectId, view }: TaskListProps) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [doneOpen, setDoneOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const filter = view === "inbox"
    ? { projectIdIsNull: true }
    : view === "today"
      ? ({ status: "todo" as const })
      : view === "upcoming"
        ? { hasDueDate: true, status: "todo" as const }
        : projectId
          ? { projectId }
          : { status: "todo" as const };

  const { data: tasks = [], isLoading } = useTasks(filter);
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    createMutation.mutate({
      title,
      priority: "none",
      projectId: projectId ?? undefined,
    });
    setNewTitle("");
    setAdding(false);
  };

  const handleToggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === "done" ? "todo" : "done";
    updateMutation.mutate({ id, updates: { status: newStatus } });
  };

  const { sections, isEmpty, doneTasks } = useMemo(() => {
    if (view === "inbox") {
      const todoItems = tasks.filter((t) => t.status !== "done");
      const doneItems = tasks.filter((t) => t.status === "done");
      return {
        sections: [{ label: "未分类", tasks: todoItems }],
        doneTasks: doneItems,
        isEmpty: tasks.length === 0,
      };
    }

    if (view === "today") {
      const overdue = tasks.filter((t) => t.dueDate && t.dueDate < todayStr() && t.status !== "done");
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

  const weekRangeLabel = formatWeekRange(weekStart, weekDays);

  if (view === "upcoming") {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="rounded p-1 text-text-tertiary hover:text-text-primary"
            >
              <ChevronLeft />
            </button>
            <span className="text-sm font-medium text-text-primary">{weekRangeLabel}</span>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="rounded p-1 text-text-tertiary hover:text-text-primary"
            >
              <ChevronRight />
            </button>
          </div>
          <button
            onClick={() => setWeekOffset(0)}
            className="rounded px-2 py-0.5 text-xs text-text-tertiary hover:bg-surface-hover hover:text-primary"
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
                className="flex flex-1 flex-col border-r border-border last:border-r-0"
                style={current ? { backgroundColor: "rgba(220, 76, 62, 0.05)" } : undefined}
              >
                <div className={"px-2 py-1.5 text-center " + (current ? "text-primary" : "text-text-tertiary")}>
                  <p className="text-[11px] font-medium leading-tight">{formatDateLabel(day)}</p>
                </div>
                <div className="flex-1 overflow-y-auto px-1">
                  {dayTasks.map((t) => (
                    <TaskItem key={t.id} task={t} onToggle={() => handleToggle(t.id)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {adding ? (
          <div className="shrink-0 border-t border-border bg-surface p-3">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") {
                  setAdding(false);
                  setNewTitle("");
                }
              }}
              onBlur={() => {
                if (!newTitle.trim()) {
                  setAdding(false);
                  setNewTitle("");
                }
              }}
              className="w-full rounded border border-border bg-surface px-2 py-1.5 text-sm text-text-primary outline-none focus:border-primary"
              placeholder="输入任务，Enter 确认"
            />
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="shrink-0 flex w-full items-center gap-1.5 border-t border-border bg-surface px-6 py-2.5 text-sm text-text-tertiary hover:bg-surface-hover hover:text-primary"
          >
            <PlusIcon />
            <span>添加任务</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-text-tertiary">加载中...</p>
        </div>
      )}

      {!isLoading && (
        <div className="flex flex-col">
          {sections.map((section, si) => (
            <div key={si} className={si > 0 && section.label ? "pt-1" : "pt-3"}>
              {section.label ? (
                <p className="px-6 pb-1 text-xs font-medium text-text-tertiary">{section.label}</p>
              ) : null}
              <div className="px-2">
                {section.tasks.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={() => handleToggle(task.id)} />
                ))}
              </div>
            </div>
          ))}

          {isEmpty && doneTasks.length === 0 && (
            <div className="flex flex-1 items-center justify-center pb-20 pt-20">
              <p className="text-sm text-text-tertiary">
                {view === "inbox" ? "收集箱为空，输入任务即会出现在这里" : "暂无任务"}
              </p>
            </div>
          )}

          {doneTasks.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setDoneOpen(!doneOpen)}
                className="flex w-full items-center gap-1.5 px-6 py-1.5 text-xs font-medium text-text-tertiary hover:text-text-secondary"
              >
                <span
                  className={"inline-flex transition-transform duration-150 " + (doneOpen ? "rotate-90" : "")}
                >
                  <ChevronRight />
                </span>
                <span>已完成</span>
                <span className="ml-1 text-[11px]">({doneTasks.length})</span>
              </button>
              <div
                className={"overflow-hidden transition-all duration-200 " + (doneOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0")}
              >
                <div className="px-2 pb-3">
                  {doneTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onToggle={() => handleToggle(task.id)} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {adding ? (
        <div className="sticky bottom-0 border-t border-border bg-surface p-3">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") {
                setAdding(false);
                setNewTitle("");
              }
            }}
            onBlur={() => {
              if (!newTitle.trim()) {
                setAdding(false);
                setNewTitle("");
              }
            }}
            className="w-full rounded border border-border bg-surface px-2 py-1.5 text-sm text-text-primary outline-none focus:border-primary"
            placeholder="输入任务，Enter 确认"
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="sticky bottom-0 flex w-full items-center gap-1.5 border-t border-border bg-surface px-6 py-2.5 text-sm text-text-tertiary hover:bg-surface-hover hover:text-primary"
        >
          <PlusIcon />
          <span>添加任务</span>
        </button>
      )}
    </div>
  );
}
