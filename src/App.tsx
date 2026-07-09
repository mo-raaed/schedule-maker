import { Authenticated, Unauthenticated, useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../convex/_generated/api";
import {
  SignInButton,
  SignUpButton,
} from "@clerk/clerk-react";
import { LazyMotion, MotionConfig, m } from "motion/react";
import { Calendar, ArrowRight, Moon, Sun, Sparkles, GripVertical, FileDown } from "lucide-react";
import ScheduleBuilder from "./ScheduleBuilder";
import { useAppSettingsStore } from "./store/scheduleStore";
import SharedScheduleView from "./SharedScheduleView";
import { useConvexSync } from "./hooks/useConvexSync";

export default function App() {
  const darkMode = useAppSettingsStore((s) => s.darkMode);
  const [guestMode, setGuestMode] = useState(false);

  // Apply theme class to <html>. The FOUC script in index.html added
  // .light/.dark before first paint; keep exactly one of them in sync.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(darkMode ? "dark" : "light");
  }, [darkMode]);

  // Check for shared schedule in URL
  const shareId = new URL(window.location.href).searchParams.get("share");

  return (
    <LazyMotion features={() => import("./motionFeatures").then(m => m.default)} strict>
      <MotionConfig reducedMotion="user">
        {shareId ? (
          <SharedScheduleView shareId={shareId} />
        ) : (
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
        )}
      </MotionConfig>
    </LazyMotion>
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

  const { synced } = useConvexSync(userReady);

  return <ScheduleBuilder ready={userReady && synced} />;
}

const heroEase = [0.22, 1, 0.36, 1] as const;

function LandingPage({ onGuestMode }: { onGuestMode: () => void }) {
  const darkMode = useAppSettingsStore((s) => s.darkMode);
  const toggleDarkMode = useAppSettingsStore((s) => s.toggleDarkMode);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-end px-6 pt-5">
        <button
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
          className="p-2.5 rounded-full hover:bg-surface-2 transition-all duration-200 text-muted-foreground hover:text-foreground cursor-pointer active:scale-[0.98]"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Category label */}
          <m.span
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: heroEase }}
            className="inline-block text-[10px] uppercase tracking-[0.1em] font-semibold text-accent mb-6"
          >
            Weekly Planner
          </m.span>

          {/* Hero */}
          <m.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: heroEase, delay: 0.08 }}
            className="mb-16"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-lg bg-primary-solid mb-8 shadow-card-lg">
              <Calendar className="h-10 w-10 text-white" />
            </div>
            <h1 className="font-display text-[3.5rem] sm:text-[4rem] font-bold tracking-tight leading-[1.05] mb-5 text-foreground">
              Build Your Perfect
              <br />
              <span className="text-primary italic">Weekly Schedule</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              A beautifully minimal schedule planner. Add tasks, drag to
              rearrange, and export a clean PDF — all in your browser.
            </p>
          </m.div>

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
                title: "Export",
                desc: "Download your schedule as a 2x-resolution PDF or PNG",
              },
            ].map((f, i) => (
              <m.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: heroEase, delay: 0.16 + i * 0.08 }}
                className="p-6 rounded-lg bg-surface border border-border shadow-card hover-lift text-left"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-surface-2 mb-3 text-primary">
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold mb-1 text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </m.div>
            ))}
          </div>

          {/* CTAs */}
          <m.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: heroEase, delay: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <SignInButton mode="modal">
                <button className="w-full sm:w-auto min-w-[200px] px-8 py-4 rounded-full bg-primary-solid text-white
                  font-semibold hover:brightness-110 transition-all duration-200 shadow-card
                  cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]">
                  Sign In to Save
                </button>
              </SignInButton>
              <button
                onClick={onGuestMode}
                className="w-full sm:w-auto min-w-[200px] px-8 py-4 rounded-full
                  bg-transparent font-medium hover:bg-surface-2 transition-all duration-200
                  cursor-pointer text-primary border border-border
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

            <p className="mt-4 text-xs text-muted-foreground">
              No account needed to try · Sign in to sync across devices
            </p>
          </m.div>
        </div>
      </div>
    </div>
  );
}
