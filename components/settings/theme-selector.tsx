"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Theme Preference</h3>
        <p className="text-sm text-muted-foreground">
          Choose your preferred theme for the application.
        </p>
      </div>
      <Select
        value={theme}
        onValueChange={(value) => setTheme(value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}