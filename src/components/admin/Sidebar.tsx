'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, FileEdit, Package, FileText, Stamp, Mail, Building2, LogOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/content', label: 'Content', icon: FileEdit },
  { href: '/admin/shipments', label: 'Shipments', icon: Package },
  { href: '/admin/documents', label: 'Documents', icon: FileText },
  { href: '/admin/assets', label: 'Assets', icon: Stamp },
  { href: '/admin/company', label: 'Company', icon: Building2 },
  { href: '/admin/emails', label: 'Emails', icon: Mail },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    router.push('/admin/login');
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-border bg-bg-elev/60 backdrop-blur-xl">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <Image src="/img/logo.png" alt="CTL" width={34} height={34} className="rounded" />
        <div className="leading-tight">
          <div className="text-sm font-semibold text-fg">CTL Admin</div>
          <div className="text-[11px] text-fg-subtle">Control Panel</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-accent/10 text-accent border border-accent/30'
                  : 'text-fg-muted hover:text-fg hover:bg-white/5 border border-transparent'
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-fg-muted transition-all hover:bg-red-950/40 hover:text-red-300"
        >
          <LogOut size={17} />
          Log out
        </button>
      </div>
    </aside>
  );
}
