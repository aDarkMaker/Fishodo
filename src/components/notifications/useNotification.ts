import { useContext } from "react";
import { NotificationCtx } from "./context";

export function useNotification() {
  return useContext(NotificationCtx);
}
