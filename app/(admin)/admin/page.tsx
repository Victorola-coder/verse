import AdminDashboard from "@/components/admin/AdminDashboard";
import { getAdminStats } from "@/lib/services/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <main className="px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
      <header className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl text-verse-text font-light">
          Dashboard
        </h1>
        <p className="font-sans text-sm text-verse-muted mt-1">
          A quick look at what&rsquo;s happening on Verse.
        </p>
      </header>
      <AdminDashboard stats={stats} />
    </main>
  );
}
