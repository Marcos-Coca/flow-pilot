import type { JsonValue, WorkflowDefinition } from '~/db/schema'

export interface WorkflowExecutionPayload {
  runId: string
  userId: string
  workflowId: string
  workflowVersionId: string
  triggerNodeId: string
  definition: WorkflowDefinition
  input?: JsonValue
}

export type WorkflowNodeDefinition = WorkflowDefinition['nodes'][number]

export interface WorkflowEnv extends Env {
  DB: D1Database
}

export interface WorkflowBindings {
  WORKFLOW_EXECUTOR: Workflow<WorkflowExecutionPayload>
}
