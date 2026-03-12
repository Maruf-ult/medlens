
import { cn } from "@/lib/utils";
import { useState } from "react";


interface AlertProps {

  variant?: "error" | "warning" | "success" | "info";
  title?: string;
  message: string;
  details?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantConfig = {
  error: {
    containerClass: cn(
      "bg-danger-50 border-danger-200 text-danger-800",
      "dark:bg-danger-950 dark:border-danger-800 dark:text-danger-200"
    ),
    iconClass: "text-danger-500 dark:text-danger-400",
    icon: "🚨",
    defaultTitle: "Error",
  },
  warning: {
    containerClass: cn(
      "bg-warning-50 border-warning-200 text-warning-800",
      "dark:bg-warning-950 dark:border-warning-800 dark:text-warning-200"
    ),
    iconClass: "text-warning-500 dark:text-warning-400",
    icon: "⚠️",
    defaultTitle: "Warning",
  },
  success: {
    containerClass: cn(
      "bg-success-50 border-success-200 text-success-800",
      "dark:bg-success-950 dark:border-success-800 dark:text-success-200"
    ),
    iconClass: "text-success-500 dark:text-success-400",
    icon: "✅",
    defaultTitle: "Success",
  },
  info: {
    containerClass: cn(
      "bg-primary-50 border-primary-200 text-primary-800",
      "dark:bg-primary-950 dark:border-primary-800 dark:text-primary-200"
    ),
    iconClass: "text-primary-500 dark:text-primary-400",
    icon: "ℹ️",
    defaultTitle: "Info",
  },
};


export function Alert({
  variant = "error",
  title,
  message,
  details,
  dismissible = false,
  onDismiss,
  action,
  className,
}: AlertProps) {
  const [dismissed, setDismissed] = useState(false);

  const config = variantConfig[variant];
  const displayTitle = title || config.defaultTitle;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border p-4",
        "animate-fade-in",
        config.containerClass,
        className
      )}
    >
      <div className="flex gap-3">
        <span
          className={cn("text-lg shrink-0 mt-0.5", config.iconClass)}
          aria-hidden="true"
        >
          {config.icon}
        </span>

        <div className="flex-1 min-w-0">

          <p className="font-semibold text-sm">{displayTitle}</p>


          <p className="mt-0.5 text-sm opacity-90">{message}</p>

          {details && (
            <p className="mt-1 text-xs opacity-75 font-mono">{details}</p>
          )}

          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                "mt-2 text-xs font-semibold underline",
                "hover:no-underline transition-all"
              )}
            >
              {action.label}
            </button>
          )}
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            aria-label="Dismiss alert"
            className={cn(
              "shrink-0 p-1 rounded-lg",
              "hover:bg-black/10 dark:hover:bg-white/10",
              "transition-colors duration-150"
            )}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}


export function ErrorAlert({
  message,
  title,
  details,
  dismissible,
  onDismiss,
  className,
}: Omit<AlertProps, "variant">) {
  return (
    <Alert
      variant="error"
      message={message}
      title={title}
      details={details}
      dismissible={dismissible}
      onDismiss={onDismiss}
      className={className}
    />
  );
}

export function SuccessAlert({
  message,
  title,
  dismissible,
  onDismiss,
  className,
}: Omit<AlertProps, "variant">) {
  return (
    <Alert
      variant="success"
      message={message}
      title={title}
      dismissible={dismissible}
      onDismiss={onDismiss}
      className={className}
    />
  );
}

export function WarningAlert({
  message,
  title,
  dismissible,
  onDismiss,
  className,
}: Omit<AlertProps, "variant">) {
  return (
    <Alert
      variant="warning"
      message={message}
      title={title}
      dismissible={dismissible}
      onDismiss={onDismiss}
      className={className}
    />
  );
}


export function BackendOfflineAlert() {
  return (
    <Alert
      variant="warning"
      title="Backend Offline"
      message="Cannot connect to MedLens server. Make sure your FastAPI backend is running."
      details="Expected at: http://localhost:8000"
      action={{
        label: "How to start the server →",
        onClick: () =>
          alert(
            "Run this command:\ncd E:\\medlens\nuvicorn backend.main:app --reload --port 8000"
          ),
      }}
      className="mb-4"
    />
  );
}

export function PHIDetectedAlert() {
  return (
    <Alert
      variant="info"
      title="PHI Detected & Removed"
      message="Personal health information was found in your report and automatically removed before analysis."
      dismissible
      className="mb-4"
    />
  );
}

export function MedicalDisclaimerAlert() {
  return (
    <Alert
      variant="info"
      title="Medical Disclaimer"
      message="MedLens is an AI research tool for educational purposes only. It does not provide medical advice. Always consult a qualified healthcare professional for medical decisions."
      dismissible
      className="mb-4"
    />
  );
}


export default Alert;