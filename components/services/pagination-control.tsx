"use client"

import {usePathname, useSearchParams} from "next/navigation";
import {
  Pagination,
  PaginationContent, PaginationEllipsis,
  PaginationItem,
  PaginationLink, PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
}

export function PaginationControl({
                                    currentPage,
                                    totalPages,
                                  }: PaginationControlProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams()

  const getPageLink = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  }

  return (
    <Pagination>
      <PaginationContent>
        {currentPage > 1 && (
          <>
            <PaginationItem>
              <PaginationPrevious href={getPageLink(currentPage - 1)}/>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href={getPageLink(currentPage - 1)}>{currentPage - 1}</PaginationLink>
            </PaginationItem>
          </>
        )}
        <PaginationItem>
          <PaginationLink href={getPageLink(currentPage)} isActive={true}>{currentPage}</PaginationLink>
        </PaginationItem>
        {currentPage !== totalPages && (
          <>
            <PaginationItem>
              <PaginationLink href={getPageLink(currentPage + 1)}>{currentPage + 1}</PaginationLink>
            </PaginationItem>
            {currentPage + 1 < totalPages && (
              <PaginationItem>
                <PaginationEllipsis/>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext href={getPageLink(currentPage + 1)}/>
            </PaginationItem>
          </>
        )}
      </PaginationContent>
    </Pagination>
  );
}