import { useState } from "react";
import {
  Globe,
  MousePointerClick,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import type { WorkflowNodeType } from "./types";

type CanvasMode = "editor" | "playground";
type NodeSection = "Triggers" | "Actions";

export interface NodeTemplate {
  type: WorkflowNodeType;
  label: string;
  subtitle: string;
  section: NodeSection;
}

interface WorkflowCanvasControlsProps {
  canvasMode: CanvasMode;
  onAddNode: (template: NodeTemplate) => void;
  onSetCanvasMode: (mode: CanvasMode) => void;
  templates: NodeTemplate[];
}

export function WorkflowCanvasControls({
  canvasMode,
  onAddNode,
  onSetCanvasMode,
  templates,
}: WorkflowCanvasControlsProps) {
  const isEditorMode = canvasMode === "editor";
  const isPlaygroundMode = canvasMode === "playground";
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredTemplates = templates.filter((template) => {
    if (!normalizedSearch) return true;

    return [template.label, template.subtitle, template.section, template.type]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch);
  });
  const closeLibrary = () => {
    setIsLibraryOpen(false);
    setSearchValue("");
  };

  return (
    <Sheet
      open={isLibraryOpen}
      onOpenChange={(nextOpen) => {
        setIsLibraryOpen(nextOpen);

        if (!nextOpen) {
          setSearchValue("");
        }
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center px-4">
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-border bg-card/95 p-2 shadow-2xl shadow-foreground/10 backdrop-blur-sm">
          <div className="flex items-center rounded-xl border border-border bg-background p-1">
            <button
              onClick={() => {
                onSetCanvasMode("editor");
              }}
              className={
                isEditorMode
                  ? "rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                  : "rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              }
            >
              Editor
            </button>
            <button
              onClick={() => {
                onSetCanvasMode("playground");
              }}
              className={
                isPlaygroundMode
                  ? "rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                  : "rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              }
            >
              Playground
            </button>
          </div>

          {isEditorMode ? (
            <>
              <div className="h-8 w-px bg-border" />
              <SheetTrigger
                render={
                  <Button size="sm" variant="outline">
                    <Plus className="size-3.5" />
                    Add Node
                  </Button>
                }
              />
              <Button
                onClick={() => {
                  onSetCanvasMode("playground");
                }}
                size="sm"
              >
                Open Playground
              </Button>
            </>
          ) : null}
        </div>
      </div>
      <SheetContent
        side="right"
        showCloseButton
        className="w-full gap-0 p-0 sm:max-w-85"
      >
        <SheetHeader className="border-b border-border pr-12">
          <SheetTitle>Add nodes</SheetTitle>
          <SheetDescription>Search and add workflow steps</SheetDescription>
        </SheetHeader>

        <div className="border-b border-border p-4">
          <label className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
            <Search className="size-4 shrink-0" />
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search nodes"
              className="h-10 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {(["Triggers", "Actions"] as const).map((section) => {
              const sectionTemplates = filteredTemplates.filter(
                (template) => template.section === section,
              );

              if (!sectionTemplates.length) return null;

              return (
                <section key={section}>
                  <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {section}
                  </div>
                  <div className="space-y-2">
                    {sectionTemplates.map((template) => {
                      const Icon = getNodeLibraryIcon(template.type);

                      return (
                        <button
                          key={`${section}-${template.type}-${template.label}`}
                          onClick={() => {
                            onAddNode(template);
                            closeLibrary();
                          }}
                          className="flex w-full items-start gap-3 rounded-xl border border-border bg-background px-3 py-3 text-left transition-colors hover:border-ring/40 hover:bg-muted/40"
                        >
                          <div
                            className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${getNodeLibraryIconClassName(template.type)}`}
                          >
                            <Icon className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-medium text-foreground">
                                {template.label}
                              </div>
                              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                {getNodeCategoryLabel(template.type)}
                              </span>
                            </div>
                            <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                              {template.subtitle}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {!filteredTemplates.length ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-10 text-sm text-muted-foreground">
                No nodes found
              </div>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function getNodeLibraryIcon(type: WorkflowNodeType) {
  switch (type) {
    case "trigger.manual":
      return MousePointerClick;
    case "action.http_request":
      return Globe;
    case "action.ai_extract":
      return Sparkles;
  }
}

function getNodeLibraryIconClassName(type: WorkflowNodeType) {
  switch (type) {
    case "trigger.manual":
      return "bg-node-trigger/15 text-node-trigger";
    case "action.http_request":
      return "bg-node-action/15 text-node-action";
    case "action.ai_extract":
      return "bg-node-ai/15 text-node-ai";
  }
}

function getNodeCategoryLabel(type: WorkflowNodeType) {
  switch (type) {
    case "trigger.manual":
      return "Trigger";
    case "action.http_request":
      return "Action";
    case "action.ai_extract":
      return "AI";
  }
}
