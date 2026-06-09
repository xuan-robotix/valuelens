import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { SearchBar } from "@/components/search/SearchBar";
import { isSupabaseConfigured } from "@/services/supabase/config";
import { getCurrentUser } from "@/services/supabase/server";

/** Sticky top bar: logo, persistent compact search, theme toggle, account. */
export async function Header() {
  const authEnabled = isSupabaseConfigured();
  const user = authEnabled ? await getCurrentUser() : null;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <div className="flex items-center gap-2">
          <SearchBar size="compact" />
          <ThemeToggle />
          {authEnabled && <UserMenu email={user?.email ?? null} />}
        </div>
      </div>
    </header>
  );
}
