import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import PullToRefresh from "@/components/PullToRefresh";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <PullToRefresh />
      <Navbar />
      {children}
      {/* Spacer so the floating BottomNav never crops the last bit of
          content on mobile. Accounts for the safe-area inset + nav height. */}
      <div
        aria-hidden
        className="md:hidden"
        style={{ height: "calc(env(safe-area-inset-bottom, 0px) + 6rem)" }}
      />
      <Footer />
      <BottomNav />
    </Providers>
  );
}
