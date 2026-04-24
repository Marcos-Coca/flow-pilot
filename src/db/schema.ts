import { relations } from 'drizzle-orm'
import {
  type AnySQLiteColumn,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

const createId = () => crypto.randomUUID()
const now = () => Date.now()

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[]

export const workflowStatuses = [
  'draft',
  'active',
  'paused',
  'archived',
] as const

export const workflowRunStatuses = [
  'queued',
  'running',
  'success',
  'failed',
  'cancelled',
] as const

export const workflowRunStepStatuses = [
  'pending',
  'running',
  'success',
  'failed',
  'skipped',
] as const

export type WorkflowStatus = (typeof workflowStatuses)[number]
export type WorkflowRunStatus = (typeof workflowRunStatuses)[number]
export type WorkflowRunStepStatus = (typeof workflowRunStepStatuses)[number]

export type WorkflowDefinition = {
  nodes: Array<{
    id: string
    type: string
    name: string
    config: Record<string, unknown>
    position: {
      x: number
      y: number
    }
  }>
  edges: Array<{
    id: string
    source: string
    target: string
  }>
  metadata?: Record<string, unknown>
}

// Stores application users and the ownership boundary for future multi-user support.
export const users = sqliteTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(createId),
    email: text('email').notNull(),
    name: text('name'),
    image: text('image'),
    createdAt: integer('created_at', { mode: 'number' })
      .notNull()
      .$defaultFn(now),
    updatedAt: integer('updated_at', { mode: 'number' })
      .notNull()
      .$defaultFn(now)
      .$onUpdate(() => Date.now()),
  },
  (table) => [uniqueIndex('users_email_idx').on(table.email)],
)

// Stores the mutable workflow record and the currently published version pointer.
export const workflows = sqliteTable(
  'workflows',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(createId),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    status: text('status', { enum: workflowStatuses }).notNull(),
    createdAt: integer('created_at', { mode: 'number' })
      .notNull()
      .$defaultFn(now),
    updatedAt: integer('updated_at', { mode: 'number' })
      .notNull()
      .$defaultFn(now)
      .$onUpdate(() => Date.now()),
    publishedVersionId: text('published_version_id').references(
      (): AnySQLiteColumn => workflowVersions.id,
      { onDelete: 'set null' },
    ),
  },
  (table) => [
    index('workflows_user_id_idx').on(table.userId),
    index('workflows_published_version_id_idx').on(table.publishedVersionId),
  ],
)

// Stores immutable snapshots of workflow graph + canvas state for execution history.
export const workflowVersions = sqliteTable(
  'workflow_versions',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(createId),
    workflowId: text('workflow_id')
      .notNull()
      .references(() => workflows.id, { onDelete: 'cascade' }),
    versionNumber: integer('version_number').notNull(),
    definition: text('definition', { mode: 'json' })
      .$type<WorkflowDefinition>()
      .notNull(),
    createdAt: integer('created_at', { mode: 'number' })
      .notNull()
      .$defaultFn(now),
    createdByUserId: text('created_by_user_id')
      .notNull()
      .references(() => users.id),
  },
  (table) => [
    index('workflow_versions_workflow_id_idx').on(table.workflowId),
    index('workflow_versions_created_by_user_id_idx').on(table.createdByUserId),
    uniqueIndex('workflow_versions_workflow_id_version_number_idx').on(
      table.workflowId,
      table.versionNumber,
    ),
  ],
)

// Stores each workflow execution and ties it back to the exact version that ran.
export const workflowRuns = sqliteTable(
  'workflow_runs',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(createId),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    workflowId: text('workflow_id')
      .notNull()
      .references(() => workflows.id, { onDelete: 'cascade' }),
    workflowVersionId: text('workflow_version_id')
      .notNull()
      .references(() => workflowVersions.id, { onDelete: 'cascade' }),
    cloudflareWorkflowInstanceId: text('cloudflare_workflow_instance_id'),
    triggerNodeId: text('trigger_node_id'),
    status: text('status', { enum: workflowRunStatuses }).notNull(),
    input: text('input', { mode: 'json' }).$type<JsonValue>(),
    output: text('output', { mode: 'json' }).$type<JsonValue>(),
    error: text('error', { mode: 'json' }).$type<JsonValue>(),
    startedAt: integer('started_at', { mode: 'number' }),
    finishedAt: integer('finished_at', { mode: 'number' }),
    createdAt: integer('created_at', { mode: 'number' })
      .notNull()
      .$defaultFn(now),
  },
  (table) => [
    index('workflow_runs_user_id_idx').on(table.userId),
    index('workflow_runs_workflow_id_idx').on(table.workflowId),
    index('workflow_runs_workflow_version_id_idx').on(table.workflowVersionId),
    index('workflow_runs_cloudflare_workflow_instance_id_idx').on(
      table.cloudflareWorkflowInstanceId,
    ),
    index('workflow_runs_created_at_idx').on(table.createdAt),
  ],
)

// Stores per-node execution logs so individual step inputs, outputs, and failures are traceable.
export const workflowRunSteps = sqliteTable(
  'workflow_run_steps',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(createId),
    runId: text('run_id')
      .notNull()
      .references(() => workflowRuns.id, { onDelete: 'cascade' }),
    nodeId: text('node_id').notNull(),
    nodeType: text('node_type').notNull(),
    nodeName: text('node_name').notNull(),
    status: text('status', { enum: workflowRunStepStatuses }).notNull(),
    input: text('input', { mode: 'json' }).$type<JsonValue>(),
    output: text('output', { mode: 'json' }).$type<JsonValue>(),
    error: text('error', { mode: 'json' }).$type<JsonValue>(),
    startedAt: integer('started_at', { mode: 'number' }),
    finishedAt: integer('finished_at', { mode: 'number' }),
    createdAt: integer('created_at', { mode: 'number' })
      .notNull()
      .$defaultFn(now),
  },
  (table) => [
    index('workflow_run_steps_run_id_idx').on(table.runId),
    index('workflow_run_steps_node_id_idx').on(table.nodeId),
    index('workflow_run_steps_created_at_idx').on(table.createdAt),
  ],
)

export const schema = {
  users,
  workflows,
  workflowVersions,
  workflowRuns,
  workflowRunSteps,
}

export const usersRelations = relations(users, ({ many }) => ({
  workflows: many(workflows),
  workflowRuns: many(workflowRuns),
  authoredWorkflowVersions: many(workflowVersions),
}))

export const workflowsRelations = relations(workflows, ({ one, many }) => ({
  user: one(users, {
    fields: [workflows.userId],
    references: [users.id],
  }),
  versions: many(workflowVersions, {
    relationName: 'workflow_versions',
  }),
  runs: many(workflowRuns),
  publishedVersion: one(workflowVersions, {
    fields: [workflows.publishedVersionId],
    references: [workflowVersions.id],
    relationName: 'workflow_published_version',
  }),
}))

export const workflowVersionsRelations = relations(
  workflowVersions,
  ({ one, many }) => ({
    workflow: one(workflows, {
      fields: [workflowVersions.workflowId],
      references: [workflows.id],
      relationName: 'workflow_versions',
    }),
    createdByUser: one(users, {
      fields: [workflowVersions.createdByUserId],
      references: [users.id],
    }),
    runs: many(workflowRuns),
    publishedForWorkflows: many(workflows, {
      relationName: 'workflow_published_version',
    }),
  }),
)

export const workflowRunsRelations = relations(workflowRuns, ({ one, many }) => ({
  user: one(users, {
    fields: [workflowRuns.userId],
    references: [users.id],
  }),
  workflow: one(workflows, {
    fields: [workflowRuns.workflowId],
    references: [workflows.id],
  }),
  workflowVersion: one(workflowVersions, {
    fields: [workflowRuns.workflowVersionId],
    references: [workflowVersions.id],
  }),
  steps: many(workflowRunSteps),
}))

export const workflowRunStepsRelations = relations(
  workflowRunSteps,
  ({ one }) => ({
    run: one(workflowRuns, {
      fields: [workflowRunSteps.runId],
      references: [workflowRuns.id],
    }),
  }),
)

export type SelectUser = typeof users.$inferSelect
export type InsertUser = typeof users.$inferInsert

export type SelectWorkflow = typeof workflows.$inferSelect
export type InsertWorkflow = typeof workflows.$inferInsert

export type SelectWorkflowVersion = typeof workflowVersions.$inferSelect
export type InsertWorkflowVersion = typeof workflowVersions.$inferInsert

export type SelectWorkflowRun = typeof workflowRuns.$inferSelect
export type InsertWorkflowRun = typeof workflowRuns.$inferInsert

export type SelectWorkflowRunStep = typeof workflowRunSteps.$inferSelect
export type InsertWorkflowRunStep = typeof workflowRunSteps.$inferInsert
