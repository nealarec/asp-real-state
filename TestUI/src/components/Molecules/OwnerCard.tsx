import { Link } from "react-router-dom";
import type { Owner } from "@/schemas/Owner";
import { cn } from "@/lib/utils";

interface OwnerCardProps {
  owner: Owner;
  className?: string;
}

export function OwnerCard({ owner, className }: OwnerCardProps) {
  return (
    <Link
      to={`/owners/${owner.id}`}
      className={cn(
        "block p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white",
        className
      )}
    >
      <div className="flex items-center">
        {owner.photo ? (
          <img
            src={owner.photo}
            alt={owner.name}
            className="w-16 h-16 rounded-full object-cover"
            onError={e => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const initials = owner.name
                .split(" ")
                .map(n => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2);

              const fallback = document.createElement("div");
              fallback.className =
                "w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-semibold";
              fallback.textContent = initials;
              target.parentNode?.insertBefore(fallback, target);
            }}
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-semibold">
            {owner.name
              .split(" ")
              .map(n => n[0])
              .join("")
              .toUpperCase()
              .substring(0, 2)}
          </div>
        )}
        <div className="ml-4">
          <h2 className="text-lg font-semibold text-gray-900">{owner.name}</h2>
          <p className="text-sm text-gray-600">{owner.address}</p>
        </div>
      </div>
    </Link>
  );
}

export function OwnerCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <div className="flex items-center">
        <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="ml-4 space-y-2 flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
