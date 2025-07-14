"use server"
import {requireAdmin} from "@/lib/auth";
import {fetchPendingGuideVersions, fetchRejectedGuideVersions} from "@/app/actions/guides";
import {ClientGuideReviewTable} from "@/components/admin/client-guide-review-table";

export default async function AdminGuidesPage() {
  // Check if user is admin and fetch data server-side
  await requireAdmin();
  const pendingGuideVersions = await fetchPendingGuideVersions();
  const rejectedGuideVersions = await fetchRejectedGuideVersions();

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Guide Reviews</h1>
      </div>
      <ClientGuideReviewTable 
        pendingData={pendingGuideVersions}
        rejectedData={rejectedGuideVersions}
      />
    </div>
  )
}
