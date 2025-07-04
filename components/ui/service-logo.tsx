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
  const finalClassName = cn("h-16 w-16",className)
  return (
    <>
      {image && !fetching ? (
        <div className={cn(finalClassName, "rounded overflow-hidden")}>
          <Image src={image} alt="Logo preview" width={width} height={height}/>
        </div>
      ) : fetching ? (
        <Skeleton className={cn(finalClassName, "bg-muted rounded flex items-center justify-center")}>
        </Skeleton>
      ) : (
        <div className={cn(finalClassName, "bg-muted rounded flex items-center justify-center")}>
          <span className="text-sm font-bold">{placeholder || '?'}</span>
        </div>
      )}
    </>
  )
}