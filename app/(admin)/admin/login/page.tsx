"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { cn } from "@/utils/cn";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(
          data?.error ??
            (res.status === 401 ? "Incorrect password" : "Login failed")
        );
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-[100dvh] flex items-center justify-center px-4 sm:px-6 bg-verse-bg">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-verse-card verse-border">
            <Lock className="h-6 w-6 text-verse-accent" />
          </div>
        </div>

        <h1 className="font-serif text-3xl text-verse-text text-center mb-2">
          Admin
        </h1>
        <p className="font-sans text-xs text-verse-muted text-center mb-8">
          Restricted access. Enter the admin password to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            autoFocus
            autoComplete="current-password"
            className={cn(
              "w-full bg-verse-card verse-border rounded-full",
              "px-5 py-3 font-sans text-sm text-verse-text",
              "placeholder:text-verse-muted/50 outline-none",
              "focus:border-verse-accent/30 transition-colors duration-300"
            )}
          />
          <button
            type="submit"
            disabled={isSubmitting || !password}
            className={cn(
              "w-full font-sans text-sm py-3 rounded-full",
              "bg-verse-accent text-verse-bg",
              "transition-all duration-300 ease-verse",
              "hover:opacity-90 hover:-translate-y-0.5",
              "disabled:opacity-40 disabled:pointer-events-none"
            )}
          >
            {isSubmitting ? "Verifying…" : "Sign in"}
          </button>
          {error && (
            <p className="font-sans text-xs text-red-400 text-center pt-2">
              {error}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
