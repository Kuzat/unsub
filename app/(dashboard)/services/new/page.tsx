import NewServiceForm from "@/components/services/new-service-form"
import {isAdmin, requireSession} from "@/lib/auth";
import Link from "next/link";
import {ArrowLeftIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import * as React from "react";

export default async function NewServicePage() {
  const session = await requireSession();

  return (
    <div className="mx-auto max-w-3xl w-full p-6">
      <h1 className="mb-6 text-2xl font-bold">New Service</h1>
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/services">
          <ArrowLeftIcon className="mr-2 h-4 w-4"/>
          Back to Services
        </Link>
      </Button>
      <NewServiceForm isAdmin={isAdmin(session)} />
    </div>
  );
}