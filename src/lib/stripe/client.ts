import "server-only";
import Stripe from "stripe";

/**
 * Server-only Stripe client.
 * NEVER import this module in client components or browser bundles.
 *
 * STRIPE_SECRET_KEY must be set in server-side environment variables only.
 * It must NOT be exposed to the client (do not prefix with NEXT_PUBLIC_).
 *
 * If the key is not configured, the client throws at construction time so
 * server actions fail loudly rather than silently sending empty requests.
 */
function createStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured. " +
        "Set this environment variable in your server environment. " +
        "Do NOT set it as NEXT_PUBLIC_STRIPE_SECRET_KEY."
    );
  }

  return new Stripe(secretKey, {
    // Pin API version to match the installed Stripe SDK version
    apiVersion: "2026-08-26.dahlia",
    // Allows Stripe to attribute API calls to this integration
    appInfo: {
      name: "Digital Heroes",
      version: "1.0.0",
    },
  });
}

/**
 * Singleton-pattern Stripe client.
 * Lazily initialized to avoid crash at module-load time when env is not set.
 */
let _stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!_stripeClient) {
    _stripeClient = createStripeClient();
  }
  return _stripeClient;
}
