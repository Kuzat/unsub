"use client"

import {useRouter, usePathname} from "next/navigation";
import {Pagination} from "@/components/ui/pagination";

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
}

export function PaginationControl({
  currentPage,
  totalPages,
}: PaginationControlProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };
  
  return (
    <Pagination 
      currentPage={currentPage} 
      totalPages={totalPages} 
      onPageChange={handlePageChange} 
    />
  );
}