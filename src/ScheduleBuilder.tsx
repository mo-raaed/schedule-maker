import { useState, useRef, useCallback } from "react";
import {
  Calendar,
  Moon,
  Sun,
} from "lucide-react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/clerk-react";

import WeeklyGrid from "./components/grid/WeeklyGrid";
import AddTaskModal from "./components/modals/AddTaskModal";
import ExportShareModal from "./components/modals/ExportShareModal";
import DataModal from "./components/modals/DataModal";
import SettingsModal from "./components/modals/SettingsModal";
import ScheduleTabs from "./components/sidebar/ScheduleTabs";
import RightToolbar from "./components/sidebar/RightToolbar";
import MobileBottomBar from "./components/sidebar/MobileBottomBar";
import Button from "./components/ui/Button";
import Modal from "./components/ui/Modal";

import { useScheduleStore, useAppSettingsStore } from "./store/scheduleStore";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import type { Day, Task } from "./lib/types";

// ─── Main Builder View ──────────────────────────────────────────────

export default function ScheduleBuilder() {
  const schedules = useScheduleStore((s) => s.schedules);
  const createSchedule = useScheduleStore((s) => s.createSchedule);
  const darkMode = useAppSettingsStore((s) => s.darkMode);
  const toggleDarkMode = useAppSettingsStore((s) => s.toggleDarkMode);

  // Modal states
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [exportShareOpen, setExportShareOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);
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
    onExport: useCallback(() => setExportShareOpen(true), []),
    onSettings: useCallback(() => setSettingsOpen((o) => !o), []),
  });

  // ── Callbacks ──
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

  const openAddTask = useCallback(() => {
    setEditingTask(null);
    setPrefillDay(undefined);
    setPrefillTime(undefined);
    setTaskModalOpen(true);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* ── Header ── */}
      <header className="shrink-0 flex items-center justify-between px-4 h-14 border-b border-border bg-card/80 backdrop-blur-sm z-30">
        {/* Left — Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="font-bold text-base tracking-tight hidden sm:inline">
            Schedule Maker
          </span>
        </div>

        {/* Center — Schedule Tabs */}
        <ScheduleTabs />

        {/* Right — Dark mode + auth */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <div className="h-5 w-px bg-border ml-0.5" />
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

      {/* ── Body: Grid + Right Toolbar ── */}
      <div className="flex flex-1 min-h-0">
        {/* Grid Area */}
        <main className="flex-1 min-h-0 min-w-0 p-3 sm:p-5 md:p-6 pb-18 md:pb-6 overflow-auto">
          <div className="max-w-6xl mx-auto h-full">
            <WeeklyGrid
              gridRef={gridRef}
              onCellClick={handleCellClick}
              onTaskClick={handleTaskClick}
            />
          </div>
        </main>

        {/* Right Toolbar (desktop) */}
        <RightToolbar
          onAddTask={openAddTask}
          onSettings={() => setSettingsOpen(true)}
          onExportShare={() => setExportShareOpen(true)}
          onData={() => setDataOpen(true)}
          onShortcuts={() => setShortcutsOpen(true)}
        />
      </div>

      {/* Mobile Bottom Bar */}
      <MobileBottomBar
        onAddTask={openAddTask}
        onSettings={() => setSettingsOpen(true)}
        onExportShare={() => setExportShareOpen(true)}
        onData={() => setDataOpen(true)}
        onShortcuts={() => setShortcutsOpen(true)}
      />

      {/* ── Modals ── */}
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
      <ExportShareModal
        open={exportShareOpen}
        onClose={() => setExportShareOpen(false)}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <DataModal
        open={dataOpen}
        onClose={() => setDataOpen(false)}
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
              <kbd className="px-2 py-0.5 bg-muted rounded-lg text-xs font-mono font-medium">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
