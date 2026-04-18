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
import {
  Plus,
  Zap,
  Globe,
  Sparkles,
  ChevronDown,
  Workflow,
} from "lucide-react";
import {
  nodeTypes,
  type WorkflowNode,
  type WorkflowNodeData,
} from "~/components/workflow/types";
import { InspectorPanel } from "~/components/workflow/InspectorPanel";

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

const nodeTemplates: {
  type: WorkflowNodeData["type"];
  label: string;
  subtitle: string;
  icon: typeof Zap;
}[] = [
  {
    type: "trigger",
    label: "Manual Trigger",
    subtitle: "Starts workflow manually",
    icon: Zap,
  },
  {
    type: "action",
    label: "HTTP Request",
    subtitle: "Make an API call",
    icon: Globe,
  },
  {
    type: "ai",
    label: "AI Extract",
    subtitle: "Extract data with AI",
    icon: Sparkles,
  },
];

const colorClasses = {
  trigger: "text-node-trigger bg-node-trigger/15",
  action: "text-node-action bg-node-action/15",
  ai: "text-node-ai bg-node-ai/15",
} as const;

function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const counterRef = useRef(4);

  const onConnect = (connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  };

  const onNodeClick = (_: React.MouseEvent, node: WorkflowNode) => {
    setSelectedNode(node);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  const addNode = (template: (typeof nodeTemplates)[number]) => {
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
    setMenuOpen(false);
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

        <div className="flex items-center gap-2">
          {/* Add Node dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted"
            >
              <Plus className="size-3.5" />
              Add Node
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-xl shadow-foreground/10">
                  {nodeTemplates.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.type}
                        onClick={() => addNode(t)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted"
                      >
                        <div
                          className={`flex size-7 items-center justify-center rounded-md ${colorClasses[t.type]}`}
                        >
                          <Icon className="size-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-medium">{t.label}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {t.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="workflow-canvas flex-1">
          <ReactFlow<WorkflowNode>
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
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
        </div>

        {/* Inspector */}
        <InspectorPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      </div>
    </div>
  );
}
