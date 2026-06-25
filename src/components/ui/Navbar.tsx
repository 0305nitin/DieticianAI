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
    <nav className="sticky top-0 z-50 h-16 flex items-center
      border-b border-slate-200 dark:border-white/[0.06]
      bg-white/80 dark:bg-slate-950/80
      backdrop-blur-xl">
      <div className="max-w-6xl mx-auto w-full px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
            Hawker<span className="gradient-text">Sense</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
          <div className="ml-1">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
