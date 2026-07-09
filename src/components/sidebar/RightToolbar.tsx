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
    <aside className="hidden md:flex flex-col w-52 shrink-0 bg-background border-l border-border p-3 gap-1 overflow-y-auto">
      {/* Primary action */}
      <ToolbarButton
        icon={<Plus className="h-4 w-4" />}
        label="Add Task"
        onClick={onAddTask}
        primary
      />

      <div className="my-3" />

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
        label="Import & Export"
        onClick={onData}
      />

      <div className="my-3" />

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
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-full
          bg-primary-solid text-white font-semibold text-sm
          shadow-card hover:brightness-110
          transition-all duration-200 cursor-pointer active:scale-[0.98]"
      >
        {icon}
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2 rounded-full
        text-sm text-foreground font-medium
        hover:bg-surface-2
        transition-all duration-200 cursor-pointer active:scale-[0.98]"
    >
      {icon}
      {label}
    </button>
  );
}
