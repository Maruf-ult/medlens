
import { cn } from "@/lib/utils";


interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "muted";
  className?: string;
}


const sizeStyles = {
  xs: "w-3 h-3 border",
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-2",
  xl: "w-12 h-12 border-4",
};


const colorStyles = {
  primary: "border-primary-200 border-t-primary-500",
  white:   "border-white/30 border-t-white",
  muted:   "border-surface-200 border-t-surface-500 dark:border-surface-700 dark:border-t-surface-400",
};


export function Spinner({
  size = "md",
  color = "primary",
  className,
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "rounded-full animate-spin",
        sizeStyles[size],
        colorStyles[color],
        className
      )}
    />
  );
}


interface SpinnerWithMessageProps {
  message?: string;
  submessage?: string;
  size?: SpinnerProps["size"];
  className?: string;
}

export function SpinnerWithMessage({
  message = "Loading...",
  submessage,
  size = "lg",
  className,
}: SpinnerWithMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        "py-12",
        className
      )}
    >
      <Spinner size={size} />
      <div className="text-center">
        <p className="text-sm font-medium text-surface-600 dark:text-surface-400">
          {message}
        </p>
        {submessage && (
          <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">
            {submessage}
          </p>
        )}
      </div>
    </div>
  );
}


interface PageSpinnerProps {
  message?: string;
}

export function PageSpinner({ message = "Loading..." }: PageSpinnerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center animate-pulse-slow">
            <span className="text-2xl">🔬</span>
          </div>
          <div className="absolute -inset-1 rounded-2xl border-2 border-primary-500/30 animate-ping" />
        </div>
        <p className="text-sm font-medium text-surface-600 dark:text-surface-400">
          {message}
        </p>
      </div>
    </div>
  );
}



interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "shimmer rounded-md",
        "bg-surface-200 dark:bg-surface-700",
        className
      )}
    />
  );
}


export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5",
        "bg-white dark:bg-surface-800",
        "border-surface-200 dark:border-surface-700",
        className
      )}
    >
   
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      <SkeletonText lines={3} />


      <div className="mt-4 flex gap-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}


export function SkeletonAnalysis() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-xl border p-5 bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <SkeletonText lines={2} />
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}


export default Spinner;