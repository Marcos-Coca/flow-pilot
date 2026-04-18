import { Zap, Globe, Sparkles, X } from "lucide-react";
import type { Node } from "@xyflow/react";
import type { WorkflowNodeData } from "./types";

const iconMap = {
  trigger: Zap,
  action: Globe,
  ai: Sparkles,
} as const;

const colorMap = {
  trigger: "text-node-trigger bg-node-trigger/15",
  action: "text-node-action bg-node-action/15",
  ai: "text-node-ai bg-node-ai/15",
} as const;

const borderMap = {
  trigger: "border-node-trigger/30",
  action: "border-node-action/30",
  ai: "border-node-ai/30",
} as const;

interface InspectorPanelProps {
  node: Node<WorkflowNodeData> | null;
  onClose: () => void;
}

export function InspectorPanel({ node, onClose }: InspectorPanelProps) {
  if (!node) return null;

  const data = node.data;
  const Icon = iconMap[data.type];

  return (
    <div className="flex h-full w-[320px] shrink-0 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex size-7 items-center justify-center rounded-md ${colorMap[data.type]}`}
          >
            <Icon className="size-3.5" />
          </div>
          <span className="text-sm font-semibold">{data.label}</span>
        </div>
        <button
          onClick={onClose}
          className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Info section */}
          <div>
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Details
            </div>
            <div
              className={`rounded-lg border p-3 ${borderMap[data.type]} bg-background`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Type</span>
                  <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px]">
                    {data.type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Name</span>
                  <span className="text-xs font-medium">{data.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">ID</span>
                  <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px]">
                    {node.id}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Position */}
          <div>
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Position
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border bg-background px-3 py-2">
                <div className="text-[10px] text-muted-foreground">X</div>
                <div className="font-mono text-xs">
                  {Math.round(node.position.x)}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-background px-3 py-2">
                <div className="text-[10px] text-muted-foreground">Y</div>
                <div className="font-mono text-xs">
                  {Math.round(node.position.y)}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Description
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {data.subtitle}
            </p>
          </div>

          {/* Config placeholder */}
          <div>
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Configuration
            </div>
            <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-8 text-xs text-muted-foreground">
              No configuration yet
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
