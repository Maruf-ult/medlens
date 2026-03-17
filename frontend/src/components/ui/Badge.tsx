import { cn } from "@/lib/utils";
import type { Finding } from "@/types";

interface BadgeProps {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantStyles = {
  default: "bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-300",
  primary: "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300 border border-primary-200 dark:border-primary-800",
  success: "bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-300 border border-success-200 dark:border-success-800",
  warning: "bg-warning-50 text-warning-700 dark:bg-warning-950 dark:text-warning-300 border border-warning-200 dark:border-warning-800",
  danger: "bg-danger-50 text-danger-700 dark:bg-danger-950 dark:text-danger-300 border border-danger-200 dark:border-danger-800",
  outline: "bg-transparent text-surface-600 border border-surface-300 dark:text-surface-400 dark:border-surface-600",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
};

const dotColors = {
  default: "bg-surface-400",
  primary: "bg-primary-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  outline: "bg-surface-400",
};

export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "font-medium rounded-full",
        "whitespace-nowrap",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}

// --- Severity Badge (Fixed the crash issue) ---

interface SeverityBadgeProps {
  severity: Finding["severity"] | string; // Allow string to handle unexpected API values
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SeverityBadge({
  severity,
  showIcon = true,
  size = "md",
  className,
}: SeverityBadgeProps) {
  const config = {
    normal: { variant: "success" as const, label: "Normal", icon: "✅" },
    warning: { variant: "warning" as const, label: "Attention", icon: "⚠️" },
    critical: { variant: "danger" as const, label: "Critical", icon: "🚨" },
  };

  // Convert to lowercase to handle "Normal" vs "normal"
  const safeKey = (severity?.toLowerCase() || "normal") as keyof typeof config;
  
  // Defensive check: If key doesn't exist in config, default to 'normal'
  const activeConfig = config[safeKey] || config.normal;

  return (
    <Badge variant={activeConfig.variant} size={size} className={className}>
      {showIcon && <span>{activeConfig.icon}</span>}
      {activeConfig.label}
    </Badge>
  );
}

// --- Urgency Badge ---

interface UrgencyBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UrgencyBadge({
  score,
  showLabel = true,
  size = "md",
  className,
}: UrgencyBadgeProps) {
  // Logic to determine visual state based on score
  const getMetadata = () => {
    if (score <= 3) return { variant: "success" as const, icon: "🟢", label: score <= 2 ? "All Normal" : "Minor Concerns" };
    if (score <= 6) return { variant: "warning" as const, icon: "🟡", label: "Attention Needed" };
    if (score <= 8) return { variant: "danger" as const, icon: "🔴", label: "Urgent Review" };
    return { variant: "danger" as const, icon: "🚨", label: "Critical" };
  };

  const { variant, icon, label } = getMetadata();

  return (
    <Badge variant={variant} size={size} className={className}>
      <span>{icon}</span>
      <span className="font-bold">{score}/10</span>
      {showLabel && <span>{label}</span>}
    </Badge>
  );
}

// --- Dataset Badge ---

interface DatasetBadgeProps {
  source: string;
  className?: string;
}

export function DatasetBadge({ source, className }: DatasetBadgeProps) {
  const config: Record<string, { label: string; icon: string }> = {
    mtsamples: { label: "MTSamples", icon: "🏥" },
    medquad: { label: "MedQuAD", icon: "💬" },
    pmcpatients: { label: "PMC-Patients", icon: "🔬" },
    mimic: { label: "MIMIC-IV", icon: "🏨" },
  };

  // Safe lookup with fallback
  const sourceKey = source?.toLowerCase();
  const data = config[sourceKey] || { label: source, icon: "📋" };

  return (
    <Badge variant="primary" size="sm" className={className}>
      <span>{data.icon}</span>
      {data.label}
    </Badge>
  );
}

export default Badge;