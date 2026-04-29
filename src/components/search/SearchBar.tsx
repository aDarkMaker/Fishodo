import { useState, useRef, useEffect, useCallback } from "react";
import { SearchIcon } from "@/components/icons";
import { useTasks } from "@/hooks";
import { useUIStore } from "@/stores/ui-store";
import type { Task } from "@/types";

interface SearchBarProps {
  onSelectTask?: (taskId: string) => void;
}

export function SearchBar({ onSelectTask }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Task[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { searchOpen, setSearchOpen } = useUIStore();
  const { data: allTasks = [] } = useTasks();

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      if (!q.trim()) {
        setResults([]);
        return;
      }
      const lower = q.toLowerCase();
      const filtered = allTasks
        .filter(
          (t) =>
            t.title.toLowerCase().includes(lower) ||
            t.description?.toLowerCase().includes(lower),
        )
        .slice(0, 8);
      setResults(filtered);
      setSelectedIdx(0);
    },
    [allTasks],
  );

  const close = useCallback(() => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
  }, [setSearchOpen]);

  useEffect(() => {
    if (searchOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape" && searchOpen) {
        close();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchOpen, close, setSearchOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return close();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && results[selectedIdx]) {
      onSelectTask?.(results[selectedIdx].id);
      close();
    }
  };

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-24 animate-fade-in">
      <div className="w-[480px] max-w-[90vw] animate-scale-in">
        <div className="flex items-center gap-2 rounded-t-lg border border-b-0 border-border bg-surface px-4 py-3">
          <SearchIcon size={16} className="text-text-tertiary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
            placeholder="搜索任务..."
          />
          <kbd className="rounded border border-border bg-surface-secondary px-1.5 py-0.5 text-[10px] text-text-tertiary">
            ESC
          </kbd>
        </div>
        {results.length > 0 && (
          <div className="rounded-b-lg border border-border bg-surface shadow-xl">
            {results.map((t, i) => (
              <button
                key={t.id}
                onClick={() => {
                  onSelectTask?.(t.id);
                  close();
                }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  i === selectedIdx
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:bg-surface-hover"
                }`}
              >
                <span
                  className={`h-3 w-3 shrink-0 rounded-full ${
                    t.status === "done" ? "bg-success" : "border border-text-tertiary"
                  }`}
                />
                <span className="truncate">{t.title}</span>
                <span className="ml-auto shrink-0 text-[11px] text-text-tertiary">
                  {t.status === "done" ? "已完成" : "待办"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
