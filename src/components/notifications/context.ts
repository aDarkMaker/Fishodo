import { createContext } from "react";

type NotificationType = "success" | "error" | "info";

export interface NotificationContextValue {
  notify: (message: string, type?: NotificationType) => void;
}

export const NotificationCtx = createContext<NotificationContextValue>({
  notify: () => {},
});
