/** Used only when onboarding stack is missing — still specific, never generic */
export const DEFAULT_DEMO_STACK = ["React", "Next.js", "TypeScript", "Supabase"];

export function resolveUserStack(stack?: string[]): string[] {
  if (stack && stack.length > 0) return stack;
  return DEFAULT_DEMO_STACK;
}
