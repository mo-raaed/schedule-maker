import { Authenticated, Unauthenticated, useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "../convex/_generated/api";
import {
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { Calendar } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Authenticated>
          <AuthenticatedContent />
        </Authenticated>
        <Unauthenticated>
          <LandingPage />
        </Unauthenticated>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight">
            Schedule Maker
          </span>
        </div>
        <Authenticated>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              },
            }}
          />
        </Authenticated>
      </div>
    </header>
  );
}

function AuthenticatedContent() {
  const upsertUser = useMutation(api.users.upsertUser);

  // Ensure user exists in database on first load
  useEffect(() => {
    void upsertUser();
  }, [upsertUser]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">My Schedules</h1>
      <p className="text-muted-foreground">
        Welcome! Schedule builder coming soon.
      </p>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-6 ring-1 ring-primary/20">
            <Calendar className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Build Your Perfect Schedule
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Plan your class schedule visually. Add courses, avoid conflicts,
            and find the perfect timetable for your semester.
          </p>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="text-3xl mb-2">📅</div>
            <h3 className="font-semibold mb-1">Visual Planner</h3>
            <p className="text-sm text-muted-foreground">
              See your weekly schedule at a glance with a clean calendar view
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold mb-1">Conflict Detection</h3>
            <p className="text-sm text-muted-foreground">
              Instantly spot time conflicts between your selected courses
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="text-3xl mb-2">💾</div>
            <h3 className="font-semibold mb-1">Save & Compare</h3>
            <p className="text-sm text-muted-foreground">
              Create multiple schedules and compare them side by side
            </p>
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <SignInButton mode="modal">
            <button className="w-full sm:w-auto min-w-[160px] px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="w-full sm:w-auto min-w-[160px] px-6 py-3 rounded-lg border border-border bg-background font-medium hover:bg-accent transition-colors">
              Create Account
            </button>
          </SignUpButton>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Same account as Gradify · Your data stays private
        </p>
      </div>
    </div>
  );
}
