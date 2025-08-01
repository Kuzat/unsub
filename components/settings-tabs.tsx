'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

interface TabLinkProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}

const TabLink: React.FC<TabLinkProps> = ({href, isActive, children}) => {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={isActive}
      className={`
    inline-flex items-center justify-center whitespace-nowrap
    rounded-md px-2.5 py-1 text-sm font-medium
    transition-colors duration-150
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    ${
        isActive
          ? 'bg-background text-foreground'
          : 'text-secondary-foreground hover:bg-background/60 dark:hover:bg-background/40'
      }
  `}
    >
      {children}
    </Link>
  );
};

const tabs = [
  {name: 'General', href: '/settings'},
  {name: 'Account', href: '/settings/account'},
  {name: 'Notifications', href: '/settings/notifications'},
];

export default function SettingsTabs() {
  const pathname = usePathname();

  return (
    <nav
      role="tablist"
      aria-label="Settings sections"
      className="
    inline-flex h-9 items-center gap-1 rounded-lg
    bg-secondary p-1 text-secondary-foreground
    no-scrollbar overflow-auto w-full md:w-fit
  "
    >
      {tabs.map((tab) => (
        <TabLink
          key={tab.href}
          href={tab.href}
          isActive={pathname === tab.href}
        >
          {tab.name}
        </TabLink>
      ))}
    </nav>
  );
}
