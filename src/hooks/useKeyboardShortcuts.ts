import { useEffect } from "react";

interface ShortcutHandlers {
  onNewTask: () => void;
  onExport: () => void;
  onSettings: () => void;
  onDelete?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't fire when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      // N → New Task
      if (e.key === "n" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handlers.onNewTask();
        return;
      }

      // Ctrl/Cmd + E → Export
      if (e.key === "e" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handlers.onExport();
        return;
      }

      // Comma or Ctrl+, → Settings
      if (e.key === "," && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handlers.onSettings();
        return;
      }

      // Delete/Backspace → Delete selected (if handler provided)
      if ((e.key === "Delete" || e.key === "Backspace") && handlers.onDelete) {
        e.preventDefault();
        handlers.onDelete();
        return;
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handlers]);
}
