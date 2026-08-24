import { Sidebar } from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell min-h-screen">
      <Sidebar />
      <main className="ml-60 min-h-screen p-8">{children}</main>
    </div>
  );
}
