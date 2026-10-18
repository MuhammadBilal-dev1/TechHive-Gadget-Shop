/**
 * Drop this file at: react-native-gadget-shop/src/types/env.d.ts
 * (new file — this is what makes `import { X } from "@env"` type-check
 * in VS Code / tsc instead of showing "Cannot find module '@env'")
 *
 * Add every env variable you use via @env here. STRIPE_PUBLISHABLE_KEY
 * is the one visible in your error — add others (Supabase URL/key etc.)
 * the same way if you also import them from "@env" elsewhere.
 */
declare module "@env" {
  export const STRIPE_PUBLISHABLE_KEY: string;
}