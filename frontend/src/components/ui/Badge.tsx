import { cn } from "@/lib/utils";
import type { Finding } from "@/types";

interface BadgeProps{
     variant?:
     |"default"
     |"primary"
     |"success"
     |"warning"
     |"danger"
     |"outline";
     size?:"sm"|"md"|"lg";
     dot?:boolean;
     className?:string;
     children:React.ReactNode;
}


const variantStyles = {
  default: cn(
    "bg-surface-100 text-surface-700",
    "dark:bg-surface-700 dark:text-surface-300"
  ),
  primary: cn(
    "bg-primary-50 text-primary-700",
    "dark:bg-primary-950 dark:text-primary-300",
    "border border-primary-200 dark:border-primary-800"
  ),
  success: cn(
    "bg-success-50 text-success-700",
    "dark:bg-success-950 dark:text-success-300",
    "border border-success-200 dark:border-success-800"
  ),
  warning: cn(
    "bg-warning-50 text-warning-700",
    "dark:bg-warning-950 dark:text-warning-300",
    "border border-warning-200 dark:border-warning-800"
  ),
  danger: cn(
    "bg-danger-50 text-danger-700",
    "dark:bg-danger-950 dark:text-danger-300",
    "border border-danger-200 dark:border-danger-800"
  ),
  outline: cn(
    "bg-transparent text-surface-600",
    "border border-surface-300",
    "dark:text-surface-400 dark:border-surface-600"
  ),
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
  danger:  "bg-danger-500",
  outline: "bg-surface-400",
};


export function Badge({variant="default",
     size="md",
     dot=false,
     className,
     children,
}:BadgeProps){
     return(
          <span
          className={cn("inline-flex items-center gap-1.5","font-medium rounded-full","whitespace-nowrap",
               variantStyles[variant],
               sizeStyles[size],
               className
          )}
          >
               {dot && (
                    <span
                    className={cn("w-1.5 h-1.5 rounded-full shrink-0",dotColors[variant])}
                    />
               )}
               {children}
               
          </span>
     )
}

interface SeverityBadgeProps {
  severity: Finding["severity"];
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
    normal: {
      variant: "success" as const,
      label: "Normal",
      icon: "✅",
    },
    warning: {
      variant: "warning" as const,
      label: "Attention",
      icon: "⚠️",
    },
    critical: {
      variant: "danger" as const,
      label: "Critical",
      icon: "🚨",
    },
  };

  const { variant, label, icon } = config[severity];

  return (
    <Badge variant={variant} size={size} className={className}>
      {showIcon && <span>{icon}</span>}
      {label}
    </Badge>
  );
}

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

  const getVariant = () => {
    if (score <= 3) return "success" as const;
    if (score <= 6) return "warning" as const;
    return "danger" as const;
  };

  const getIcon = () => {
    if (score <= 3) return "🟢";
    if (score <= 6) return "🟡";
    return "🔴";
  };

  const getLabel = () => {
    if (score <= 2) return "All Normal";
    if (score <= 4) return "Minor Concerns";
    if (score <= 6) return "Attention Needed";
    if (score <= 8) return "Urgent Review";
    return "Critical";
  };

  return (
    <Badge variant={getVariant()} size={size} className={className}>
      <span>{getIcon()}</span>
      <span className="font-bold">{score}/10</span>
      {showLabel && <span>{getLabel()}</span>}
    </Badge>
  );
}

interface DatasetBadgeProps {
  source: string;
  className?: string;
}

export function DatasetBadge({ source, className }: DatasetBadgeProps) {
  const config: Record<string, { label: string; icon: string }> = {
    mtsamples:   { label: "MTSamples",    icon: "🏥" },
    medquad:     { label: "MedQuAD",      icon: "💬" },
    pmcpatients: { label: "PMC-Patients", icon: "🔬" },
    mimic:       { label: "MIMIC-IV",     icon: "🏨" },
  };

  const { label, icon } = config[source] ?? {
    label: source,
    icon: "📋",
  };

  return (
    <Badge variant="primary" size="sm" className={className}>
      <span>{icon}</span>
      {label}
    </Badge>
  );
}


export default Badge;