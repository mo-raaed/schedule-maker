import type { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Shared Clerk instance with Gradify — same JWT template
      // Configure CLERK_JWT_ISSUER_DOMAIN on the Convex Dashboard
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
