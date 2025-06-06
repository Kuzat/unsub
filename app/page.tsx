/* app/page.tsx */
import Image from "next/image";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import Header from "@/components/landing/header";

export default async function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
      {/* ---------- Header ---------- */}
      <Header/>

      {/* ---------- Hero ---------- */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center gap-10">
        <h1 className="text-4xl sm:text-6xl font-bold max-w-4xl tracking-tight">
          Stop paying for subscriptions you don’t use.
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg sm:text-xl">
          <strong>unsub</strong> tracks your recurring charges and reminds you
          before they renew — so you can cancel in one click and save up to
          €500 a year.
        </p>
        <Link href="/register">
          <Button size="lg" className="px-8 py-6 text-base sm:text-lg">
            Get started – it’s free
          </Button>
        </Link>
      </main>

      {/* ---------- Features ---------- */}
      <section id="features" className="bg-muted/50 py-20">
        <div className="container mx-auto px-6 grid gap-12 md:grid-cols-3">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Track everything in one place
            </h2>
            <p className="text-muted-foreground">
              Add any subscription manually or (coming soon) connect your bank
              to pull them in automatically.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Never miss a renewal
            </h2>
            <p className="text-muted-foreground">
              Calendar & push reminders land 3 days before every charge so you
              have time to decide.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Community-verified cancel guides
            </h2>
            <p className="text-muted-foreground">
              Step-by-step instructions for the trickiest services, kept fresh
              by quick “Was this correct?” votes.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Pricing ---------- */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-6 flex flex-col items-center gap-8 text-center">
          <h2 className="text-3xl font-bold">Free while in beta</h2>
          <p className="text-muted-foreground max-w-2xl">
            The core tracking and reminder features are 100 % free. Later, upgrade for automatic bank import for a
            one-time fee.
          </p>
          <Link href="/register">
            <Button size="lg" className="px-8 py-6 text-base sm:text-lg">
              Get started - it’s free
            </Button>
          </Link>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t py-10 px-6 text-sm text-muted-foreground flex flex-col sm:flex-row justify-between">
        <p>&copy; {new Date().getFullYear()} unsub.cash</p>
        <p>
          Built by humans in Europe —
          <Link href="mailto:hello@unsub.cash" className="underline ml-1">
            Contact us
          </Link>
        </p>
      </footer>
    </div>
  );
}
