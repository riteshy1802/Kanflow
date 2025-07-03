"use client"

import { AlertCircle, Calendar, Tag, User } from "lucide-react"
import { Skeleton } from "../ui/skeleton"

export function TaskDetailSkeleton() {
  return (
    <div
      className="fixed inset-y-0 right-0 w-2/5 border-l border-gray-700/20 slide-in-right z-50 flex flex-col shadow-2xl"
      style={{ width: "35%", backgroundColor: "#1A191C" }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700/20">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-8 w-[60%] border-gray-800 bg-gray-600/50"/>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 border-gray-800 bg-gray-600/50"/>
            <Skeleton className="h-8 w-8 border-gray-800 bg-gray-600/50"/>
          </div>
        </div>

        {/* Task Meta Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Assignees</span>
          </div>

          <div className="flex flex-wrap gap-1 ml-6">
            {[...Array(3)].map((_,i) => (
              <Skeleton key={i} className="h-8 w-30 border-gray-800 bg-gray-600/50"/>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Status</span>
            <Skeleton className="h-8 w-30 border-gray-800 bg-gray-600/50"/>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Due Date</span>
            <span className="text-sm text-gray-200 flex items-center gap-2"><Skeleton className="h-8 w-36 border-gray-800 bg-gray-600/50"/> | <Skeleton className="h-8 w-30 border-gray-800 bg-gray-600/50"/></span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Priority</span>
              <Skeleton className="h-8 w-40 border-gray-800 bg-gray-600/50"/>
            </div>
          </div>

          <div className="flex w-[100%] flex-col items-start gap-2">
            <div className="flex w-full items-center gap-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Tags</span>
                <div className="flex flex-wrap gap-1">
                    {[...Array(4)].map((_,i) => (
                      <Skeleton key={i} className="h-8 w-20 border-gray-800 bg-gray-600/50"/>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-3">
          <div className="border-b border-gray-700/20 mb-6">
            <button className="pb-2 border-b-2 border-[#5e00ff] text-[#5e00ff] font-semibold text-sm">
              Description
            </button>
          </div>

          <div className="space-y-4">
            <div className="prose prose-sm max-w-none space-y-2">
              <Skeleton className="h-5 w-full border-gray-800 bg-gray-600/50"/>
              <Skeleton className="h-5 w-full border-gray-800 bg-gray-600/50"/>
              <Skeleton className="h-5 w-full border-gray-800 bg-gray-600/50"/>
              <Skeleton className="h-5 w-full border-gray-800 bg-gray-600/50"/>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5 w-full">
        <Skeleton className="h-10 w-full border-gray-800 bg-gray-600/50"/>
      </div>
    </div>
  )
}