import {
  type Node,
  type NodeProps,
  type NodeTypes,
  useReactFlow,
} from "@xyflow/react";
import { type ReactNode } from "react";
import { Globe, MousePointerClick, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";

import { useExecutePlaygroundStep } from "./useExecutePlaygroundStep";
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
  const {
    errorMessage: triggerError,
    executeStep,
    isPending,
  } = useExecutePlaygroundStep();
  const handleExecuteTrigger = () => {
    executeStep(id);
  };

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
        >
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
              onClick={handleExecuteTrigger}
              disabled={isPending}
              className="mt-4 w-full"
            >
              <MousePointerClick className="size-3.5" />
              {isPending
                ? "Sending trigger..."
                : "Customer clicks to run workflow"}
            </Button>

            {triggerError ? (
              <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {triggerError}
              </div>
            ) : null}
          </div>
        </NodeInspector>
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
  children,
}: {
  nodeId: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  const { setNodes } = useReactFlow<WorkflowNode>();

  return (
    <Sheet
      defaultOpen
      onOpenChange={(nextOpen) => {
        if (nextOpen) return;

        setNodes((currentNodes) => deselectWorkflowNode(currentNodes, nodeId));
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
          {children ?? (
            <div className="rounded-lg border border-dashed border-border bg-background px-4 py-10 text-center text-xs text-muted-foreground">
              Empty inspector for now
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function deselectWorkflowNode(nodes: WorkflowNode[], nodeId: string) {
  return nodes.map((node) =>
    node.id === nodeId
      ? {
          ...node,
          selected: false,
        }
      : node,
  );
}

export const nodeTypes: NodeTypes = {
  "trigger.manual": ManualTriggerNode,
  "action.http_request": HttpRequestNode,
  "action.ai_extract": AIExtractNode,
};
