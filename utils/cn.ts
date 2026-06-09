/**
 * Tiny class-name joiner. Filters out falsy values so you can write
 * cn("base", condition && "extra"). Kept dependency-free on purpose —
 * the MVP doesn't need clsx/tailwind-merge.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
