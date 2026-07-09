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
          colorPrimary: darkMode ? "#5560C9" : "#252D6B",
          colorBackground: darkMode ? "#141830" : "#FFFFFF",
          colorText: darkMode ? "#ECE9F0" : "#131C30",
          colorInputBackground: darkMode ? "#1B2040" : "#EFEAE3",
          colorInputText: darkMode ? "#ECE9F0" : "#131C30",
          fontFamily: '"Plus Jakarta Sans Variable", system-ui, sans-serif',
          borderRadius: "0.75rem",
        },
        elements: {
          card: "bg-surface text-foreground shadow-card-lg border border-border",
          headerTitle: "text-foreground font-bold font-display",
          headerSubtitle: "text-muted-foreground font-sans",
          formButtonPrimary: "bg-primary-solid text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-card font-sans font-semibold border-none",
          formFieldInput: "bg-surface-2 border border-border focus:ring-2 focus:ring-ring/70 font-sans text-foreground transition-all duration-200",
          formFieldLabel: "text-muted-foreground uppercase text-[10px] tracking-[0.05em] font-semibold font-sans",
          footerActionLink: "text-primary hover:text-primary/80 font-sans font-medium",
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground font-sans",
          identityPreviewText: "text-foreground font-sans",
          identityPreviewEditButtonIcon: "text-primary",
          formFieldSuccessText: "text-primary font-sans",
          formFieldErrorText: "text-destructive font-sans",
          socialButtonsBlockButton: "bg-surface-2 hover:bg-surface-3 border border-border text-foreground font-medium font-sans active:scale-[0.98] transition-all duration-200",
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
