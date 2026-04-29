import { useState, useRef } from "react";
import type { Task } from "@/types";
import { useUpdateTask, useDeleteTask } from "@/hooks";

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
}

const CircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" />
    <polyline points="8 12 11 15 16 9" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 19 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <line x1="10" y1="11" x2="10" y2="16" />
    <line x1="14" y1="11" x2="14" y2="16" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
  </svg>
);

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const isDone = task.status === "done";

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

  return (
    <div className="group flex items-start gap-2 rounded-md px-4 py-1.5 transition-colors hover:bg-surface-hover">
      <button
        onClick={onToggle}
        className={`mt-[3px] shrink-0 ${isDone ? "text-success" : "text-text-tertiary hover:text-primary"}`}
      >
        {isDone ? <CheckCircleIcon /> : <CircleIcon />}
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
            className="w-full bg-transparent text-sm leading-relaxed text-text-primary outline-none"
          />
        ) : (
          <span
            className={`cursor-default text-sm leading-relaxed ${
              isDone ? "text-text-tertiary line-through" : "text-text-primary"
            }`}
          >
            {task.title}
          </span>
        )}
        {task.description && (
          <p className="mt-0.5 text-xs text-text-tertiary line-clamp-2">{task.description}</p>
        )}
      </div>
      {isDone && (
        <div className="mt-[3px] flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleReactive}
            className="rounded p-1 text-text-tertiary hover:text-primary"
            title="重新激活"
          >
            <RefreshIcon />
          </button>
          <button
            onClick={handleDelete}
            className="rounded p-1 text-text-tertiary hover:text-danger"
            title="删除"
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </div>
  );
}
