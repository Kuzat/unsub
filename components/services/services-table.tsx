"use client"
import {Service} from "@/app/actions/services";
import {columns} from "@/app/(dashboard)/services/columns";
import {DataTable} from "@/components/ui/data-table";

interface ServicesTableProps {
  data: Service[];
  isAdmin: boolean;
}

export function ServicesTable({data, isAdmin}: ServicesTableProps) {
  const tableColumns = columns(isAdmin)

  return (
    <div className="rounded-md border">
      <DataTable columns={tableColumns} data={data}/>
    </div>
  )
}