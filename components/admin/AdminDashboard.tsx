import Link from "next/link";
import {
  Bookmark,
  FileText,
  Heart,
  MessageSquareQuote,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import type { AdminStats } from "@/lib/services/admin";
import { cn } from "@/utils/cn";
import { formatAuthorAttribution } from "@/utils/format-author";

interface AdminDashboardProps {
  stats: AdminStats;
}

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");

function formatNumber(n: number) {
  return NUMBER_FORMATTER.format(n);
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Heart;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "p-5 rounded-2xl verse-border bg-verse-card/60",
        accent && "border-verse-accent/30 bg-verse-accent/5"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="font-sans text-[11px] text-verse-muted tracking-widest uppercase">
          {label}
        </p>
        <Icon
          className={cn(
            "h-4 w-4",
            accent ? "text-verse-accent" : "text-verse-muted"
          )}
        />
      </div>
      <p className="mt-3 font-serif text-3xl text-verse-text">{value}</p>
      {sub && (
        <p className="mt-1 font-sans text-xs text-verse-muted">{sub}</p>
      )}
    </div>
  );
}

export default function AdminDashboard({ stats }: AdminDashboardProps) {
  const maxBar = Math.max(
    1,
    ...stats.activityByDay.map((d) => d.quotes + d.likes)
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={MessageSquareQuote}
          label="Quotes"
          value={formatNumber(stats.totalQuotes)}
          sub={`${stats.quotesLast7Days} this week · ${stats.quotesLast30Days} this month`}
        />
        <StatCard
          icon={Users}
          label="Unique users"
          value={formatNumber(stats.uniqueSessions)}
          sub="Distinct sessions across all activity"
          accent
        />
        <StatCard
          icon={Heart}
          label="Likes"
          value={formatNumber(stats.totalLikes)}
        />
        <StatCard
          icon={Bookmark}
          label="Bookmarks"
          value={formatNumber(stats.totalBookmarks)}
        />
        <StatCard
          icon={Star}
          label="Featured"
          value={formatNumber(stats.featuredCount)}
        />
        <StatCard
          icon={FileText}
          label="Drafts in flight"
          value={formatNumber(stats.totalDrafts)}
        />
        <StatCard
          icon={Sparkles}
          label="Engagement rate"
          value={
            stats.totalQuotes === 0
              ? "—"
              : `${((stats.totalLikes / Math.max(1, stats.totalQuotes)) * 100).toFixed(0)}%`
          }
          sub="Likes per quote, lifetime"
        />
        <StatCard
          icon={Sparkles}
          label="Save rate"
          value={
            stats.totalQuotes === 0
              ? "—"
              : `${((stats.totalBookmarks / Math.max(1, stats.totalQuotes)) * 100).toFixed(0)}%`
          }
          sub="Bookmarks per quote"
        />
      </div>

      <section className="p-5 rounded-2xl verse-border bg-verse-card/60">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="font-sans text-[11px] text-verse-muted tracking-widest uppercase">
              Last 14 days
            </p>
            <h2 className="font-serif text-xl text-verse-text mt-1">
              Activity
            </h2>
          </div>
          <div className="flex items-center gap-4 font-sans text-[11px] text-verse-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-verse-accent inline-block" />
              Quotes
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-verse-muted/50 inline-block" />
              Likes
            </span>
          </div>
        </div>
        <div className="flex items-end gap-1.5 h-32">
          {stats.activityByDay.map((d) => {
            const totalHeight =
              ((d.quotes + d.likes) / maxBar) * 100;
            const quoteHeight = ((d.quotes) / maxBar) * 100;
            return (
              <div
                key={d.date}
                className="flex-1 flex flex-col justify-end gap-0.5 group relative"
                title={`${d.date}: ${d.quotes} quotes, ${d.likes} likes`}
              >
                <div
                  className="bg-verse-muted/40 rounded-sm transition-all"
                  style={{ height: `${totalHeight - quoteHeight}%` }}
                />
                <div
                  className="bg-verse-accent rounded-sm transition-all"
                  style={{ height: `${quoteHeight}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between font-sans text-[10px] text-verse-muted/70">
          <span>{stats.activityByDay[0]?.date.slice(5)}</span>
          <span>
            {stats.activityByDay[stats.activityByDay.length - 1]?.date.slice(5)}
          </span>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-5">
        <section className="p-5 rounded-2xl verse-border bg-verse-card/60">
          <header className="mb-4 flex items-baseline justify-between">
            <h2 className="font-serif text-lg text-verse-text">
              Most loved
            </h2>
            <Link
              href="/admin/quotes"
              className="font-sans text-xs text-verse-muted hover:text-verse-accent transition-colors"
            >
              See all →
            </Link>
          </header>
          <ul className="space-y-3">
            {stats.topQuotes.map((q) => (
              <li
                key={q.id}
                className="flex items-start justify-between gap-3 pb-3 border-b border-verse last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <Link
                    href={`/q/${q.id}`}
                    className="font-serif text-sm text-verse-text leading-snug line-clamp-2 hover:text-verse-accent"
                  >
                    “{q.text}”
                  </Link>
                  {q.author && (
                    <p className="font-sans text-[11px] text-verse-muted mt-1">
                      — {formatAuthorAttribution(q.author, q.authorCasing)}
                    </p>
                  )}
                </div>
                <div className="font-sans text-xs text-verse-accent shrink-0 flex items-center gap-1">
                  <Heart className="h-3 w-3" /> {q.likes}
                </div>
              </li>
            ))}
            {stats.topQuotes.length === 0 && (
              <li className="font-sans text-xs text-verse-muted">
                No quotes yet.
              </li>
            )}
          </ul>
        </section>

        <section className="p-5 rounded-2xl verse-border bg-verse-card/60">
          <header className="mb-4 flex items-baseline justify-between">
            <h2 className="font-serif text-lg text-verse-text">
              Just published
            </h2>
            <Link
              href="/admin/quotes"
              className="font-sans text-xs text-verse-muted hover:text-verse-accent transition-colors"
            >
              See all →
            </Link>
          </header>
          <ul className="space-y-3">
            {stats.recentQuotes.map((q) => (
              <li
                key={q.id}
                className="pb-3 border-b border-verse last:border-0 last:pb-0"
              >
                <Link
                  href={`/q/${q.id}`}
                  className="font-serif text-sm text-verse-text leading-snug line-clamp-2 hover:text-verse-accent block"
                >
                  “{q.text}”
                </Link>
                <p className="font-sans text-[11px] text-verse-muted mt-1">
                  {q.author
                    ? `— ${formatAuthorAttribution(q.author, q.authorCasing)} · `
                    : ""}
                  {new Date(q.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
            {stats.recentQuotes.length === 0 && (
              <li className="font-sans text-xs text-verse-muted">
                No quotes yet.
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
