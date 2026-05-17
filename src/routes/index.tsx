import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  BackgroundVariant,
  type Edge,
} from "@xyflow/react";
import { Loader2, MousePointerClick, Workflow } from "lucide-react";
import { type WorkflowNode } from "~/components/workflow/types";
import { nodeTypes } from "~/components/workflow/node-registry";
import {
  WorkflowCanvasControls,
  type NodeTemplate,
} from "~/components/workflow/WorkflowCanvasControls";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { WorkflowDefinition, WorkflowRunStatus } from "~/db/schema";

type CanvasMode = "editor" | "playground";

type WorkflowInstanceStatus =
  | "queued"
  | "running"
  | "paused"
  | "errored"
  | "terminated"
  | "complete"
  | "waiting"
  | "waitingForPause"
  | "unknown";

interface RunStepSummary {
  id: string;
  nodeId: string;
  nodeType: string;
  nodeName: string;
  status: string;
  output: unknown;
  error: unknown;
}

interface PlaygroundRunDetails {
  run: {
    id: string;
    status: WorkflowRunStatus;
    workflowId: string;
    workflowVersionId: string;
    startedAt: number | null;
    finishedAt: number | null;
    output: unknown;
    error: unknown;
  };
  steps: RunStepSummary[];
  workflowInstanceStatus: {
    status: WorkflowInstanceStatus;
    error?: unknown;
    output?: unknown;
  } | null;
}

export const Route = createFileRoute("/")({
  component: WorkflowEditor,
});

const initialNodes: WorkflowNode[] = [
  {
    id: "trigger-1",
    type: "trigger.manual",
    position: { x: 300, y: 80 },
    data: {
      label: "Manual Trigger",
      subtitle: "Starts workflow manually",
      isEditorMode: true,
    },
  },
  {
    id: "action-1",
    type: "action.http_request",
    position: { x: 300, y: 240 },
    data: {
      label: "HTTP Request",
      subtitle: "Make an API call",
      isEditorMode: true,
      config: {
        url: "https://httpbin.org/anything",
        method: "GET",
      },
    },
  },
  {
    id: "ai-1",
    type: "action.ai_extract",
    position: { x: 300, y: 400 },
    data: {
      label: "AI Extract",
      subtitle: "Extract data with AI",
      isEditorMode: true,
    },
  },
];

const initialEdges = [
  {
    id: "e-trigger-action",
    source: "trigger-1",
    target: "action-1",
    animated: true,
  },
  {
    id: "e-action-ai",
    source: "action-1",
    target: "ai-1",
  },
];

const nodeTemplates: NodeTemplate[] = [
  {
    type: "trigger.manual",
    label: "When click executes the workflow",
    subtitle: "Run the workflow when someone clicks to start it",
    section: "Triggers",
  },
  {
    type: "action.http_request",
    label: "HTTP Request",
    subtitle: "Make an API call",
    section: "Actions",
  },
  {
    type: "action.ai_extract",
    label: "AI Extract",
    subtitle: "Extract data with AI",
    section: "Actions",
  },
];

function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [canvasMode, setCanvasMode] = useState<CanvasMode>("editor");
  const [playgroundRun, setPlaygroundRun] =
    useState<PlaygroundRunDetails | null>(null);
  const [playgroundError, setPlaygroundError] = useState<string | null>(null);
  const [isExecutingPlaygroundRun, setIsExecutingPlaygroundRun] =
    useState(false);
  const counterRef = useRef(4);
  const executePlaygroundWorkflowRef = useRef<() => Promise<void>>(async () => {});
  const runManualTriggerRef = useRef<(() => void) | null>(null);
  const isEditorMode = canvasMode === "editor";
  const isPlaygroundMode = canvasMode === "playground";

  if (!runManualTriggerRef.current) {
    runManualTriggerRef.current = () => {
      void executePlaygroundWorkflowRef.current();
    };
  }

  const runManualTrigger = runManualTriggerRef.current;

  useEffect(() => {
    setNodes((currentNodes) => {
      let hasChanges = false;

      const normalizedNodes = currentNodes.map((node) => {
        const normalizedNode = normalizeWorkflowNode(node);

        if (normalizedNode !== node) {
          hasChanges = true;
        }

        return normalizedNode;
      });

      return hasChanges ? normalizedNodes : currentNodes;
    });
  }, [setNodes]);

  useEffect(() => {
    setNodes((currentNodes) => {
      let hasChanges = false;

      const nodesWithMode = currentNodes.map((node) => {
        if (node.data.isEditorMode === isEditorMode) {
          return node;
        }

        hasChanges = true;

        return {
          ...node,
          data: {
            ...node.data,
            isEditorMode,
          },
        };
      });

      return hasChanges ? nodesWithMode : currentNodes;
    });
  }, [isEditorMode, setNodes]);

  useEffect(() => {
    setNodes((currentNodes) => {
      let hasChanges = false;

      const nodesWithTriggerAction = currentNodes.map((node) => {
        if (node.type !== "trigger.manual") {
          return node;
        }

        if (
          node.data.onExecuteTrigger === runManualTrigger &&
          node.data.isExecutingTrigger === isExecutingPlaygroundRun
        ) {
          return node;
        }

        hasChanges = true;

        return {
          ...node,
          data: {
            ...node.data,
            onExecuteTrigger: runManualTrigger,
            isExecutingTrigger: isExecutingPlaygroundRun,
          },
        };
      });

      return hasChanges ? nodesWithTriggerAction : currentNodes;
    });
  }, [isExecutingPlaygroundRun, runManualTrigger, setNodes]);

  const onConnect = (connection: Connection) => {
    if (!isEditorMode) return;
    setEdges((eds) => addEdge(connection, eds));
  };

  const addNode = (template: NodeTemplate) => {
    const id = `${template.type.replace(/\W+/g, "-")}-${counterRef.current++}`;
    const newNode: WorkflowNode = {
      id,
      type: template.type,
      position: {
        x: 200 + Math.random() * 200,
        y: 150 + Math.random() * 300,
      },
      data: {
        label: template.label,
        subtitle: template.subtitle,
        isEditorMode,
      },
      selected: true,
    };
    setNodes((currentNodes) => [
      ...currentNodes.map((node) => ({
        ...node,
        selected: false,
      })),
      newNode,
    ]);
  };

  const triggerNode = nodes.find((node) => node.type.startsWith("trigger."));
  const manualTriggerNode =
    triggerNode?.type === "trigger.manual" ? triggerNode : null;

  const handleCanvasModeChange = (nextMode: CanvasMode) => {
    setCanvasMode(nextMode);

    if (nextMode !== "playground") return;

    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.selected
          ? {
              ...node,
              selected: false,
            }
          : node,
      ),
    );
  };

  const executePlaygroundWorkflow = async () => {
    if (!triggerNode) {
      setPlaygroundRun(null);
      setPlaygroundError(
        "Add at least one trigger node before running the playground workflow.",
      );
      return;
    }

    setIsExecutingPlaygroundRun(true);
    setPlaygroundError(null);

    try {
      const definition = createWorkflowDefinition(nodes, edges);
      const createResponse = await fetch("/api/playground-runs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          definition,
          triggerNodeId: triggerNode.id,
          input: {
            source: "playground",
            triggeredAt: new Date().toISOString(),
          },
        }),
      });

      if (!createResponse.ok) {
        const errorPayload = (await createResponse
          .json()
          .catch(() => null)) as { error?: string } | null;
        throw new Error(
          errorPayload?.error ?? "Failed to create a temporary workflow run.",
        );
      }

      const createdRun = (await createResponse.json()) as { runId: string };
      const details = await pollRunDetails(createdRun.runId);
      setPlaygroundRun(details);
    } catch (error) {
      setPlaygroundRun(null);
      setPlaygroundError(
        error instanceof Error
          ? error.message
          : "Failed to execute the playground workflow.",
      );
    } finally {
      setIsExecutingPlaygroundRun(false);
    }
  };

  executePlaygroundWorkflowRef.current = executePlaygroundWorkflow;

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <div className="flex size-7 items-center justify-center rounded-lg bg-node-action/20 text-node-action">
            <Workflow className="size-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-none">
              Untitled Workflow
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {isPlaygroundMode ? "Playground" : "Draft"}
            </p>
          </div>
        </div>
        {isPlaygroundMode ? (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "rounded-full border px-2.5 py-1 text-sm font-medium",
                getPlaygroundStatusClasses(
                  playgroundRun?.run.status,
                  isExecutingPlaygroundRun,
                ),
              )}
            >
              {isExecutingPlaygroundRun
                ? "Running..."
                : (playgroundRun?.run.status ?? "Ready")}
            </div>
            {playgroundRun ? (
              <div className="text-[11px] text-muted-foreground">
                Temp run {playgroundRun.run.id.slice(0, 8)}
              </div>
            ) : null}
          </div>
        ) : null}
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="workflow-canvas relative flex-1">
          <ReactFlow<WorkflowNode>
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            nodesDraggable={isEditorMode}
            nodesConnectable={isEditorMode}
            elementsSelectable
            fitView
            fitViewOptions={{ padding: 0.3 }}
            defaultEdgeOptions={{
              style: { strokeWidth: 2 },
              type: "smoothstep",
            }}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="var(--border)"
            />
            <Controls
              showInteractive={false}
              className="!rounded-xl !border-border !bg-card !shadow-lg !shadow-foreground/10 [&>button]:!border-border [&>button]:!bg-card [&>button]:!text-muted-foreground hover:[&>button]:!bg-muted hover:[&>button]:!text-foreground"
            />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case "trigger.manual":
                    return "var(--color-node-trigger)";
                  case "action.http_request":
                    return "var(--color-node-action)";
                  case "action.ai_extract":
                    return "var(--color-node-ai)";
                  default:
                    return "var(--muted-foreground)";
                }
              }}
              maskColor="color-mix(in oklab, var(--background) 60%, transparent)"
              className="rounded-xl! border-border! bg-card/80! !shadow-lg !shadow-foreground/10"
            />
          </ReactFlow>

          <WorkflowCanvasControls
            canvasMode={canvasMode}
            isExecutingPlaygroundRun={isExecutingPlaygroundRun}
            onAddNode={addNode}
            onExecutePlayground={() => {
              void executePlaygroundWorkflow();
            }}
            onSetCanvasMode={handleCanvasModeChange}
            templates={nodeTemplates}
          />
        </div>
      </div>

      {isPlaygroundMode ? (
        <div className="pointer-events-none absolute right-4 top-16 z-10 w-[360px] max-w-[calc(100vw-2rem)]">
          <div className="pointer-events-auto rounded-2xl border border-border bg-card/95 p-4 shadow-2xl shadow-foreground/10 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Playground execution</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Each run creates a temporary workflow version in D1 and
                  executes it with Cloudflare Workflows.
                </p>
              </div>
              {isExecutingPlaygroundRun ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              ) : null}
            </div>

            {playgroundError ? (
              <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {playgroundError}
              </div>
            ) : null}

            {manualTriggerNode ? (
              <div className="mt-4 rounded-2xl border border-node-trigger/25 bg-node-trigger/8 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Customer click simulation
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Manual triggers stay idle until the customer clicks this
                      button. Clicking it sends the POST request that starts the
                      workflow run.
                    </p>
                  </div>
                  <MousePointerClick className="mt-0.5 size-4 text-node-trigger" />
                </div>

                <Button
                  onClick={() => {
                    void executePlaygroundWorkflow();
                  }}
                  disabled={isExecutingPlaygroundRun}
                  className="mt-3 w-full"
                >
                  {isExecutingPlaygroundRun ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <MousePointerClick className="size-3.5" />
                  )}
                  {isExecutingPlaygroundRun
                    ? "Sending trigger..."
                    : "Customer clicks to run workflow"}
                </Button>
              </div>
            ) : null}

            {playgroundRun ? (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <PlaygroundMetric
                    label="Run status"
                    value={playgroundRun.run.status}
                  />
                  <PlaygroundMetric
                    label="Workflow"
                    value={playgroundRun.run.workflowId.slice(0, 8)}
                  />
                  <PlaygroundMetric
                    label="Version"
                    value={playgroundRun.run.workflowVersionId.slice(0, 8)}
                  />
                  <PlaygroundMetric
                    label="Instance"
                    value={
                      playgroundRun.workflowInstanceStatus?.status ?? "unknown"
                    }
                  />
                </div>

                <div>
                  <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Steps
                  </div>
                  <div className="space-y-2">
                    {playgroundRun.steps.map((step) => (
                      <div
                        key={step.id}
                        className="rounded-xl border border-border bg-background px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-xs font-medium">
                              {step.nodeName}
                            </div>
                            <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                              {step.nodeType}
                            </div>
                          </div>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                              getStepStatusClasses(step.status),
                            )}
                          >
                            {step.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Output
                  </div>
                  <pre className="max-h-48 overflow-auto rounded-xl border border-border bg-background p-3 text-[11px] leading-relaxed text-muted-foreground">
                    {JSON.stringify(playgroundRun.run.output, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-border bg-background/70 px-3 py-6 text-center text-xs text-muted-foreground">
                {manualTriggerNode
                  ? "The manual trigger is armed. The workflow will wait here until the customer clicks the button above."
                  : "Use Playground to create a temporary workflow run for the current canvas."}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function createWorkflowDefinition(
  nodes: WorkflowNode[],
  edges: Edge[],
): WorkflowDefinition {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type,
      name: node.data.label,
      config: node.data.config ?? {},
      position: {
        x: node.position.x,
        y: node.position.y,
      },
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    })),
    metadata: {
      source: "playground-canvas",
      generatedAt: new Date().toISOString(),
    },
  };
}

async function pollRunDetails(runId: string): Promise<PlaygroundRunDetails> {
  let lastDetails: PlaygroundRunDetails | null = null;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await fetch(`/api/workflow-runs/${runId}`);

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(
        errorPayload?.error ?? `Failed to fetch workflow run "${runId}".`,
      );
    }

    const details = (await response.json()) as PlaygroundRunDetails;
    lastDetails = details;

    if (isTerminalRunStatus(details.run.status)) {
      return details;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 600));
  }

  if (!lastDetails) {
    throw new Error("Workflow run polling finished without a response.");
  }

  return lastDetails;
}

function isTerminalRunStatus(status: WorkflowRunStatus) {
  return status === "success" || status === "failed" || status === "cancelled";
}

function normalizeWorkflowNode(node: WorkflowNode): WorkflowNode {
  const legacyExecutionType = readLegacyExecutionType(node.data);
  const normalizedType = legacyExecutionType
    ? normalizeWorkflowNodeType(legacyExecutionType)
    : normalizeWorkflowNodeType(node.type);

  if (normalizedType === node.type && !legacyExecutionType) {
    return node;
  }

  return {
    ...node,
    type: normalizedType,
  };
}

function readLegacyExecutionType(data: WorkflowNode["data"]) {
  const executionType = data.executionType;

  return typeof executionType === "string" ? executionType : null;
}

function normalizeWorkflowNodeType(type: string): WorkflowNode["type"] {
  switch (type) {
    case "trigger":
    case "trigger.manual":
      return "trigger.manual";
    case "action":
    case "action.http_request":
      return "action.http_request";
    case "ai":
    case "action.ai_extract":
      return "action.ai_extract";
    default:
      return "action.http_request";
  }
}

function getPlaygroundStatusClasses(
  status: WorkflowRunStatus | undefined,
  isExecuting: boolean,
) {
  if (isExecuting || status === "running" || status === "queued") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-700";
  }

  if (status === "success") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700";
  }

  if (status === "failed" || status === "cancelled") {
    return "border-destructive/30 bg-destructive/10 text-destructive";
  }

  return "border-border bg-background text-muted-foreground";
}

function getStepStatusClasses(status: string) {
  switch (status) {
    case "success":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700";
    case "failed":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "running":
    case "pending":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700";
    default:
      return "border-border bg-background text-muted-foreground";
  }
}

function PlaygroundMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-xs text-foreground">{value}</div>
    </div>
  );
}
