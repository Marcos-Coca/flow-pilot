import { asc, eq } from 'drizzle-orm'
import { env } from 'cloudflare:workers'
import { createFileRoute } from '@tanstack/react-router'
import { getDb } from '~/db/client'
import { workflowRunSteps, workflowRuns } from '~/db/schema'
import type { WorkflowBindings } from '~/workflows/types'

export const Route = createFileRoute('/api/workflow-runs/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const db = getDb()
        const workflowExecutor = (env as Env & WorkflowBindings).WORKFLOW_EXECUTOR

        const run = await db.query.workflowRuns.findFirst({
          where: eq(workflowRuns.id, params.id),
        })

        if (!run) {
          return Response.json(
            { error: `Workflow run "${params.id}" was not found` },
            { status: 404 },
          )
        }

        const steps = await db.query.workflowRunSteps.findMany({
          where: eq(workflowRunSteps.runId, params.id),
          orderBy: asc(workflowRunSteps.createdAt),
        })

        let workflowInstanceStatus: unknown = null

        if (run.cloudflareWorkflowInstanceId) {
          try {
            const instance = await workflowExecutor.get(run.cloudflareWorkflowInstanceId)
            workflowInstanceStatus = await instance.status()
          } catch (error) {
            console.warn('Failed to fetch Cloudflare Workflow instance status', error)
          }
        }

        return Response.json({
          run,
          steps,
          workflowInstanceStatus,
        })
      },
    },
  },
})
