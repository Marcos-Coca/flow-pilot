import { queryOptions } from "@tanstack/react-query";
import type { WorkflowDefinition, WorkflowRunStatus } from "~/db/schema";

import { apiClient } from "./api-client";

type WorkflowInstanceStatus =
  | "queued"
  | "running"
  | "paused"
  | "errored"
  | "terminated"
  | "complete"
  | "waiting"
  | "waitingForPause"
  | "unknown";

interface RunStepSummary {
  id: string;
  nodeId: string;
  nodeType: string;
  nodeName: string;
  status: string;
  output: unknown;
  error: unknown;
}

export interface PlaygroundRunDetails {
  run: {
    id: string;
    status: WorkflowRunStatus;
    workflowId: string;
    workflowVersionId: string;
    startedAt: number | null;
    finishedAt: number | null;
    output: unknown;
    error: unknown;
  };
  steps: RunStepSummary[];
  workflowInstanceStatus: {
    status: WorkflowInstanceStatus;
    error?: unknown;
    output?: unknown;
  } | null;
}

export interface CreatePlaygroundRunInput {
  definition: WorkflowDefinition;
  triggerNodeId: string;
}

export async function createPlaygroundRun({
  definition,
  triggerNodeId,
}: CreatePlaygroundRunInput) {
  return apiClient
    .post<{ runId: string }>("/playground-runs", {
      definition,
      triggerNodeId,
      input: {
        source: "playground",
        triggeredAt: new Date().toISOString(),
      },
    })
    .then((response) => response.data);
}

export const playgroundRunDetailsQueryOptions = (runId: string) =>
  queryOptions({
    queryKey: ["playground-run", runId],
    queryFn: () =>
      apiClient
        .get<PlaygroundRunDetails>(`/workflow-runs/${runId}`)
        .then((response) => response.data),
  });

export function isTerminalRunStatus(status: WorkflowRunStatus) {
  return status === "success" || status === "failed" || status === "cancelled";
}
