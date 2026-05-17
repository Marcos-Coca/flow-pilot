import {
  type Node,
  type NodeProps,
  type NodeTypes,
  useReactFlow,
} from "@xyflow/react";
import { Globe, MousePointerClick, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";

import { WorkflowNodeCard } from "./WorkflowNodeCard";
import type { WorkflowNode, WorkflowNodeData } from "./types";

type ManualTriggerFlowNode = Node<WorkflowNodeData, "trigger.manual">;
type HttpRequestFlowNode = Node<WorkflowNodeData, "action.http_request">;
type AIExtractFlowNode = Node<WorkflowNodeData, "action.ai_extract">;

function ManualTriggerNode({
  id,
  data,
  selected,
}: NodeProps<ManualTriggerFlowNode>) {
  return (
    <>
      <WorkflowNodeCard
        title={data.label}
        subtitle={data.subtitle}
        selected={selected}
        icon={MousePointerClick}
        accentClassName="bg-node-trigger/70"
        iconClassName="bg-node-trigger/15 text-node-trigger"
        borderClassName="border-node-trigger/60 shadow-node-trigger/25 ring-node-trigger/30"
        showTargetHandle={false}
      >
        <div className="inline-flex items-center gap-1 rounded-md border border-node-trigger/20 bg-node-trigger/8 px-2 py-1 text-[10px] font-medium text-node-trigger">
          <MousePointerClick className="size-3" />
          Customer click
        </div>
      </WorkflowNodeCard>
      {selected && !data.isEditorMode && (
        <NodeInspector
          nodeId={id}
          title={data.label}
          description={data.subtitle}
          actionLabel={
            data.isExecutingTrigger
              ? "Sending trigger..."
              : "Customer clicks to run workflow"
          }
          isActionDisabled={data.isExecutingTrigger}
          onAction={data.onExecuteTrigger}
        />
      )}
    </>
  );
}

function HttpRequestNode({
  id,
  data,
  selected,
}: NodeProps<HttpRequestFlowNode>) {
  return (
    <>
      <WorkflowNodeCard
        title={data.label}
        subtitle={data.subtitle}
        selected={selected}
        icon={Globe}
        accentClassName="bg-node-action/70"
        iconClassName="bg-node-action/15 text-node-action"
        borderClassName="border-node-action/60 shadow-node-action/25 ring-node-action/30"
      >
        <div className="rounded-md border border-node-action/20 bg-node-action/8 px-2 py-1 font-mono text-[10px] text-node-action">
          {String(data.config?.method ?? "GET")}{" "}
          {String(data.config?.url ?? "/")}
        </div>
      </WorkflowNodeCard>
      {selected && (
        <NodeInspector
          nodeId={id}
          title={data.label}
          description={data.subtitle}
        />
      )}
    </>
  );
}

function AIExtractNode({ id, data, selected }: NodeProps<AIExtractFlowNode>) {
  return (
    <>
      <WorkflowNodeCard
        title={data.label}
        subtitle={data.subtitle}
        selected={selected}
        icon={Sparkles}
        accentClassName="bg-node-ai/70"
        iconClassName="bg-node-ai/15 text-node-ai"
        borderClassName="border-node-ai/60 shadow-node-ai/25 ring-node-ai/30"
      >
        <div className="inline-flex items-center gap-1 rounded-md border border-node-ai/20 bg-node-ai/8 px-2 py-1 text-[10px] font-medium text-node-ai">
          <Sparkles className="size-3" />
          Structured extraction
        </div>
      </WorkflowNodeCard>
      {selected && (
        <NodeInspector
          nodeId={id}
          title={data.label}
          description={data.subtitle}
        />
      )}
    </>
  );
}

function NodeInspector({
  nodeId,
  title,
  description,
  actionLabel,
  isActionDisabled = false,
  onAction,
}: {
  nodeId: string;
  title: string;
  description: string;
  actionLabel?: string;
  isActionDisabled?: boolean;
  onAction?: () => void;
}) {
  const { setNodes } = useReactFlow<WorkflowNode>();

  return (
    <Sheet
      defaultOpen
      onOpenChange={(nextOpen) => {
        if (nextOpen) return;

        setNodes((currentNodes) =>
          currentNodes.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  selected: false,
                }
              : node,
          ),
        );
      }}
    >
      <SheetContent
        side="right"
        showCloseButton
        className="w-full p-0 sm:max-w-[320px]"
      >
        <SheetHeader className="border-b border-border pr-12">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 p-4">
          {onAction ? (
            <div className="rounded-xl border border-node-trigger/20 bg-node-trigger/8 p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-node-trigger/15 text-node-trigger">
                  <MousePointerClick className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Customer click simulation
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Run this trigger directly from the inspector to execute the
                    workflow from this entry point.
                  </p>
                </div>
              </div>

              <Button
                onClick={onAction}
                disabled={isActionDisabled}
                className="mt-4 w-full"
              >
                <MousePointerClick className="size-3.5" />
                {actionLabel ?? "Run trigger"}
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-background px-4 py-10 text-center text-xs text-muted-foreground">
              Empty inspector for now
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export const nodeTypes: NodeTypes = {
  "trigger.manual": ManualTriggerNode,
  "action.http_request": HttpRequestNode,
  "action.ai_extract": AIExtractNode,
};
