import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task, TaskFilter } from "@/types";
import { loadTasks, createTask, updateTask, deleteTask, reorderTasks } from "@/lib";

export function useTasks(filter?: TaskFilter) {
  return useQuery({
    queryKey: ["tasks", filter ?? {}],
    queryFn: () => loadTasks(filter),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: Pick<Task, "title" | "description" | "priority" | "projectId" | "dueDate">,
    ) => Promise.resolve(createTask(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      Promise.resolve(updateTask(id, updates)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => Promise.resolve(deleteTask(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useReorderTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedIds: string[]) => Promise.resolve(reorderTasks(orderedIds)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
