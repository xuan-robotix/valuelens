import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { Card } from "@/components/ui/Card";
import { isSupabaseConfigured } from "@/services/supabase/config";
import { getCurrentUser } from "@/services/supabase/server";

export const metadata: Metadata = { title: "Sign in — ValueLens" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") ? next : "/";

  // Already signed in → bounce to destination.
  const user = await getCurrentUser();
  if (user) redirect(safeNext);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to ValueLens
        </h1>
        <p className="mt-1 text-sm text-muted">
          Save analyses and build a watchlist.
        </p>
      </div>

      <Card className="p-6">
        {isSupabaseConfigured() ? (
          <AuthForm next={safeNext} />
        ) : (
          <div className="text-sm text-muted">
            <p className="font-medium text-fg">Accounts aren&apos;t configured yet.</p>
            <p className="mt-2">
              Set <code className="text-fg">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="text-fg">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in
              your environment to enable sign-in. See{" "}
              <code className="text-fg">db/README.md</code>.
            </p>
          </div>
        )}
      </Card>

      <Link
        href="/"
        className="mt-6 text-center text-sm text-brand hover:underline"
      >
        ← Back home
      </Link>
    </div>
  );
}
