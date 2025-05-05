"use server"

import Link from "next/link";
import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import {Button} from "../ui/button";

export default async function Header() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return (
    <header className="flex items-center justify-between p-4">
      <h1 className="text-2xl font-bold">Unsub</h1>
      <nav className="flex space-x-4">
        {/* Add login go to the dashboard button on the right most side*/}
        <div className="justify-self-end">
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
        </div>
      </nav>
    </header>
  );
}