"use server"
import {requireAdmin} from "@/lib/auth";
import {columns} from "@/app/(dashboard)/admin/guides/columns";
import {fetchPendingGuideVersions} from "@/app/actions/guides";
import {ClientGuideReviewTable} from "@/components/admin/client-guide-review-table";

export default async function AdminGuidesPage() {
  // Check if user is admin and fetch data server-side
  await requireAdmin();
  const pendingGuideVersions = await fetchPendingGuideVersions();

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pending Guide Reviews</h1>
      </div>
      {pendingGuideVersions.length === 0 ? (
        <p className="text-muted-foreground text-center py-6">
          There are no pending guide versions to review.
        </p>
      ) : (
        <ClientGuideReviewTable 
          columns={columns} 
          initialData={pendingGuideVersions} 
        />
      )}
    </div>
  )
}
