import type { Task, Project, TaskFilter } from "@/types";

const STORE_KEYS = {
  tasks: "fishodo:tasks",
  projects: "fishodo:projects",
  settings: "fishodo:settings",
} as const;

function generateId(): string {
  return crypto.randomUUID();
}

/* ------------------------------------------------------------------ */
/*  Task Store                                                         */
/* ------------------------------------------------------------------ */

export function loadTasks(filter?: TaskFilter): Task[] {
  try {
    const raw = localStorage.getItem(STORE_KEYS.tasks);
    let tasks: Task[] = raw ? JSON.parse(raw) : [];

    if (filter) {
      if (filter.status) tasks = tasks.filter((t) => t.status === filter.status);
      if (filter.priority) tasks = tasks.filter((t) => t.priority === filter.priority);
      if (filter.projectId) tasks = tasks.filter((t) => t.projectId === filter.projectId);
      if (filter.projectIdIsNull) tasks = tasks.filter((t) => !t.projectId);
      if (filter.hasDueDate) tasks = tasks.filter((t) => !!t.dueDate);
      if (filter.search) {
        const keyword = filter.search.toLowerCase();
        tasks = tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(keyword) ||
            t.description?.toLowerCase().includes(keyword),
        );
      }
    }

    return tasks.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch {
    return [];
  }
}

export function createTask(
  input: Pick<Task, "title" | "description" | "priority" | "projectId" | "dueDate">,
): Task {
  const tasks = loadTasks();
  const now = new Date().toISOString();
  const task: Task = {
    id: generateId(),
    title: input.title,
    description: input.description,
    priority: input.priority ?? "none",
    status: "todo",
    projectId: input.projectId,
    tags: [],
    dueDate: input.dueDate,
    order: tasks.filter((t) => t.status !== "done").length,
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(task);
  localStorage.setItem(STORE_KEYS.tasks, JSON.stringify(tasks));
  return task;
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const tasks = loadTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  if (updates.status === "done" && tasks[index].status !== "done") {
    updates.completedAt = new Date().toISOString();
  }
  if (updates.status === "todo" && tasks[index].status === "done") {
    updates.completedAt = undefined;
  }

  tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORE_KEYS.tasks, JSON.stringify(tasks));
  return tasks[index];
}

export function deleteTask(id: string): boolean {
  const tasks = loadTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return false;
  localStorage.setItem(STORE_KEYS.tasks, JSON.stringify(filtered));
  return true;
}

export function reorderTasks(orderedIds: string[]): void {
  const tasks = loadTasks();
  orderedIds.forEach((id, i) => {
    const t = tasks.find((t) => t.id === id);
    if (t) t.order = i;
  });
  localStorage.setItem(STORE_KEYS.tasks, JSON.stringify(tasks));
}

/* ------------------------------------------------------------------ */
/*  Project Store                                                      */
/* ------------------------------------------------------------------ */

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORE_KEYS.projects);
    const projects: Project[] = raw ? JSON.parse(raw) : [];
    return projects.sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

export function createProject(
  input: Pick<Project, "name" | "description" | "color" | "icon">,
): Project {
  const projects = loadProjects();
  const now = new Date().toISOString();
  const project: Project = {
    id: generateId(),
    name: input.name,
    description: input.description,
    color: input.color,
    icon: input.icon,
    order: projects.length,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };

  projects.push(project);
  localStorage.setItem(STORE_KEYS.projects, JSON.stringify(projects));
  return project;
}

export function updateProject(id: string, updates: Partial<Project>): Project | null {
  const projects = loadProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return null;

  projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORE_KEYS.projects, JSON.stringify(projects));
  return projects[index];
}

export function deleteProject(id: string): boolean {
  const projects = loadProjects();
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length === projects.length) return false;

  const tasks = loadTasks();
  const cleaned = tasks.map((t) => (t.projectId === id ? { ...t, projectId: undefined } : t));
  localStorage.setItem(STORE_KEYS.tasks, JSON.stringify(cleaned));

  filtered.forEach((p, i) => {
    p.order = i;
  });
  localStorage.setItem(STORE_KEYS.projects, JSON.stringify(filtered));
  return true;
}

export function reorderProjects(orderedIds: string[]): void {
  const projects = loadProjects();
  orderedIds.forEach((id, i) => {
    const p = projects.find((p) => p.id === id);
    if (p) p.order = i;
  });
  localStorage.setItem(STORE_KEYS.projects, JSON.stringify(projects));
}
