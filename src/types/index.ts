export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  projectId?: string;
  tags: string[];
  dueDate?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type TaskPriority = "urgent" | "high" | "medium" | "low" | "none";
export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  order: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  hooks: {
    onTaskCreate?: (task: Task) => void | Promise<void>;
    onTaskUpdate?: (task: Task) => void | Promise<void>;
    onTaskDelete?: (taskId: string) => void | Promise<void>;
    onTaskComplete?: (task: Task) => void | Promise<void>;
  };
}

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  projectIdIsNull?: boolean;
  hasDueDate?: boolean;
  search?: string;
}
