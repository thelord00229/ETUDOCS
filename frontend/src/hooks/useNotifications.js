import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteAllNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
} from "../services/api";

const POLL_INTERVAL = 30_000;

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const aliveRef = useRef(true);

  const fetchNotifs = useCallback(async () => {
    try {
      const data = await getNotifications();
      if (aliveRef.current && Array.isArray(data)) {
        setNotifications(data);
      }
    } catch {
      /* silencieux — pas connecté ou token expiré */
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    fetchNotifs();
    const timer = setInterval(fetchNotifs, POLL_INTERVAL);
    return () => {
      aliveRef.current = false;
      clearInterval(timer);
    };
  }, [fetchNotifs]);

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, lue: true })));
    } catch {
      /* silencieux */
    }
  }, []);

  const deleteOne = useCallback(async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteNotification(id);
    } catch {
      /* silencieux */
    }
  }, []);

  const deleteAll = useCallback(async () => {
    setNotifications([]);
    try {
      await deleteAllNotifications();
    } catch {
      /* silencieux */
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.lue).length;

  return { notifications, unreadCount, markAllRead, deleteOne, deleteAll };
}
