import { useState } from "react";
import {
  Plus,
  Settings,
  Share2,
  MoreHorizontal,
  FileJson,
  Keyboard,
} from "lucide-react";

interface MobileBottomBarProps {
  onAddTask: () => void;
  onSettings: () => void;
  onExportShare: () => void;
  onData: () => void;
  onShortcuts: () => void;
}

export default function MobileBottomBar({
  onAddTask,
  onSettings,
  onExportShare,
  onData,
  onShortcuts,
}: MobileBottomBarProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
      {/* More menu overlay */}
      {moreOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute bottom-16 right-3 w-44 glass-card rounded-2xl shadow-ambient overflow-hidden animate-slide-up z-50">
            <button
              onClick={() => { onData(); setMoreOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-foreground
                hover:bg-[var(--color-surface-container-high)] transition-all duration-200 cursor-pointer"
            >
              <FileJson className="h-4 w-4 text-muted-foreground" />
              Data
            </button>
            <button
              onClick={() => { onShortcuts(); setMoreOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-foreground
                hover:bg-[var(--color-surface-container-high)] transition-all duration-200 cursor-pointer"
            >
              <Keyboard className="h-4 w-4 text-muted-foreground" />
              Shortcuts
            </button>
          </div>
        </>
      )}

      {/* Bottom bar */}
      <div className="flex items-center justify-around glass-card h-14 px-2">
        <BottomBarItem icon={<Plus className="h-5 w-5" />} label="Add" onClick={onAddTask} primary />
        <BottomBarItem icon={<Settings className="h-5 w-5" />} label="Settings" onClick={onSettings} />
        <BottomBarItem icon={<Share2 className="h-5 w-5" />} label="Export" onClick={onExportShare} />
        <BottomBarItem
          icon={<MoreHorizontal className="h-5 w-5" />}
          label="More"
          onClick={() => setMoreOpen(!moreOpen)}
        />
      </div>
    </div>
  );
}

function BottomBarItem({
  icon,
  label,
  onClick,
  primary,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer active:scale-[0.98]
        ${primary
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
        }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
