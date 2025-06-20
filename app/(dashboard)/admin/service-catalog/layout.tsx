import Tabs from "@/components/ui/tabs";
import {requireAdmin} from "@/lib/auth";

export default async function ServiceCatalogLayout({children}: { children: React.ReactNode }) {
  await requireAdmin();

  const serviceCatalogTabs = [
    {name: "Services", href: "/admin/service-catalog"},
    {name: "Merge Suggestions", href: "/admin/service-catalog/merge-suggestions"}
  ]

  return (
    <>
      <Tabs tabs={serviceCatalogTabs} classNames="mt-10" />
      <div className="mt-2">
        {children}
      </div>
    </>
  )
}
