'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, LayoutDashboard, Zap } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { cn } from '@/lib/utils';

const links = [
  { href: '/scan', label: 'Scan', icon: Camera },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-50 h-14 flex items-center border-b"
      style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto w-full px-5 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)' }}>
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight" style={{ color: 'var(--text-1)' }}>
            DieticianAI
          </span>
        </Link>

        <div className="flex items-center gap-0.5">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  active
                    ? 'text-white bg-[var(--accent)]'
                    : 'hover:bg-[var(--surface-2)]'
                )}
                style={{ color: active ? '#fff' : 'var(--text-2)' }}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
          <div className="ml-2 pl-2 border-l" style={{ borderColor: 'var(--border)' }}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
