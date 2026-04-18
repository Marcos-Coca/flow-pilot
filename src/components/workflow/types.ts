import type { Node, NodeTypes } from '@xyflow/react'
import { TriggerNode } from './TriggerNode'
import { ActionNode } from './ActionNode'
import { AINode } from './AINode'

export const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  ai: AINode,
}

export type WorkflowNodeKind = 'trigger' | 'action' | 'ai'

export interface WorkflowNodeData extends Record<string, unknown> {
  label: string
  subtitle: string
  type: WorkflowNodeKind
  icon: WorkflowNodeKind
  config?: Record<string, string>
}

export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeKind>
