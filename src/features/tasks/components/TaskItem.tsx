import { useState, useRef } from "react";
import type { Task } from "@/types";
import { useUpdateTask, useDeleteTask, useProjects } from "@/hooks";
import {
  CircleIcon,
  CheckCircle,
  RefreshIcon,
  TrashIcon,
  FlagIcon,
  CalendarIcon,
} from "@/components/icons";

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
}

const priorityConfig = {
  urgent: { color: "text-danger bg-danger-light", label: "紧急" },
  high: { color: "text-warning bg-warning-light", label: "高" },
  medium: { color: "text-info bg-info-light", label: "中" },
  low: { color: "text-text-tertiary bg-surface-hover", label: "低" },
  none: { color: "", label: "" },
} as const;

function dueLabel(dateStr: string): { text: string; urgent: boolean } {
  const now = new Date();
  const due = new Date(dateStr + "T23:59:59");
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const month = due.getMonth() + 1;
  const day = due.getDate();
  const dateText = `${month}/${day}`;

  if (diffDays < 0) return { text: `${dateText} 已逾期`, urgent: true };
  if (diffDays === 0) return { text: "今天截止", urgent: true };
  if (diffDays === 1) return { text: "明天截止", urgent: false };
  if (diffDays <= 7) return { text: `${dateText} ${diffDays}天后`, urgent: false };
  return { text: dateText, urgent: false };
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const { data: projects = [] } = useProjects();
  const isDone = task.status === "done";
  const project = projects.find((p) => p.id === task.projectId);

  const handleDoubleClick = () => {
    if (isDone) return;
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const commit = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== task.title) {
      updateMutation.mutate({ id: task.id, updates: { title: trimmed } });
    } else {
      setTitle(task.title);
    }
    setEditing(false);
  };

  const handleReactive = () => {
    updateMutation.mutate({ id: task.id, updates: { status: "todo" } });
  };

  const handleDelete = () => {
    deleteMutation.mutate(task.id);
  };

  const priority = priorityConfig[task.priority];
  const dueInfo = task.dueDate ? dueLabel(task.dueDate) : null;

  return (
    <div className="group flex items-start gap-2.5 rounded-lg px-4 py-2 transition-colors hover:bg-surface-hover">
      <button
        onClick={onToggle}
        className={`mt-[2px] shrink-0 transition-colors ${
          isDone ? "text-success" : "text-text-tertiary hover:text-primary"
        }`}
        title={isDone ? "标记为未完成" : "标记为完成"}
      >
        {isDone ? <CheckCircle size={20} /> : <CircleIcon size={20} />}
      </button>

      <div className="flex min-w-0 flex-1 flex-col" onDoubleClick={handleDoubleClick}>
        {editing ? (
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setTitle(task.title);
                setEditing(false);
              }
            }}
            className="w-full bg-transparent text-sm font-medium leading-relaxed text-text-primary outline-none"
          />
        ) : (
          <span
            className={`cursor-default text-sm leading-relaxed select-none ${
              isDone
                ? "text-text-disabled line-through"
                : "font-medium text-text-primary"
            }`}
          >
            {task.title}
          </span>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {priority.label && (
            <span
              className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium ${priority.color}`}
            >
              <FlagIcon size={10} />
              {priority.label}
            </span>
          )}

          {dueInfo && (
            <span
              className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                dueInfo.urgent
                  ? "text-danger bg-danger-light"
                  : "text-text-secondary bg-surface-hover"
              }`}
            >
              <CalendarIcon size={10} />
              {dueInfo.text}
            </span>
          )}

          {project && !isDone && (
            <span
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: project.color + "18",
                color: project.color,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              {project.name}
            </span>
          )}
        </div>
      </div>

      <div className="mt-[2px] flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        {isDone && (
          <button
            onClick={handleReactive}
            className="rounded p-1 text-text-tertiary hover:text-primary transition-colors"
            title="重新激活"
          >
            <RefreshIcon size={15} />
          </button>
        )}
        <button
          onClick={handleDelete}
          className="rounded p-1 text-text-tertiary hover:text-danger transition-colors"
          title="删除"
        >
          <TrashIcon size={15} />
        </button>
      </div>
    </div>
  );
}
