import {
  Plus,
  Settings,
  Share2,
  FileJson,
  Keyboard,
} from "lucide-react";

interface RightToolbarProps {
  onAddTask: () => void;
  onSettings: () => void;
  onExportShare: () => void;
  onData: () => void;
  onShortcuts: () => void;
}

export default function RightToolbar({
  onAddTask,
  onSettings,
  onExportShare,
  onData,
  onShortcuts,
}: RightToolbarProps) {
  return (
    <aside className="hidden md:flex flex-col w-52 shrink-0 border-l border-border bg-card/50 p-3 gap-1 overflow-y-auto">
      {/* Primary action */}
      <ToolbarButton
        icon={<Plus className="h-4 w-4" />}
        label="Add Task"
        onClick={onAddTask}
        primary
      />

      <div className="h-px bg-border my-2" />

      {/* Schedule actions */}
      <ToolbarButton
        icon={<Settings className="h-4 w-4" />}
        label="Settings"
        onClick={onSettings}
      />
      <ToolbarButton
        icon={<Share2 className="h-4 w-4" />}
        label="Export & Share"
        onClick={onExportShare}
      />
      <ToolbarButton
        icon={<FileJson className="h-4 w-4" />}
        label="Data"
        onClick={onData}
      />

      <div className="h-px bg-border my-2" />

      {/* Help */}
      <ToolbarButton
        icon={<Keyboard className="h-4 w-4" />}
        label="Shortcuts"
        onClick={onShortcuts}
      />
    </aside>
  );
}

// ─── Toolbar Button ──────────────────────────────────────────────

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
}

function ToolbarButton({ icon, label, onClick, primary }: ToolbarButtonProps) {
  if (primary) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl
          bg-primary text-primary-foreground font-medium text-sm
          shadow-sm hover:bg-primary/90
          transition-colors duration-100 cursor-pointer"
      >
        {icon}
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl
        text-sm text-foreground font-medium
        hover:bg-accent
        transition-colors duration-100 cursor-pointer"
    >
      {icon}
      {label}
    </button>
  );
}
