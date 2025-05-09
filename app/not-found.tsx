import Link from "next/link"
import {ChevronLeft} from "lucide-react"

import {Button} from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 animate-fadeIn">
      <div className="flex max-w-sm flex-col gap-4 text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">
          We couldn&apos;t find the page you were looking for. It might have been
          removed, renamed, or doesn&apos;t exist.
        </p>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ChevronLeft className="size-4"/>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}