import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { cn } from "~/lib/utils";
import {
  isTerminalRunStatus,
  playgroundRunDetailsQueryOptions,
} from "~/services/workflow-runs";

import { usePlaygroundRun } from "./PlaygroundRunContext";

type CanvasMode = "editor" | "playground";

export function WorkflowPlaygroundSummaryPanel({
  canvasMode,
}: {
  canvasMode: CanvasMode;
}) {
  const {
    currentRunId,
    errorMessage,
    isExecuting,
    setErrorMessage,
    setIsExecuting,
  } = usePlaygroundRun();
  const runDetailsQuery = useQuery({
    ...playgroundRunDetailsQueryOptions(currentRunId ?? ""),
    enabled: currentRunId !== null,
    refetchInterval: (query) => {
      const details = query.state.data;

      if (!details) return 600;

      return isTerminalRunStatus(details.run.status) ? false : 600;
    },
  });
  const playgroundRun = runDetailsQuery.data ?? null;
  const statusText = isExecuting
    ? "Running..."
    : (playgroundRun?.run.status ?? "Ready");

  useEffect(() => {
    if (!runDetailsQuery.error) return;

    setIsExecuting(false);
    setErrorMessage(
      runDetailsQuery.error instanceof Error
        ? runDetailsQuery.error.message
        : "Something went wrong while loading the run details.",
    );
  }, [runDetailsQuery.error, setErrorMessage, setIsExecuting]);

  useEffect(() => {
    if (!playgroundRun) return;

    if (isTerminalRunStatus(playgroundRun.run.status)) {
      setIsExecuting(false);
    }
  }, [playgroundRun, setIsExecuting]);

  if (canvasMode !== "playground") {
    return null;
  }

  return (
    <div className="pointer-events-none absolute right-4 top-16 z-10 w-[360px] max-w-[calc(100vw-2rem)]">
      <div className="pointer-events-auto rounded-2xl border border-border bg-card/95 p-4 shadow-2xl shadow-foreground/10 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Playground execution</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Run the manual trigger from its inspector to see a live summary
              of the workflow execution.
            </p>
          </div>
          {isExecuting ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : null}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div
            className={cn(
              "rounded-full border px-2.5 py-1 text-sm font-medium",
              getPlaygroundStatusClasses(playgroundRun?.run.status, isExecuting),
            )}
          >
            {statusText}
          </div>
          {playgroundRun ? (
            <div className="text-[11px] text-muted-foreground">
              Temp run {playgroundRun.run.id.slice(0, 8)}
            </div>
          ) : null}
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {errorMessage}
          </div>
        ) : null}

        {playgroundRun ? (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <PlaygroundMetric
                label="Run status"
                value={playgroundRun.run.status}
              />
              <PlaygroundMetric
                label="Workflow"
                value={playgroundRun.run.workflowId.slice(0, 8)}
              />
              <PlaygroundMetric
                label="Version"
                value={playgroundRun.run.workflowVersionId.slice(0, 8)}
              />
              <PlaygroundMetric
                label="Instance"
                value={playgroundRun.workflowInstanceStatus?.status ?? "unknown"}
              />
            </div>

            <div>
              <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Steps
              </div>
              <div className="space-y-2">
                {playgroundRun.steps.map((step) => (
                  <div
                    key={step.id}
                    className="rounded-xl border border-border bg-background px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-medium">{step.nodeName}</div>
                        <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                          {step.nodeType}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                          getStepStatusClasses(step.status),
                        )}
                      >
                        {step.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Output
              </div>
              <pre className="max-h-48 overflow-auto rounded-xl border border-border bg-background p-3 text-[11px] leading-relaxed text-muted-foreground">
                {JSON.stringify(playgroundRun.run.output, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-background/70 px-3 py-6 text-center text-xs text-muted-foreground">
            No run yet. Select the manual trigger node and execute it from the
            inspector to populate this summary.
          </div>
        )}
      </div>
    </div>
  );
}

function getPlaygroundStatusClasses(
  status: string | undefined,
  isExecuting: boolean,
) {
  if (isExecuting || status === "running" || status === "queued") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-700";
  }

  if (status === "success") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700";
  }

  if (status === "failed" || status === "cancelled") {
    return "border-destructive/30 bg-destructive/10 text-destructive";
  }

  return "border-border bg-background text-muted-foreground";
}

function getStepStatusClasses(status: string) {
  switch (status) {
    case "success":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700";
    case "failed":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "running":
    case "pending":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700";
    default:
      return "border-border bg-background text-muted-foreground";
  }
}

function PlaygroundMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-xs text-foreground">{value}</div>
    </div>
  );
}
