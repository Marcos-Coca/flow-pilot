import { Handle, Position } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "~/lib/utils";

interface WorkflowNodeCardProps {
  title: string;
  subtitle: string;
  selected: boolean;
  icon: LucideIcon;
  accentClassName: string;
  iconClassName: string;
  borderClassName: string;
  children?: ReactNode;
  showTargetHandle?: boolean;
  showSourceHandle?: boolean;
}

export function WorkflowNodeCard({
  title,
  subtitle,
  selected,
  icon: Icon,
  accentClassName,
  iconClassName,
  borderClassName,
  children,
  showTargetHandle = true,
  showSourceHandle = true,
}: WorkflowNodeCardProps) {
  return (
    <div
      className={cn(
        "group relative min-w-50 rounded-xl border bg-card transition-all duration-200 ease-out",
        selected
          ? `${borderClassName} shadow-lg shadow-foreground/10 ring-1`
          : "border-border hover:shadow-lg hover:shadow-foreground/10",
      )}
    >
      <div
        className={cn(
          "absolute left-3 right-3 top-0 h-0.5 rounded-b-full",
          accentClassName,
        )}
      />

      <div className="flex items-start gap-3 p-3.5">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            iconClassName,
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 pt-0.5">
          <div className="text-[13px] font-semibold leading-tight text-foreground">
            {title}
          </div>
          <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
            {subtitle}
          </div>
          {children ? <div className="mt-3">{children}</div> : null}
        </div>
      </div>

      {showTargetHandle ? (
        <Handle type="target" position={Position.Top} className="-top-1.25!" />
      ) : null}
      {showSourceHandle ? (
        <Handle
          type="source"
          position={Position.Bottom}
          className="-bottom-1.25!"
        />
      ) : null}
    </div>
  );
}
