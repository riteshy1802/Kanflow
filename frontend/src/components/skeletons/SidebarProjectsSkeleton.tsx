import { Skeleton } from "@/components/ui/skeleton";

interface BoardsSkeletonProps {
  count?: number;
}

const SidebarProjectsSkeleton: React.FC<BoardsSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-1 mt-1">
        <Skeleton className="h-8 w-full rounded-md bg-gray-600/50"/>
        {Array.from({ length: count }).map((_, idx) => (
            <div key={idx} className="w-full flex items-center gap-2">
            <div className="w-full flex items-center gap-2">
                    <p className="text-white">-</p>
                    <Skeleton className="h-7 w-[90%] rounded-md bg-gray-600/50" />
                </div>
            </div>
        ))}
    </div>
  );
};

export default SidebarProjectsSkeleton;
