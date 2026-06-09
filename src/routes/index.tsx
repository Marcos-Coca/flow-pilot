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
} from "@xyflow/react";
import { Workflow } from "lucide-react";
import {
  PlaygroundRunProvider,
} from "~/components/workflow/PlaygroundRunContext";
import { type WorkflowNode } from "~/components/workflow/types";
import { nodeTypes } from "~/components/workflow/node-registry";
import { WorkflowPlaygroundSummaryPanel } from "~/components/workflow/WorkflowPlaygroundSummaryPanel";
import {
  WorkflowCanvasControls,
  type NodeTemplate,
} from "~/components/workflow/WorkflowCanvasControls";

type CanvasMode = "editor" | "playground";

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
  const counterRef = useRef(4);
  const isEditorMode = canvasMode === "editor";

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

  return (
    <PlaygroundRunProvider>
      <div className="flex h-screen flex-col">
        {/* Top bar */}
        <header className="flex h-12 shrink-0 items-center border-b border-border bg-card px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-7 items-center justify-center rounded-lg bg-node-action/20 text-node-action">
              <Workflow className="size-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-none">
                Untitled Workflow
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {canvasMode === "playground" ? "Playground" : "Draft"}
              </p>
            </div>
          </div>
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
              onAddNode={addNode}
              onSetCanvasMode={handleCanvasModeChange}
              templates={nodeTemplates}
            />
          </div>
        </div>
        <WorkflowPlaygroundSummaryPanel canvasMode={canvasMode} />
      </div>
    </PlaygroundRunProvider>
  );
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
