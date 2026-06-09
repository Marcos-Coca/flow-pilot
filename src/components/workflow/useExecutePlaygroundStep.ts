import { useMutation } from "@tanstack/react-query";
import { type Edge, useReactFlow } from "@xyflow/react";
import { useState } from "react";
import type { WorkflowDefinition } from "~/db/schema";
import { createPlaygroundRun } from "~/services/workflow-runs";

import { usePlaygroundRun } from "./PlaygroundRunContext";
import type { WorkflowNode } from "./types";

export function useExecutePlaygroundStep() {
  const { getEdges, getNodes, setNodes } = useReactFlow<WorkflowNode>();
  const { setCurrentRunId, setErrorMessage, setIsExecuting } =
    usePlaygroundRun();
  const [validationError, setValidationError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createPlaygroundRun,
    onMutate: () => {
      setCurrentRunId(null);
      setErrorMessage(null);
      setIsExecuting(true);
    },
    onSuccess: ({ runId }, { triggerNodeId }) => {
      setCurrentRunId(runId);
      setNodes((currentNodes) =>
        deselectWorkflowNode(currentNodes, triggerNodeId),
      );
    },
    onError: (error) => {
      setIsExecuting(false);
      setErrorMessage(getPlaygroundExecutionErrorMessage(error));
    },
  });

  const executeStep = (nodeId: string) => {
    const nodes = getNodes();
    const stepNode = nodes.find((node) => node.id === nodeId);

    if (!stepNode) {
      const message = "This step is no longer available on the canvas.";
      setValidationError(message);
      setErrorMessage(message);
      return;
    }

    setValidationError(null);
    setErrorMessage(null);
    mutation.mutate({
      definition: createWorkflowDefinition(nodes, getEdges()),
      triggerNodeId: stepNode.id,
    });
  };

  return {
    errorMessage:
      validationError ?? getPlaygroundExecutionErrorMessage(mutation.error),
    executeStep,
    isPending: mutation.isPending,
  };
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

function getPlaygroundExecutionErrorMessage(error: unknown) {
  if (!error) return null;

  return error instanceof Error ? error.message : "Failed to run the workflow.";
}
