import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";


interface CardProps extends HTMLAttributes<HTMLDivElement>{
     hover?:boolean;
     padding?:"none"|"sm"|"md"|"lg";
     selected?:boolean;
     accent?:"primary"|"success"|"warning"|"danger"|"none";
}

const paddingStyles = {
     none:"p-0",
     sm:"p-3",
     md:"p-5",
     lg:"p-6 sm:p-8",
}

const accentStyles = {
     none: "",
     primary: "border-l-4 border-l-primary-500",
     success: "border-l-4 border-l-success-500",
     warning: "border-l-4 border-l-warning-500",
     danger:"border-l-4 border-l-danger-500",
}


export function Card({
     hover = false,
     padding = "md",
     selected = false,
     accent = "none",
     className,
     children,
     onClick,
     ...props
}:CardProps){
     const isClickable = ! !onClick;

     return(
          <div 
          onClick={onClick}
          className={cn("rounded-xl border","bg-white dark:bg-surface-800","border-surface-200 dark:border-surface-700","transition-all duration-200",
              paddingStyles[padding],
              accentStyles[accent], 
              hover && [
               "hover:shadow-md",
               "hover:border-surface-300 dark:hover:border-surface-600",
              ],
              selected && [
               "border-primary-500 dark:border-primary-400",
               "ring-2 ring-primary-500/20 dark:ring-primary-400/20",
               "shadow-sm",
              ],
              isClickable && "cursor-pointer",
              className
          )}
          {...props}
          >
               {children}

          </div>
     )
}

interface CardHeaderProps{
     title:string;
     subtitle?:string;
     rightContent?:React.ReactNode;
     className?:string;
}

export function CardHeader({
     title,subtitle,rightContent,className
}:CardHeaderProps){
     return (
          <div
          className={cn("flex items-start justify-between gap-4","mb-4",className)}
          >
               <div>
                    <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">
                         {title}
                    </h3>
                    {subtitle && (
                         <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">
                              {subtitle}
                         </p>
                    )}
               </div>
               {rightContent && (
                    <div className="shrink-0">{rightContent}</div>
               )}

          </div>
     )
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("text-surface-700 dark:text-surface-300", className)}>
      {children}
    </div>
  );
}


export function CardDivider({ className }: { className?: string }) {
  return (
    <hr
      className={cn(
        "my-4 border-surface-200 dark:border-surface-700",
        className
      )}
    />
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
  className,
}: StatCardProps) {
  return (
    <Card hover className={cn("", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500 dark:text-surface-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-surface-100">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                trendUp
                  ? "text-success-600 dark:text-success-400"
                  : "text-danger-600 dark:text-danger-400"
              )}
            >
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>

        {icon && (
          <span className="text-2xl" role="img" aria-label={label}>
            {icon}
          </span>
        )}
      </div>
    </Card>
  );
}


export default Card;