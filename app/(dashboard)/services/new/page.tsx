import NewServiceForm from "@/components/services/new-service-form"
import {isAdmin, requireSession} from "@/lib/auth";

export default async function NewServicePage() {
  const session = await requireSession();

  return (
    <div className="mx-auto max-w-3xl w-full p-6">
      <h1 className="mb-6 text-2xl font-bold">New Service</h1>
      <NewServiceForm isAdmin={isAdmin(session)} />
    </div>
  );
}