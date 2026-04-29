import { useState, useCallback, type ReactNode } from "react";
import { XIcon } from "@/components/icons";
import { motion, AnimatePresence } from "motion/react";
import { NotificationCtx } from "./context";

interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = crypto.randomUUID();
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const bg = { success: "bg-green-600", error: "bg-red-600", info: "bg-primary" };

  return (
    <NotificationCtx.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-white shadow-lg ${bg[n.type]}`}
            >
              <span>{n.message}</span>
              <button onClick={() => dismiss(n.id)} className="ml-1 rounded p-0.5 hover:bg-white/20">
                <XIcon size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationCtx.Provider>
  );
}
