import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App.tsx";

import { useAppSettingsStore } from "./store/scheduleStore";

const convex = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL as string
);

function Root() {
  const darkMode = useAppSettingsStore((s) => s.darkMode);

  return (
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: "#056380",
          colorBackground: darkMode ? "#141a21" : "#ffffff",
          colorText: darkMode ? "#e1e5ee" : "#003348",
          colorInputBackground: darkMode ? "#1f262f" : "#f5faff",
          colorInputText: darkMode ? "#e1e5ee" : "#003348",
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          borderRadius: "1rem",
        },
        elements: {
          card: `bg-card text-foreground shadow-ambient ${darkMode ? 'border border-[var(--color-outline-variant)]/15' : 'border border-[var(--color-outline-variant)]/15'}`,
          headerTitle: "text-foreground font-bold font-sans",
          headerSubtitle: "text-muted-foreground font-sans",
          formButtonPrimary: "gradient-primary text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-soft font-sans font-medium border-none",
          formFieldInput: "bg-[var(--color-surface-container-highest)] border-none focus:ring-2 focus:ring-primary/50 font-sans text-foreground transition-all duration-200",
          formFieldLabel: "text-[var(--color-on-surface-variant)] uppercase text-[10px] tracking-[0.05em] font-semibold font-sans",
          footerActionLink: "text-primary hover:text-primary/80 font-sans font-medium",
          dividerLine: "bg-[var(--color-outline-variant)]/15",
          dividerText: "text-muted-foreground font-sans",
          identityPreviewText: "text-foreground font-sans",
          identityPreviewEditButtonIcon: "text-primary",
          formFieldSuccessText: "text-green-500 font-sans",
          formFieldErrorText: "text-destructive font-sans",
          socialButtonsBlockButton: "bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] border-none text-foreground font-medium font-sans active:scale-[0.98] transition-all duration-200",
        }
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <App />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
