import { NavBar } from "@/components/ui/NavBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      {/* Content area: offset for sidebar on md+, offset for bottom nav on mobile */}
      <main className="md:ml-56 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
