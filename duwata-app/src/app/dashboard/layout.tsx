import { TeamSidebar } from "@/frontend/components/layout/TeamSidebar";
import { SidebarShell } from "@/frontend/components/layout/SidebarShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarShell sidebar={<TeamSidebar />} brand="DuwaTa">
      {children}
    </SidebarShell>
  );
}
