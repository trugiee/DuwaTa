import { AdminSidebar } from "@/frontend/components/layout/AdminSidebar";
import { SidebarShell } from "@/frontend/components/layout/SidebarShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarShell sidebar={<AdminSidebar />} brand="DuwaTa Admin">
      {children}
    </SidebarShell>
  );
}
