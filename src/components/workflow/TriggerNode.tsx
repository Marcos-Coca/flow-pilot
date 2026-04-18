import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { WorkflowNodeData } from "./types";
import { Zap } from "lucide-react";

type TriggerNodeType = Node<WorkflowNodeData, "trigger">;

export function TriggerNode({ selected }: NodeProps<TriggerNodeType>) {
  return (
    <div
      className={`
        group relative min-w-50 rounded-xl border bg-card
        transition-all duration-200 ease-out
        ${
          selected
            ? "border-node-trigger/60 shadow-[0_0_20px_-4px] shadow-node-trigger/25 ring-1 ring-node-trigger/30"
            : "border-border hover:border-node-trigger/30 hover:shadow-lg hover:shadow-foreground/10"
        }
      `}
    >
      {/* Accent bar */}
      <div className="absolute top-0 left-3 right-3 h-0.5 rounded-b-full bg-node-trigger/70" />

      <div className="flex items-start gap-3 p-3.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-node-trigger/15 text-node-trigger">
          <Zap className="size-4" />
        </div>
        <div className="min-w-0 pt-0.5">
          <div className="text-[13px] font-semibold leading-tight text-foreground">
            Manual Trigger
          </div>
          <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
            Starts workflow manually
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="-bottom-1.25!"
      />
    </div>
  );
}
