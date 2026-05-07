import type { WorkflowDefinition } from '~/db/schema'
import type { WorkflowNodeDefinition } from './types'

export function buildLinearExecutionPlan(
  definition: WorkflowDefinition,
  triggerNodeId: string,
): WorkflowNodeDefinition[] {
  const nodesById = new Map(definition.nodes.map((node) => [node.id, node]))
  const outgoingEdges = new Map<string, WorkflowDefinition['edges']>()

  for (const edge of definition.edges) {
    const current = outgoingEdges.get(edge.source) ?? []
    current.push(edge)
    outgoingEdges.set(edge.source, current)
  }

  const triggerNode = nodesById.get(triggerNodeId)
  if (!triggerNode) {
    throw new Error(`Trigger node "${triggerNodeId}" does not exist in the workflow definition`)
  }

  const plan: WorkflowNodeDefinition[] = []
  const visited = new Set<string>()
  let currentNode: WorkflowNodeDefinition | undefined = triggerNode

  while (currentNode) {
    if (visited.has(currentNode.id)) {
      throw new Error(`Workflow contains a cycle at node "${currentNode.id}"`)
    }

    visited.add(currentNode.id)
    plan.push(currentNode)

    const nextEdges = outgoingEdges.get(currentNode.id) ?? []
    if (nextEdges.length === 0) {
      break
    }

    if (nextEdges.length > 1) {
      throw new Error(
        `Workflow branching is not supported yet. Node "${currentNode.id}" has ${nextEdges.length} outgoing edges`,
      )
    }

    const nextNode = nodesById.get(nextEdges[0].target)
    if (!nextNode) {
      throw new Error(
        `Edge "${nextEdges[0].id}" points to missing node "${nextEdges[0].target}"`,
      )
    }

    currentNode = nextNode
  }

  return plan
}
