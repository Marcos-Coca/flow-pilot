import { useRef, useState } from "react";
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
import { Plus, Workflow } from "lucide-react";
import {
  nodeTypes,
  type WorkflowNode,
} from "~/components/workflow/types";
import { InspectorPanel } from "~/components/workflow/InspectorPanel";
import {
  NodeLibraryPanel,
  type NodeTemplate,
} from "~/components/workflow/NodeLibraryPanel";
import { Button } from "~/components/ui/button";

type CanvasMode = "editor" | "playground";

export const Route = createFileRoute("/")({
  component: WorkflowEditor,
});

const initialNodes: WorkflowNode[] = [
  {
    id: "trigger-1",
    type: "trigger",
    position: { x: 300, y: 80 },
    data: {
      label: "Manual Trigger",
      subtitle: "Starts workflow manually",
      type: "trigger",
      icon: "trigger",
    },
  },
  {
    id: "action-1",
    type: "action",
    position: { x: 300, y: 240 },
    data: {
      label: "HTTP Request",
      subtitle: "Make an API call",
      type: "action",
      icon: "action",
    },
  },
  {
    id: "ai-1",
    type: "ai",
    position: { x: 300, y: 400 },
    data: {
      label: "AI Extract",
      subtitle: "Extract data with AI",
      type: "ai",
      icon: "ai",
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
    type: "trigger",
    label: "When click executes the workflow",
    subtitle: "Run the workflow when someone clicks to start it",
    section: "Triggers",
  },
  {
    type: "action",
    label: "HTTP Request",
    subtitle: "Make an API call",
    section: "Actions",
  },
  {
    type: "ai",
    label: "AI Extract",
    subtitle: "Extract data with AI",
    section: "Actions",
  },
];

function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [nodeSearch, setNodeSearch] = useState("");
  const [canvasMode, setCanvasMode] = useState<CanvasMode>("editor");
  const counterRef = useRef(4);
  const isEditorMode = canvasMode === "editor";
  const isPlaygroundMode = canvasMode === "playground";

  const onConnect = (connection: Connection) => {
    if (!isEditorMode) return;
    setEdges((eds) => addEdge(connection, eds));
  };

  const onNodeClick = (_: React.MouseEvent, node: WorkflowNode) => {
    if (!isEditorMode) return;
    setLibraryOpen(false);
    setSelectedNode(node);
  };

  const onPaneClick = () => {
    if (!isEditorMode) return;
    setSelectedNode(null);
  };

  const addNode = (template: NodeTemplate) => {
    const id = `${template.type}-${counterRef.current++}`;
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
        type: template.type,
        icon: template.type,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
    setLibraryOpen(false);
    setNodeSearch("");
  };

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
            <p className="mt-0.5 text-[11px] text-muted-foreground">Draft</p>
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
            onNodeClick={isEditorMode ? onNodeClick : undefined}
            onPaneClick={isEditorMode ? onPaneClick : undefined}
            nodeTypes={nodeTypes}
            nodesDraggable={isEditorMode}
            nodesConnectable={isEditorMode}
            elementsSelectable={isEditorMode}
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
                  case "trigger":
                    return "var(--color-node-trigger)";
                  case "action":
                    return "var(--color-node-action)";
                  case "ai":
                    return "var(--color-node-ai)";
                  default:
                    return "var(--muted-foreground)";
                }
              }}
              maskColor="color-mix(in oklab, var(--background) 60%, transparent)"
              className="!rounded-xl !border-border !bg-card/80 !shadow-lg !shadow-foreground/10"
            />
          </ReactFlow>

          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center px-4">
            <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-border bg-card/95 p-2 shadow-2xl shadow-foreground/10 backdrop-blur-sm">
              <div className="flex items-center rounded-xl border border-border bg-background p-1">
                <button
                  onClick={() => {
                    setCanvasMode("editor");
                  }}
                  className={
                    isEditorMode
                      ? "rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                      : "rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  }
                >
                  Editor
                </button>
                <button
                  onClick={() => {
                    setCanvasMode("playground");
                    setLibraryOpen(false);
                    setSelectedNode(null);
                    setNodeSearch("");
                  }}
                  className={
                    isPlaygroundMode
                      ? "rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                      : "rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  }
                >
                  Playground
                </button>
              </div>

              {isEditorMode ? (
                <>
                  <div className="h-8 w-px bg-border" />
                  <Button
                    onClick={() => {
                      setSelectedNode(null);
                      setLibraryOpen(true);
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="size-3.5" />
                    Add Node
                  </Button>
                  <Button
                    onClick={() => {
                      setCanvasMode("playground");
                      setLibraryOpen(false);
                      setSelectedNode(null);
                      setNodeSearch("");
                    }}
                    size="sm"
                  >
                    Execute Workflow
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {isEditorMode && libraryOpen ? (
        <NodeLibraryPanel
          open={libraryOpen}
          templates={nodeTemplates}
          searchValue={nodeSearch}
          onSearchChange={setNodeSearch}
          onAddNode={addNode}
          onClose={() => {
            setLibraryOpen(false);
            setNodeSearch("");
          }}
        />
      ) : null}

      {isEditorMode && !libraryOpen && selectedNode ? (
        <InspectorPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      ) : null}
    </div>
  );
}
