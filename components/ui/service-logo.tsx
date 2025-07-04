import Image from "next/image";
import {Skeleton} from "@/components/ui/skeleton";
import * as React from "react";
import {cn} from "@/lib/utils";

export type ServiceLogoProps = {
  image: string | null | undefined,
  fetching?: boolean,
  placeholder?: string
  width?: number,
  height?: number,
  className?: string,
}

export default function ServiceLogo({
                                      image,
                                      fetching,
                                      placeholder,
                                      width = 256,
                                      height = 256,
                                      className
                                    }: ServiceLogoProps) {
  if (!className) {
    className = ""
  }
  if (!className.includes("h-")) {
    className += " h-16"
  }
  if (!className.includes("w-")) {
    className += " w-16"
  }


  return (
    <>
      {image && !fetching ? (
        <div className={cn(className, "rounded overflow-hidden")}>
          <Image src={image} alt="Logo preview" width={width} height={height}/>
        </div>
      ) : fetching ? (
        <Skeleton className={cn(className, "bg-muted rounded flex items-center justify-center")}>
        </Skeleton>
      ) : (
        <div className={cn(className, "bg-muted rounded flex items-center justify-center")}>
          <span className="text-sm font-bold">{placeholder || '?'}</span>
        </div>
      )}
    </>
  )
}