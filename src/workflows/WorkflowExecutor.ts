import { WorkflowEntrypoint, type WorkflowStep } from 'cloudflare:workers'
import { getDb } from '~/db/client'
import type { JsonValue } from '~/db/schema'
import { buildLinearExecutionPlan } from './execution-plan'
import { executeNode } from './executors'
import {
  markRunFailed,
  markRunRunning,
  markRunSuccess,
  markStepFailed,
  markStepRunning,
  markStepSuccess,
} from './run-state'
import type { WorkflowEnv, WorkflowExecutionPayload } from './types'

export class WorkflowExecutor extends WorkflowEntrypoint<
  WorkflowEnv,
  WorkflowExecutionPayload
> {
  async run(
    event: Readonly<{ payload: WorkflowExecutionPayload }>,
    step: WorkflowStep,
  ) {
    const payload = event.payload
    const db = getDb(this.env.DB)
    const executionPlan = buildLinearExecutionPlan(
      payload.definition,
      payload.triggerNodeId,
    )

    let previousOutput: JsonValue = payload.input ?? null
    const stepOutputs: Record<string, JsonValue> = {}

    try {
      await step.do('mark-run-running', async () => {
        await markRunRunning(db, payload.runId)
        return { ok: true }
      })

      for (const node of executionPlan) {
        previousOutput = (await step.do<any>(`execute-${node.id}`, async () => {
          await markStepRunning(db, payload.runId, node)

          try {
            const output = await executeNode(node, {
              runId: payload.runId,
              workflowId: payload.workflowId,
              workflowVersionId: payload.workflowVersionId,
              workflowInput: payload.input,
              previousOutput,
            })

            await markStepSuccess(db, payload.runId, node, output)
            return output
          } catch (error) {
            await markStepFailed(db, payload.runId, node, error)
            throw error
          }
        })) as JsonValue

        stepOutputs[node.id] = previousOutput
      }

      await step.do('mark-run-success', async () => {
        await markRunSuccess(db, payload.runId, {
          steps: stepOutputs,
          lastOutput: previousOutput,
        })

        return { ok: true }
      })
    } catch (error) {
      await step.do('mark-run-failed', async () => {
        await markRunFailed(db, payload.runId, error)
        return { ok: false }
      })

      throw error
    }
  }
}
