import { useState, useRef, useCallback } from "react";
import {
  Calendar,
  Plus,
  Download,
  Settings,
  Share2,
  Moon,
  Sun,
  Keyboard,
  FileJson,
} from "lucide-react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/clerk-react";

import WeeklyGrid from "./components/grid/WeeklyGrid";
import AddTaskModal from "./components/modals/AddTaskModal";
import ExportModal from "./components/modals/ExportModal";
import ConfigSidebar from "./components/sidebar/ConfigSidebar";
import SchedulePicker from "./components/sidebar/SchedulePicker";
import { ShareModal, ImportExportModal } from "./components/modals/ShareImportModals";
import Button from "./components/ui/Button";
import Modal from "./components/ui/Modal";

import { useScheduleStore, useAppSettingsStore } from "./store/scheduleStore";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import type { Day, Task } from "./lib/types";

// ─── Main Builder View ──────────────────────────────────────────────

export default function ScheduleBuilder() {
  const schedule = useScheduleStore((s) => s.getActiveSchedule());
  const schedules = useScheduleStore((s) => s.schedules);
  const createSchedule = useScheduleStore((s) => s.createSchedule);
  const darkMode = useAppSettingsStore((s) => s.darkMode);
  const toggleDarkMode = useAppSettingsStore((s) => s.toggleDarkMode);

  // Modal states
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [prefillDay, setPrefillDay] = useState<Day | undefined>();
  const [prefillTime, setPrefillTime] = useState<string | undefined>();

  const gridRef = useRef<HTMLDivElement>(null);

  // Auto-create first schedule if none exist
  if (schedules.length === 0) {
    createSchedule("My Schedule");
  }

  // ── Keyboard shortcuts ──
  useKeyboardShortcuts({
    onNewTask: useCallback(() => {
      setEditingTask(null);
      setPrefillDay(undefined);
      setPrefillTime(undefined);
      setTaskModalOpen(true);
    }, []),
    onExport: useCallback(() => setExportModalOpen(true), []),
    onSettings: useCallback(() => setSidebarOpen((o) => !o), []),
  });

  // ── Grid event handlers ──
  const handleCellClick = useCallback((day: Day, time: string) => {
    setEditingTask(null);
    setPrefillDay(day);
    setPrefillTime(time);
    setTaskModalOpen(true);
  }, []);

  const handleTaskClick = useCallback((task: Task) => {
    setEditingTask(task);
    setPrefillDay(undefined);
    setPrefillTime(undefined);
    setTaskModalOpen(true);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* ── Header ── */}
      <header className="shrink-0 flex items-center justify-between px-4 h-14 border-b border-border bg-card/80 backdrop-blur-sm z-30">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-bold text-base tracking-tight hidden sm:inline">
              Schedule Maker
            </span>
          </div>
          <div className="h-5 w-px bg-border hidden sm:block" />
          <SchedulePicker />
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShortcutsOpen(true)}
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setImportExportOpen(true)}
            title="Import/Export JSON"
          >
            <FileJson className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShareModalOpen(true)}
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExportModalOpen(true)}
            title="Export (Ctrl+E)"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            title="Settings (Ctrl+,)"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <div className="h-5 w-px bg-border ml-1" />
          <Authenticated>
            <UserButton
              appearance={{ elements: { avatarBox: "h-8 w-8" } }}
            />
          </Authenticated>
          <Unauthenticated>
            <SignInButton mode="modal">
              <Button variant="secondary" size="sm">
                Sign In
              </Button>
            </SignInButton>
          </Unauthenticated>
        </div>
      </header>

      {/* ── Grid Area ── */}
      <main className="flex-1 min-h-0 p-3 sm:p-4">
        <WeeklyGrid
          gridRef={gridRef}
          onCellClick={handleCellClick}
          onTaskClick={handleTaskClick}
        />
      </main>

      {/* ── Floating Add Task Button ── */}
      <button
        onClick={() => {
          setEditingTask(null);
          setPrefillDay(undefined);
          setPrefillTime(undefined);
          setTaskModalOpen(true);
        }}
        className="fixed bottom-6 right-6 z-30 h-14 w-14 rounded-full bg-primary text-primary-foreground
          shadow-lg shadow-primary/25 flex items-center justify-center
          hover:shadow-xl hover:shadow-primary/30 hover:scale-105
          active:scale-95 transition-all duration-150 cursor-pointer"
        title="Add Task (N)"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* ── Modals & Sidebar ── */}
      <AddTaskModal
        open={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        editTask={editingTask}
        prefillDay={prefillDay}
        prefillTime={prefillTime}
      />
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
      <ConfigSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
      <ImportExportModal
        open={importExportOpen}
        onClose={() => setImportExportOpen(false)}
      />

      {/* Shortcuts Modal */}
      <Modal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        title="Keyboard Shortcuts"
        maxWidth="max-w-xs"
      >
        <div className="space-y-3 text-sm">
          {[
            ["N", "Add new task"],
            ["Ctrl + E", "Export schedule"],
            ["Ctrl + ,", "Open settings"],
            ["Esc", "Close modals"],
            ["Click cell", "Add task at time"],
            ["Click task", "Edit task"],
            ["Drag task", "Move task"],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-muted-foreground">{desc}</span>
              <kbd className="px-2 py-0.5 bg-muted rounded-md text-xs font-mono font-medium">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
