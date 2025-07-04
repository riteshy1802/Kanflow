"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, RotateCcw } from "lucide-react";
import { Input } from "./ui/input";

interface FilterDropdownProps {
  filters: {
    severity: string;
    createdBy: string;
    searchTitle: string;
    sortBy: string;
  };
  setIsOpen: (val:boolean) => void;
  onFiltersChange: (filters: any) => void;
}

export function FilterDropdown({
  filters,
  onFiltersChange,
  setIsOpen,
}: FilterDropdownProps) {
  const defaultFilters = {
    severity: "all",
    createdBy: "all",
    searchTitle: "",
    sortBy: "lastUpdated",
  };

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const changeToDefault = () => {
    onFiltersChange(defaultFilters);
  };

  const hasChanged =
    JSON.stringify(defaultFilters) !== JSON.stringify(filters);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="relative">
            {hasChanged && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-600 rounded-full border border-gray-900" />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={()=>setIsOpen(true)}
              className="gap-2 cursor-pointer border border-gray-600 text-[0.8rem] text-gray-400 hover:text-gray-200 hover:bg-gray-700"
            >
              <Filter size={12} />
              Filter
            </Button>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-80 bg-gray-800 border border-gray-700"
        >
          <div className="flex items-center justify-between px-3 pt-2">
            <DropdownMenuLabel className="text-gray-100 p-0">
              Filters
            </DropdownMenuLabel>
            <div
              onClick={changeToDefault}
              title="Reset filters"
              className="p-2 hover:bg-gray-600/30 cursor-pointer rounded-full transition-transform duration-200 active:rotate-[-90deg]"
            >
              <RotateCcw className="text-white" size={14} />
            </div>
          </div>

          <DropdownMenuSeparator className="bg-gray-700" />

          <div className="p-3 space-y-4">
            {/* Search Title */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-2 block">
                Search Title
              </label>
              <Input
                value={filters.searchTitle}
                onChange={(e) =>
                  handleFilterChange("searchTitle", e.target.value)
                }
                placeholder="Search tasks..."
                className="h-8 bg-gray-700/50 border border-gray-600 text-gray-100 placeholder-gray-400"
              />
            </div>

            {/* Filter Options */}
            <div className="grid grid-cols-2 gap-4">
              {/* Severity */}
              <div>
                <label className="text-xs font-medium text-gray-400 mb-2 block">
                  Severity
                </label>
                <div className="space-y-1">
                  {["all", "low", "medium", "high"].map((severity) => (
                    <DropdownMenuItem
                      key={severity}
                      onSelect={(e) => e.preventDefault()}
                      onClick={() =>
                        handleFilterChange("severity", severity)
                      }
                      className={`text-xs text-gray-200 cursor-pointer hover:bg-gray-700 ${
                        filters.severity === severity ? "bg-gray-700" : ""
                      }`}
                    >
                      {severity === "all"
                        ? "All"
                        : severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>

              {/* Created By */}
              <div>
                <label className="text-xs font-medium text-gray-400 mb-2 block">
                  Created By
                </label>
                <div className="space-y-1">
                  {["all", "me", "others"].map((creator) => (
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      key={creator}
                      onClick={() =>
                        handleFilterChange("createdBy", creator)
                      }
                      className={`text-xs text-gray-200 cursor-pointer hover:bg-gray-700 ${
                        filters.createdBy === creator ? "bg-gray-700" : ""
                      }`}
                    >
                      {creator === "all"
                        ? "All"
                        : creator === "me"
                        ? "Me"
                        : "Others"}
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-400 mb-2 block">
                  Sort By
                </label>
                <div className="space-y-1">
                  {["lastUpdated", "created", "priority"].map((sort) => (
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      key={sort}
                      onClick={() => handleFilterChange("sortBy", sort)}
                      className={`text-xs text-gray-200 cursor-pointer hover:bg-gray-700 ${
                        filters.sortBy === sort ? "bg-gray-700" : ""
                      }`}
                    >
                      {sort === "lastUpdated"
                        ? "Updated"
                        : sort === "created"
                        ? "Created"
                        : "Priority"}
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
