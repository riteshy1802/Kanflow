"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Filter } from "lucide-react"

interface FilterDropdownProps {
  filters: {
    severity: string
    createdBy: string
    searchTitle: string
    timeframe: string
    sortBy: string
  }
  onFiltersChange: (filters: any) => void
}

export function FilterDropdown({ filters, onFiltersChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-[0.8rem] cursor-pointer text-gray-400 hover:text-gray-200 hover:bg-gray-700">
          <Filter size={8}/>
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-gray-800 border-gray-700">
        <DropdownMenuLabel className="text-gray-100">Filters</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />

        <div className="p-3 space-y-4">
          {/* Search at top */}
          <div>
            <label className="text-xs font-medium text-gray-400 mb-2 block">Search Title</label>
            <Input
              value={filters.searchTitle}
              onChange={(e) => handleFilterChange("searchTitle", e.target.value)}
              placeholder="Search tasks..."
              className="h-8 bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400"
            />
          </div>

          {/* Filters in horizontal layout */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-400 mb-2 block">Severity</label>
              <div className="space-y-1">
                {["all", "low", "medium", "high"].map((severity) => (
                  <DropdownMenuItem
                    key={severity}
                    onClick={() => handleFilterChange("severity", severity)}
                    className={`text-xs text-gray-200 hover:bg-gray-700 ${filters.severity === severity ? "bg-gray-700" : ""}`}
                  >
                    {severity === "all" ? "All" : severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </DropdownMenuItem>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-2 block">Created By</label>
              <div className="space-y-1">
                {["all", "me", "others"].map((creator) => (
                  <DropdownMenuItem
                    key={creator}
                    onClick={() => handleFilterChange("createdBy", creator)}
                    className={`text-xs text-gray-200 hover:bg-gray-700 ${filters.createdBy === creator ? "bg-gray-700" : ""}`}
                  >
                    {creator === "all" ? "All" : creator === "me" ? "Me" : "Others"}
                  </DropdownMenuItem>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-2 block">Time Frame</label>
              <div className="space-y-1">
                {["all", "week", "month"].map((timeframe) => (
                  <DropdownMenuItem
                    key={timeframe}
                    onClick={() => handleFilterChange("timeframe", timeframe)}
                    className={`text-xs text-gray-200 hover:bg-gray-700 ${filters.timeframe === timeframe ? "bg-gray-700" : ""}`}
                  >
                    {timeframe === "all" ? "All" : timeframe === "week" ? "Week" : "Month"}
                  </DropdownMenuItem>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-2 block">Sort By</label>
              <div className="space-y-1">
                {["lastUpdated", "created", "priority"].map((sort) => (
                  <DropdownMenuItem
                    key={sort}
                    onClick={() => handleFilterChange("sortBy", sort)}
                    className={`text-xs text-gray-200 hover:bg-gray-700 ${filters.sortBy === sort ? "bg-gray-700" : ""}`}
                  >
                    {sort === "lastUpdated" ? "Updated" : sort === "created" ? "Created" : "Priority"}
                  </DropdownMenuItem>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
