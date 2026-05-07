import type { JsonValue } from '~/db/schema'
import type { WorkflowNodeDefinition } from './types'

interface ExecuteNodeContext {
  runId: string
  workflowId: string
  workflowVersionId: string
  workflowInput?: JsonValue
  previousOutput?: JsonValue
}

export async function executeNode(
  node: WorkflowNodeDefinition,
  context: ExecuteNodeContext,
): Promise<JsonValue> {
  switch (node.type) {
    case 'trigger.manual':
    case 'trigger.schedule':
    case 'trigger.gmail_new_email':
      return {
        ok: true,
        kind: 'trigger',
        nodeId: node.id,
        nodeType: node.type,
        input: context.workflowInput ?? null,
      }
    case 'action.http_request':
      return executeHttpRequestNode(node, context)
    case 'action.ai_extract':
    case 'action.ai_summarize':
    case 'action.gmail_send_email':
    case 'action.google_sheets_append_row':
      return {
        ok: true,
        kind: 'stub',
        nodeId: node.id,
        nodeType: node.type,
        message: `Node "${node.type}" is not implemented yet, so this step completed with a stubbed result.`,
        input: context.previousOutput ?? context.workflowInput ?? null,
      }
    default:
      return {
        ok: true,
        kind: 'noop',
        nodeId: node.id,
        nodeType: node.type,
        message: `No executor exists for "${node.type}" yet.`,
        config: sanitizeJsonValue(node.config),
      }
  }
}

async function executeHttpRequestNode(
  node: WorkflowNodeDefinition,
  context: ExecuteNodeContext,
): Promise<JsonValue> {
  const url = readStringConfig(node.config.url)

  if (!url) {
    return {
      ok: true,
      kind: 'stub',
      nodeId: node.id,
      nodeType: node.type,
      message:
        'HTTP request node has no "url" config yet, so the step completed with a stubbed result.',
      input: context.previousOutput ?? context.workflowInput ?? null,
    }
  }

  const method = readStringConfig(node.config.method)?.toUpperCase() ?? 'GET'
  const headers = readHeadersConfig(node.config.headers)
  const body = getRequestBody(node.config.body)

  const response = await fetch(url, {
    method,
    headers,
    body,
  })

  const responseText = await response.text()

  return {
    ok: response.ok,
    kind: 'http-response',
    nodeId: node.id,
    nodeType: node.type,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    body: responseText,
  }
}

function readStringConfig(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function readHeadersConfig(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }

  const headers = Object.entries(value).reduce<Record<string, string>>(
    (result, [key, headerValue]) => {
      if (typeof headerValue === 'string') {
        result[key] = headerValue
      }

      return result
    },
    {},
  )

  return Object.keys(headers).length > 0 ? headers : undefined
}

function getRequestBody(value: unknown): BodyInit | undefined {
  if (typeof value === 'string') {
    return value
  }

  if (value === undefined) {
    return undefined
  }

  return JSON.stringify(sanitizeJsonValue(value))
}

function sanitizeJsonValue(value: unknown): JsonValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeJsonValue)
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        sanitizeJsonValue(nestedValue),
      ]),
    )
  }

  return String(value)
}
