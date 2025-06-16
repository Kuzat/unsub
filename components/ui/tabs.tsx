'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {cn} from "@/lib/utils";
import {ClassValue} from "clsx";

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


export type TabsType = {
  name: string;
  href: string;
}[]

export default function Tabs({tabs, classNames}: { tabs: TabsType, classNames?: string }) {
  const pathname = usePathname();

  return (
    <nav
      role="tablist"
      aria-label="Tabs sections"
      className={cn(
        "inline-flex h-9 items-center gap-1 rounded-lg bg-secondary p-1 text-secondary-foreground no-scrollbar overflow-auto w-full md:w-fit",
        classNames
      )}
    >
      {tabs.map((tab) => (
          <TabLink
            key={tab.href}
            href={tab.href}
            isActive={pathname === tab.href}
          >
            {tab.name}
          </TabLink>
        )
      )
      }
    </nav>
  );
}
