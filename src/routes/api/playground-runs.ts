import { env } from 'cloudflare:workers'
import { createFileRoute } from '@tanstack/react-router'
import { getDb } from '~/db/client'
import type { JsonValue, WorkflowDefinition } from '~/db/schema'
import { createPlaygroundWorkflowRun } from '~/workflows/start-run'
import type { WorkflowBindings } from '~/workflows/types'

interface CreatePlaygroundRunRequest {
  definition: WorkflowDefinition
  triggerNodeId: string
  input?: JsonValue
}

export const Route = createFileRoute('/api/playground-runs')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const db = getDb()
        const workflowExecutor = (env as Env & WorkflowBindings).WORKFLOW_EXECUTOR
        const body = (await request.json()) as CreatePlaygroundRunRequest

        if (!body.definition || !body.triggerNodeId) {
          return Response.json(
            {
              error: 'definition and triggerNodeId are required to execute the playground workflow',
            },
            { status: 400 },
          )
        }

        const run = await createPlaygroundWorkflowRun(db, workflowExecutor, {
          definition: body.definition,
          triggerNodeId: body.triggerNodeId,
          input: body.input ?? null,
        })

        return Response.json(run)
      },
    },
  },
})
