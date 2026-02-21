import { Authenticated, Unauthenticated, useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../convex/_generated/api";
import {
  SignInButton,
} from "@clerk/clerk-react";
import { Calendar, ArrowRight, Moon, Sun } from "lucide-react";
import ScheduleBuilder from "./ScheduleBuilder";
import { useAppSettingsStore } from "./store/scheduleStore";
import SharedScheduleView from "./SharedScheduleView";
import { useConvexSync } from "./hooks/useConvexSync";

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
      {/* Top bar with dark mode toggle */}
      <div className="flex items-center justify-end px-5 pt-4">
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Hero */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6 ring-1 ring-primary/20 shadow-soft">
              <Calendar className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Build Your Perfect
              <br />
              <span className="text-primary">Weekly Schedule</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              A beautifully minimal schedule planner. Add tasks, drag to
              rearrange, and export a clean PDF — all in your browser.
            </p>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {[
              {
                icon: "📐",
                title: "Visual Grid",
                desc: "See your entire week at a glance on a clean, configurable calendar",
              },
              {
                icon: "🎨",
                title: "Drag & Drop",
                desc: "Click to add tasks, drag to rearrange them — effortless planning",
              },
              {
                icon: "📄",
                title: "Flawless Export",
                desc: "Download your schedule as a high-resolution PDF or PNG",
              },
            ].map((f) => (
              <div key={f.title} className="p-5 rounded-2xl bg-card border border-border shadow-soft hover:shadow-card transition-shadow duration-300">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onGuestMode}
            className="w-full sm:w-auto min-w-[200px] px-6 py-3.5 rounded-xl bg-primary text-primary-foreground 
              font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20
              cursor-pointer flex items-center justify-center gap-2"
          >
            Start Building
            <ArrowRight className="h-4 w-4" />
          </button>
          <SignInButton mode="modal">
            <button className="w-full sm:w-auto min-w-[200px] px-6 py-3.5 rounded-xl border border-border
              bg-card font-medium hover:bg-accent transition-colors cursor-pointer">
              Sign In to Save
            </button>
          </SignInButton>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          No account needed to try · Sign in to save & sync across devices
        </p>
        </div>
      </div>
    </div>
  );
}
