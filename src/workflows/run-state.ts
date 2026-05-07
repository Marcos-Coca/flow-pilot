import { and, eq } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import {
  type JsonValue,
  schema,
  workflowRuns,
  workflowRunSteps,
} from '~/db/schema'
import type { WorkflowNodeDefinition } from './types'

type Database = DrizzleD1Database<typeof schema>
type WorkflowRunStepRecord = InferSelectModel<typeof workflowRunSteps>

export async function markRunRunning(db: Database, runId: string) {
  await db
    .update(workflowRuns)
    .set({
      status: 'running',
      startedAt: Date.now(),
      error: null,
    })
    .where(eq(workflowRuns.id, runId))
}

export async function markRunSuccess(
  db: Database,
  runId: string,
  output: JsonValue,
) {
  await db
    .update(workflowRuns)
    .set({
      status: 'success',
      output,
      finishedAt: Date.now(),
      error: null,
    })
    .where(eq(workflowRuns.id, runId))
}

export async function markRunFailed(
  db: Database,
  runId: string,
  error: unknown,
) {
  await db
    .update(workflowRuns)
    .set({
      status: 'failed',
      error: serializeError(error),
      finishedAt: Date.now(),
    })
    .where(eq(workflowRuns.id, runId))
}

export async function markStepRunning(
  db: Database,
  runId: string,
  node: WorkflowNodeDefinition,
) {
  await upsertStep(db, runId, node, {
    status: 'running',
    startedAt: Date.now(),
    error: null,
  })
}

export async function markStepSuccess(
  db: Database,
  runId: string,
  node: WorkflowNodeDefinition,
  output: JsonValue,
) {
  await upsertStep(db, runId, node, {
    status: 'success',
    output,
    finishedAt: Date.now(),
    error: null,
  })
}

export async function markStepFailed(
  db: Database,
  runId: string,
  node: WorkflowNodeDefinition,
  error: unknown,
) {
  await upsertStep(db, runId, node, {
    status: 'failed',
    finishedAt: Date.now(),
    error: serializeError(error),
  })
}

export async function createPendingSteps(
  db: Database,
  runId: string,
  nodes: WorkflowNodeDefinition[],
) {
  if (nodes.length === 0) {
    return
  }

  await db.insert(workflowRunSteps).values(
    nodes.map((node) => ({
      id: crypto.randomUUID(),
      runId,
      nodeId: node.id,
      nodeType: node.type,
      nodeName: node.name,
      status: 'pending' as const,
      createdAt: Date.now(),
    })),
  )
}

async function upsertStep(
  db: Database,
  runId: string,
  node: WorkflowNodeDefinition,
  values: Partial<typeof workflowRunSteps.$inferInsert>,
) {
  const existing = await findStepRecord(db, runId, node.id)

  if (existing) {
    await db
      .update(workflowRunSteps)
      .set(values)
      .where(eq(workflowRunSteps.id, existing.id))

    return
  }

  await db.insert(workflowRunSteps).values({
    id: crypto.randomUUID(),
    runId,
    nodeId: node.id,
    nodeType: node.type,
    nodeName: node.name,
    status: values.status ?? 'pending',
    input: values.input,
    output: values.output,
    error: values.error,
    startedAt: values.startedAt,
    finishedAt: values.finishedAt,
    createdAt: Date.now(),
  })
}

async function findStepRecord(
  db: Database,
  runId: string,
  nodeId: string,
): Promise<WorkflowRunStepRecord | undefined> {
  return db.query.workflowRunSteps.findFirst({
    where: and(
      eq(workflowRunSteps.runId, runId),
      eq(workflowRunSteps.nodeId, nodeId),
    ),
  })
}

function serializeError(error: unknown): JsonValue {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ?? null,
    }
  }

  if (
    error === null ||
    typeof error === 'string' ||
    typeof error === 'number' ||
    typeof error === 'boolean'
  ) {
    return error
  }

  if (Array.isArray(error)) {
    return error.map(serializeError)
  }

  if (typeof error === 'object') {
    return Object.fromEntries(
      Object.entries(error).map(([key, value]) => [key, serializeError(value)]),
    )
  }

  return String(error)
}
