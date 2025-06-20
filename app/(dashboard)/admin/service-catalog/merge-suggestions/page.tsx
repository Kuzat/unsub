import {requireAdmin} from "@/lib/auth";

export default async function MergeSuggestionsPage() {
  await requireAdmin();

  return (
    <div>
      <h1>Merge suggestions</h1>
      <p>Feature coming soon...</p>
    </div>
  );
}