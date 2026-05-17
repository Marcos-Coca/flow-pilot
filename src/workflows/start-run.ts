import { eq } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { schema, users, workflowRuns, workflows, workflowVersions } from '~/db/schema'
import { buildLinearExecutionPlan } from './execution-plan'
import { createPendingSteps } from './run-state'
import type {
  WorkflowBindings,
  WorkflowExecutionPayload,
  WorkflowEnv,
} from './types'

type Database = DrizzleD1Database<typeof schema>

interface StartWorkflowRunInput {
  userId: string
  workflowId: string
  workflowVersionId: string
  triggerNodeId: string
  definition: WorkflowExecutionPayload['definition']
  input?: WorkflowExecutionPayload['input']
}

interface CreatePlaygroundRunInput {
  definition: WorkflowExecutionPayload['definition']
  triggerNodeId: string
  input?: WorkflowExecutionPayload['input']
}

const PLAYGROUND_USER_ID = 'playground-user'

export async function startWorkflowRun(
  db: Database,
  workflowExecutor: WorkflowBindings['WORKFLOW_EXECUTOR'],
  input: StartWorkflowRunInput,
) {
  const executionPlan = buildLinearExecutionPlan(
    input.definition,
    input.triggerNodeId,
  )

  const runId = crypto.randomUUID()

  await db.insert(workflowRuns).values({
    id: runId,
    userId: input.userId,
    workflowId: input.workflowId,
    workflowVersionId: input.workflowVersionId,
    triggerNodeId: input.triggerNodeId,
    status: 'queued',
    input: input.input ?? null,
    createdAt: Date.now(),
  })

  await createPendingSteps(db, runId, executionPlan)

  const payload: WorkflowExecutionPayload = {
    runId,
    userId: input.userId,
    workflowId: input.workflowId,
    workflowVersionId: input.workflowVersionId,
    triggerNodeId: input.triggerNodeId,
    definition: input.definition,
    input: input.input ?? null,
  }

  const instance = await workflowExecutor.create({
    id: runId,
    params: payload,
  })

  await db
    .update(workflowRuns)
    .set({
      cloudflareWorkflowInstanceId: instance.id,
    })
    .where(eq(workflowRuns.id, runId))

  return {
    runId,
    instanceId: instance.id,
    workflowId: input.workflowId,
    workflowVersionId: input.workflowVersionId,
    stepCount: executionPlan.length,
    status: await instance.status(),
  }
}

export async function createPlaygroundWorkflowRun(
  db: Database,
  workflowExecutor: WorkflowBindings['WORKFLOW_EXECUTOR'],
  input: CreatePlaygroundRunInput,
) {
  await ensurePlaygroundUser(db)

  const workflowId = crypto.randomUUID()
  const workflowVersionId = crypto.randomUUID()
  const now = Date.now()

  await db.insert(workflows).values({
    id: workflowId,
    userId: PLAYGROUND_USER_ID,
    name: `Playground Run ${new Date(now).toISOString()}`,
    description: 'Temporary workflow created from the playground for execution testing',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    publishedVersionId: null,
  })

  await db.insert(workflowVersions).values({
    id: workflowVersionId,
    workflowId,
    versionNumber: 1,
    definition: {
      ...input.definition,
      metadata: {
        ...input.definition.metadata,
        source: 'playground',
        temporary: true,
      },
    },
    createdAt: now,
    createdByUserId: PLAYGROUND_USER_ID,
  })

  await db
    .update(workflows)
    .set({
      publishedVersionId: workflowVersionId,
      updatedAt: Date.now(),
    })
    .where(eq(workflows.id, workflowId))

  return startWorkflowRun(db, workflowExecutor, {
    userId: PLAYGROUND_USER_ID,
    workflowId,
    workflowVersionId,
    triggerNodeId: input.triggerNodeId,
    definition: input.definition,
    input: input.input,
  })
}

async function ensurePlaygroundUser(db: Database) {
  await db
    .insert(users)
    .values({
      id: PLAYGROUND_USER_ID,
      email: 'playground@flow-pilot.local',
      name: 'Playground User',
      image: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    .onConflictDoNothing({
      target: users.id,
    })
}
