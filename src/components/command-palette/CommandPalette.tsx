import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useUIStore } from "@/stores/ui-store";
import {
  SearchIcon,
  PlusIcon,
  InboxIcon,
  ClockIcon,
  CalendarIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
} from "@/components/icons";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  onAddTask?: () => void;
  onViewChange?: (id: string) => void;
}

export function CommandPalette({ onAddTask, onViewChange }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { commandPaletteOpen, setCommandPaletteOpen, theme, toggleTheme } = useUIStore();

  const close = useCallback(() => {
    setCommandPaletteOpen(false);
    setQuery("");
    setSelectedIdx(0);
  }, [setCommandPaletteOpen]);

  const commands: Command[] = useMemo(
    () => [
      {
        id: "add-task",
        label: "添加任务",
        description: "创建一个新任务",
        icon: <PlusIcon size={18} />,
        action: () => {
          onAddTask?.();
          close();
        },
        shortcut: "Ctrl+N",
      },
      {
        id: "go-inbox",
        label: "收集箱",
        description: "查看所有未分类任务",
        icon: <InboxIcon size={18} />,
        action: () => {
          onViewChange?.("inbox");
          close();
        },
      },
      {
        id: "go-today",
        label: "今天",
        description: "查看今日任务",
        icon: <ClockIcon size={18} />,
        action: () => {
          onViewChange?.("today");
          close();
        },
        shortcut: "Ctrl+T",
      },
      {
        id: "go-upcoming",
        label: "计划",
        description: "查看周计划视图",
        icon: <CalendarIcon size={18} />,
        action: () => {
          onViewChange?.("upcoming");
          close();
        },
      },
      {
        id: "toggle-theme",
        label: theme === "light" ? "深色模式" : "浅色模式",
        description: "切换主题",
        icon: theme === "light" ? <MoonIcon size={18} /> : <SunIcon size={18} />,
        action: () => {
          toggleTheme();
          close();
        },
        shortcut: "Ctrl+\\",
      },
      {
        id: "settings",
        label: "设置",
        icon: <SettingsIcon size={18} />,
        action: close,
      },
    ],
    [theme, toggleTheme, close, onAddTask, onViewChange],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.description?.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, commands]);

  const safeIdx = Math.min(selectedIdx, Math.max(0, filtered.length - 1));

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedIdx(0);
  }, []);

  useEffect(() => {
    if (commandPaletteOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape" && commandPaletteOpen) {
        close();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commandPaletteOpen, close, setCommandPaletteOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && filtered[safeIdx]) {
      filtered[safeIdx].action();
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/30 pt-32 animate-fade-in">
      <div className="w-[520px] max-w-[92vw] animate-scale-in">
        <div className="flex items-center gap-2 rounded-t-lg border border-border bg-surface px-4 py-3">
          <SearchIcon size={16} className="text-text-tertiary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
            placeholder="输入命令..."
          />
          <kbd className="rounded border border-border bg-surface-secondary px-1.5 py-0.5 text-[10px] text-text-tertiary">
            ESC
          </kbd>
        </div>
        <div className="rounded-b-lg border border-t-0 border-border bg-surface shadow-xl max-h-[360px] overflow-y-auto">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-text-tertiary">无匹配命令</p>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={cmd.action}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                i === safeIdx
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-surface-hover"
              }`}
            >
              <span className="text-current">{cmd.icon}</span>
              <span>{cmd.label}</span>
              {cmd.description && (
                <span className="ml-auto shrink-0 text-[11px] text-text-tertiary">
                  {cmd.description}
                </span>
              )}
              {cmd.shortcut && (
                <kbd className="rounded border border-border bg-surface-secondary px-1.5 py-0.5 text-[10px] text-text-tertiary">
                  {cmd.shortcut}
                </kbd>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
