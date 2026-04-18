import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { WorkflowNodeData } from "./types";
import { Globe } from "lucide-react";

type ActionNodeType = Node<WorkflowNodeData, "action">;

export function ActionNode({ data, selected }: NodeProps<ActionNodeType>) {
  return (
    <div
      className={`
        group relative min-w-50 rounded-xl border bg-card
        transition-all duration-200 ease-out
        ${
          selected
            ? "border-node-action/60 shadow-[0_0_20px_-4px] shadow-node-action/25 ring-1 ring-node-action/30"
            : "border-border hover:border-node-action/30 hover:shadow-lg hover:shadow-foreground/10"
        }
      `}
    >
      <div className="absolute top-0 left-3 right-3 h-0.5 rounded-b-full bg-node-action/70" />

      <div className="flex items-start gap-3 p-3.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-node-action/15 text-node-action">
          <Globe className="size-4" />
        </div>
        <div className="min-w-0 pt-0.5">
          <div className="text-[13px] font-semibold leading-tight text-foreground">
            {data.label}
          </div>
          <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
            {data.subtitle}
          </div>
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="-top-1.25!" />
      <Handle
        type="source"
        position={Position.Bottom}
        className="-bottom-1.25!"
      />
    </div>
  );
}
