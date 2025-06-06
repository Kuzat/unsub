"use server"

import Link from "next/link";
import Image from "next/image";
import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import {Button} from "../ui/button";

export default async function Header() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return (
    <header className="flex items-center justify-between px-10 py-6">
      <Link href="/" className="flex items-center gap-2">
        {/* Logo lives in /public as unsub.svg */}
        <Image
          src="/unsub.svg"
          alt="unsub logo"
          width={130}
          height={32}
          priority
          className="aspect-square size-16 rounded-lg"
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
        <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
          <Button>
            Dashboard
          </Button>
        </Link>
      ) : (
        <Link href="/login" className="text-gray-700 hover:text-gray-900">
          <Button>
            Login
          </Button>
        </Link>
      )}
    </header>
  );
}
