// src/components/Atoms/LoadingSpinner/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export const LoadingSpinner = ({ size = "medium", className = "" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    small: "h-4 w-4 border-2",
    medium: "h-6 w-6 border-2",
    large: "h-8 w-8 border-4",
  };

  return (
    <div
      className={`animate-spin rounded-full border-t-2 border-blue-500 ${sizeClasses[size]} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
