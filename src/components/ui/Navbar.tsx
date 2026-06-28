'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, LayoutDashboard, Zap, MapPin, ChefHat, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { cn } from '@/lib/utils';

const links = [
  { href: '/scan',      label: 'Scan',      icon: Camera         },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/nearby',    label: 'Nearby',    icon: MapPin          },
  { href: '/recipes',   label: 'Recipes',   icon: ChefHat         },
  { href: '/profile',   label: 'Profile',   icon: User            },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-50 h-14 flex items-center border-b"
      style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto w-full px-5 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)' }}>
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight" style={{ color: 'var(--text-1)' }}>
            DieticianAI
          </span>
        </Link>

        <div className="flex items-center gap-0.5 overflow-x-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors shrink-0',
                  active
                    ? 'text-white bg-[var(--accent)]'
                    : 'hover:bg-[var(--surface-2)]'
                )}
                style={{ color: active ? '#fff' : 'var(--text-2)' }}
              >
                <Icon size={14} />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
          <div className="ml-2 pl-2 border-l shrink-0" style={{ borderColor: 'var(--border)' }}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
