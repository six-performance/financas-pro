import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: React.ReactNode
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, icon, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-1.5 sm:space-y-2", className)} {...props}>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--foreground)] flex items-center gap-2">
          {title}
          {icon && <span className="text-2xl sm:text-3xl">{icon}</span>}
        </h1>
        {description && (
          <p className="text-sm sm:text-base md:text-lg text-[var(--muted-foreground)] max-w-3xl">
            {description}
          </p>
        )}
      </div>
    )
  }
)
PageHeader.displayName = "PageHeader"

export { PageHeader }

