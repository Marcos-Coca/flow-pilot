import { and, eq } from 'drizzle-orm'
import { env } from 'cloudflare:workers'
import { createFileRoute } from '@tanstack/react-router'
import { getDb } from '~/db/client'
import { type JsonValue, workflowRuns, workflows } from '~/db/schema'
import { startWorkflowRun } from '~/workflows/start-run'
import type {
  WorkflowBindings,
} from '~/workflows/types'

interface StartWorkflowRunRequest {
  workflowVersionId: string
  triggerNodeId: string
  input?: JsonValue
}

export const Route = createFileRoute('/api/workflow-runs')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const db = getDb()
        const workflowExecutor = (env as Env & WorkflowBindings).WORKFLOW_EXECUTOR
        const body = (await request.json()) as StartWorkflowRunRequest

        if (!body.workflowVersionId || !body.triggerNodeId) {
          return Response.json(
            {
              error:
                'workflowVersionId and triggerNodeId are required to start a workflow run',
            },
            { status: 400 },
          )
        }

        const workflowVersion = await db.query.workflowVersions.findFirst({
          where: (table, { eq }) => eq(table.id, body.workflowVersionId),
        })

        if (!workflowVersion) {
          return Response.json(
            { error: `Workflow version "${body.workflowVersionId}" was not found` },
            { status: 404 },
          )
        }

        const workflow = await db.query.workflows.findFirst({
          where: and(eq(workflows.id, workflowVersion.workflowId)),
        })

        if (!workflow) {
          return Response.json(
            { error: `Workflow "${workflowVersion.workflowId}" was not found` },
            { status: 404 },
          )
        }

        const run = await startWorkflowRun(db, workflowExecutor, {
          userId: workflow.userId,
          workflowId: workflow.id,
          workflowVersionId: workflowVersion.id,
          triggerNodeId: body.triggerNodeId,
          definition: workflowVersion.definition,
          input: body.input ?? null,
        })

        return Response.json(run)
      },
    },
  },
})
