"use server"

import Link from "next/link";
import Image from "next/image";
import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import {Button} from "../ui/button";
import UnsubLogo from "@/public/unsub.svg"

export default async function Header() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-6 bg-background/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
      <Link href="/" className="flex items-center gap-2">
        {/* Logo lives in /public as unsub.svg */}
        <Image
          src={UnsubLogo}
          alt="unsub logo"
          priority
          // The existing classes for the image are fine, let's keep them.
          // Adjusted size slightly for better fit if needed, but original was size-16
          className="size-10 lg:size-14 rounded-lg" // Example: Adjust size as needed
        />
      </Link>

      <nav className="hidden sm:flex gap-6 text-sm font-medium">
        <Link href="#features" className="hover:text-foreground/80">
          Features
        </Link>
        <Link href="#pricing" className="hover:text-foreground/80">
          Pricing
        </Link>
        <Link href="#guides" className="hover:text-foreground/80">
          Guides
        </Link>
      </nav>

      {session ? (
        <Link href="/dashboard">
          <Button>
            Dashboard
          </Button>
        </Link>
      ) : (
        <Link href="/login">
          <Button>
            Login
          </Button>
        </Link>
      )}
    </header>
  );
}