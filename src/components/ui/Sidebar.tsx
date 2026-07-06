'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, LayoutDashboard, Zap, MapPin, ChefHat, User,
  History, TrendingUp, Sparkles, Menu, X,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import FreemiumBadge from './FreemiumBadge';
import { cn } from '@/lib/utils';

const links = [
  { href: '/scan',      label: 'Scan',      icon: Camera          },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/history',   label: 'History',   icon: History         },
  { href: '/insights',  label: 'Insights',  icon: TrendingUp      },
  { href: '/ask',       label: 'Ask AI',    icon: Sparkles        },
  { href: '/nearby',    label: 'Nearby',    icon: MapPin          },
  { href: '/recipes',   label: 'Recipes',   icon: ChefHat         },
  { href: '/profile',   label: 'Profile',   icon: User            },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link key={href} href={href} onClick={onNavigate}
            className={cn(
              'relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              active ? '' : 'hover:bg-[var(--surface-2)]'
            )}
            style={{
              background: active ? 'var(--surface-2)' : 'transparent',
              color: active ? 'var(--text-1)' : 'var(--text-2)',
            }}>
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full"
                style={{ background: 'var(--accent)' }} />
            )}
            <Icon size={17} style={{ color: active ? 'var(--accent)' : 'var(--text-3)' }} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'var(--accent)' }}>
        <Zap size={14} className="text-white" />
      </div>
      <span className="font-display font-semibold text-base tracking-tight" style={{ color: 'var(--text-1)' }}>
        DieticianAI
      </span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-60 flex-col border-r px-4 py-5"
        style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
        <div className="px-1 mb-6"><Wordmark /></div>
        <NavList />
        <div className="mt-auto pt-4 border-t flex items-center justify-between gap-2"
          style={{ borderColor: 'var(--border)' }}>
          <FreemiumBadge />
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-4 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
        <button onClick={() => setOpen(true)} aria-label="Open menu"
          className="w-9 h-9 -ml-1.5 rounded-lg flex items-center justify-center"
          style={{ color: 'var(--text-2)' }}>
          <Menu size={20} />
        </button>
        <Wordmark />
        <ThemeToggle />
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="md:hidden fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.45)' }}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="md:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r px-4 py-5"
              style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
              <div className="flex items-center justify-between mb-6 px-1">
                <Wordmark />
                <button onClick={() => setOpen(false)} aria-label="Close menu"
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ color: 'var(--text-2)' }}>
                  <X size={18} />
                </button>
              </div>
              <NavList onNavigate={() => setOpen(false)} />
              <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <FreemiumBadge />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
