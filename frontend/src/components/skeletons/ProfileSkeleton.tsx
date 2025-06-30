import { Skeleton } from "@/components/ui/skeleton";

export function UserProfileSkeletion() {
  return (
    <div className="p-2 py-4 border-t border-gray-700/50 bg-[#161618]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full bg-gray-600/50" />
          <div className="flex-1 min-w-0 mr-2 space-y-1">
            <Skeleton className="h-3 w-[100px] rounded-md bg-gray-600/50" />
            <Skeleton className="h-2 w-[140px] rounded-md bg-gray-600/40" />
          </div>
        </div>
        <Skeleton className="h-6 w-6 rounded-md bg-gray-600/50" />
      </div>
    </div>
  );
}
