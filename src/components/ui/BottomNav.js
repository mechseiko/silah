'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, UsersIcon, MessageCircleIcon, UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/home',    icon: HomeIcon,          label: 'Home' },
  { href: '/circle',  icon: UsersIcon,         label: 'Circle' },
  { href: '/chat',    icon: MessageCircleIcon,  label: 'Chat' },
  { href: '/profile', icon: UserIcon,           label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-ink-100 z-50 safe-area-inset-bottom">
      <div className="max-w-lg mx-auto flex">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 transition-colors',
                active ? 'text-primary-600' : 'text-ink-400 hover:text-ink-600',
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={cn('text-xs', active ? 'font-medium' : 'font-normal')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
