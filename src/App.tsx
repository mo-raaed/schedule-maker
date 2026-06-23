import { Authenticated, Unauthenticated, useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../convex/_generated/api";
  SignInButton,
  SignUpButton,
} from "@clerk/clerk-react";
import { Calendar, ArrowRight, Moon, Sun, Sparkles, GripVertical, FileDown } from "lucide-react";
import ScheduleBuilder from "./ScheduleBuilder";
import { useAppSettingsStore } from "./store/scheduleStore";
import SharedScheduleView from "./SharedScheduleView";
import { useConvexSync } from "./hooks/useConvexSync";
import FluidBackground from "./components/effects/FluidBackground";

export default function App() {
  const darkMode = useAppSettingsStore((s) => s.darkMode);
  const [guestMode, setGuestMode] = useState(false);

  // Apply dark mode class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Check for shared schedule in URL
  const shareId = new URL(window.location.href).searchParams.get("share");
  if (shareId) {
    return <SharedScheduleView shareId={shareId} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <FluidBackground />
      <Authenticated>
        <AuthenticatedApp />
      </Authenticated>
      <Unauthenticated>
        {guestMode ? (
          <ScheduleBuilder />
        ) : (
          <LandingPage onGuestMode={() => setGuestMode(true)} />
        )}
      </Unauthenticated>
    </div>
  );
}

function AuthenticatedApp() {
  const upsertUser = useMutation(api.users.upsertUser);
  const [userReady, setUserReady] = useState(false);
  const didUpsert = useRef(false);

  useEffect(() => {
    if (didUpsert.current) return;
    didUpsert.current = true;
    void upsertUser().then(() => setUserReady(true));
  }, [upsertUser]);

  useConvexSync(userReady);

  return <ScheduleBuilder />;
}

function LandingPage({ onGuestMode }: { onGuestMode: () => void }) {
  const darkMode = useAppSettingsStore((s) => s.darkMode);
  const toggleDarkMode = useAppSettingsStore((s) => s.toggleDarkMode);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-end px-6 pt-5">
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-full hover:bg-[var(--color-surface-container-high)] transition-all duration-200 text-muted-foreground hover:text-foreground cursor-pointer active:scale-[0.98]"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Category label */}
          <span className="inline-block text-[10px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-6">
            Weekly Planner
          </span>

          {/* Hero */}
          <div className="mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl gradient-primary mb-8 shadow-ambient">
              <Calendar className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-[3.5rem] sm:text-[4rem] font-bold tracking-[-0.04em] leading-[1.05] mb-5 text-foreground">
              Build Your Perfect
              <br />
              <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] bg-clip-text text-transparent">
                Weekly Schedule
              </span>
            </h1>
            <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              A beautifully minimal schedule planner. Add tasks, drag to
              rearrange, and export a clean PDF — all in your browser.
            </p>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-5 mb-16">
            {[
              {
                icon: <Sparkles className="h-6 w-6" />,
                title: "Visual Grid",
                desc: "See your entire week at a glance on a clean, configurable calendar",
              },
              {
                icon: <GripVertical className="h-6 w-6" />,
                title: "Drag & Drop",
                desc: "Click to add tasks, drag to rearrange them — effortless planning",
              },
              {
                icon: <FileDown className="h-6 w-6" />,
                title: "Flawless Export",
                desc: "Download your schedule as a high-resolution PDF or PNG",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-3xl bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] transition-all duration-200 shadow-soft"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[var(--color-surface-container-highest)] mb-3 text-primary">
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-1 text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <SignInButton mode="modal">
                <button className="w-full sm:w-auto min-w-[200px] px-8 py-4 rounded-full gradient-primary text-white
                  font-semibold hover:brightness-110 transition-all duration-200 shadow-ambient
                  cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]">
                  Sign In to Save
                </button>
              </SignInButton>
              <button
                onClick={onGuestMode}
                className="w-full sm:w-auto min-w-[200px] px-8 py-4 rounded-full
                  bg-transparent font-medium hover:bg-[var(--color-surface-container-high)] transition-all duration-200
                  cursor-pointer text-[var(--color-primary)] border-[1.5px] border-[var(--color-outline-variant)]/15
                  active:scale-[0.98]"
              >
                Start Building
                <ArrowRight className="h-4 w-4 ml-2 inline-block" />
              </button>
            </div>
            
            <SignUpButton mode="modal">
              <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-2 underline decoration-muted-foreground/30 hover:decoration-foreground/50 underline-offset-4">
                Create a new account
              </button>
            </SignUpButton>
          </div>

          <p className="mt-8 text-xs text-muted-foreground">
            No account needed to try · Sign in to sync across devices
          </p>
        </div>
      </div>
    </div>
  );
}
