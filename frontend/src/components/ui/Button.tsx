import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{
     variant?:"primary"|"secondary"|"outline"|"ghost"|"danger";

     size?:"sm"|"md"|"lg";

     isLoading?:boolean;

     leftIcon?:React.ReactNode;

     rightIcon?:React.ReactNode;

     fullWidth?:boolean;
}


const variantStyles = {
  primary: cn(
    "bg-primary-500 text-white",
    "hover:bg-primary-600 active:bg-primary-700",
    "dark:bg-primary-600 dark:hover:bg-primary-500",
    "shadow-sm"
  ),
  secondary: cn(
    "bg-surface-100 text-surface-800",
    "hover:bg-surface-200 active:bg-surface-300",
    "dark:bg-surface-700 dark:text-surface-100",
    "dark:hover:bg-surface-600",
    "border border-surface-200 dark:border-surface-600"
  ),
  outline: cn(
    "bg-transparent text-primary-600",
    "border border-primary-500",
    "hover:bg-primary-50 active:bg-primary-100",
    "dark:text-primary-400 dark:border-primary-400",
    "dark:hover:bg-primary-950"
  ),
  ghost: cn(
    "bg-transparent text-surface-600",
    "hover:bg-surface-100 active:bg-surface-200",
    "dark:text-surface-400",
    "dark:hover:bg-surface-800"
  ),
  danger: cn(
    "bg-danger-500 text-white",
    "hover:bg-danger-600 active:bg-danger-700",
    "dark:bg-danger-600 dark:hover:bg-danger-500",
    "shadow-sm"
  ),
};

const sizeStyles = {
     sm: "px-3 py-1.5 text-sm gap-1.5",
     md: "px-4 py-2 text-sm gap-2",
     lg: "px-6 py-3 text-base gap-2.5",
};

const spinnerSizes = {
     sm:"w-3 h-3",
     md:"w-4 h-4",
     lg:"w-5 h-5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = isLoading || disabled;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center",
          "font-medium rounded-lg",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          "dark:focus-visible:ring-offset-surface-900",

          variantStyles[variant],
          sizeStyles[size],

          fullWidth && "w-full",

          isDisabled && "opacity-60 cursor-not-allowed pointer-events-none",

          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg
            className={cn("animate-spin", spinnerSizes[size])}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}

        {children}

        {rightIcon && !isLoading && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;