import type { Node } from "@xyflow/react";

export type WorkflowNodeType =
  | "trigger.manual"
  | "action.http_request"
  | "action.ai_extract";

export interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  subtitle: string;
  config?: Record<string, string>;
  isEditorMode: boolean;
}

export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeType>;
