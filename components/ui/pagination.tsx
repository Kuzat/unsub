"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null
  }

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are fewer than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always include first page, last page, current page, and pages adjacent to current page
      const firstPage = 1
      const lastPage = totalPages
      
      // Add current page and adjacent pages
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pageNumbers.push(i)
      }
      
      // Add first and last pages
      if (!pageNumbers.includes(firstPage)) {
        pageNumbers.unshift(firstPage)
        // Add ellipsis if there's a gap
        if (pageNumbers[1] > firstPage + 1) {
          pageNumbers.splice(1, 0, -1) // -1 represents ellipsis
        }
      }
      
      if (!pageNumbers.includes(lastPage)) {
        pageNumbers.push(lastPage)
        // Add ellipsis if there's a gap
        if (pageNumbers[pageNumbers.length - 2] < lastPage - 1) {
          pageNumbers.splice(pageNumbers.length - 1, 0, -1) // -1 represents ellipsis
        }
      }
    }
    
    return pageNumbers
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        aria-label="First page"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {pageNumbers.map((pageNumber, index) => 
        pageNumber === -1 ? (
          <span key={`ellipsis-${index}`} className="px-2">...</span>
        ) : (
          <Button
            key={pageNumber}
            variant={currentPage === pageNumber ? "default" : "outline"}
            onClick={() => onPageChange(pageNumber)}
            aria-label={`Page ${pageNumber}`}
            aria-current={currentPage === pageNumber ? "page" : undefined}
          >
            {pageNumber}
          </Button>
        )
      )}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Last page"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  )
}