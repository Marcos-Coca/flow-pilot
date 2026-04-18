import { Globe, Search, Sparkles, Zap } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";

import type { WorkflowNodeData, WorkflowNodeKind } from "./types";

type NodeSection = "Triggers" | "Actions";

export interface NodeTemplate {
  type: WorkflowNodeData["type"];
  label: string;
  subtitle: string;
  section: NodeSection;
}

interface NodeLibraryPanelProps {
  onAddNode: (template: NodeTemplate) => void;
  onClose: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  templates: NodeTemplate[];
  open: boolean;
}

const iconMap: Record<WorkflowNodeKind, typeof Zap> = {
  trigger: Zap,
  action: Globe,
  ai: Sparkles,
};

const colorMap: Record<WorkflowNodeKind, string> = {
  trigger: "text-node-trigger bg-node-trigger/15",
  action: "text-node-action bg-node-action/15",
  ai: "text-node-ai bg-node-ai/15",
};

const typeLabels: Record<WorkflowNodeKind, string> = {
  trigger: "Trigger",
  action: "Action",
  ai: "AI",
};

export function NodeLibraryPanel({
  onAddNode,
  onClose,
  searchValue,
  onSearchChange,
  templates,
  open,
}: NodeLibraryPanelProps) {
  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredTemplates = templates.filter((template) => {
    if (!normalizedSearch) return true;

    return [template.label, template.subtitle, template.section, template.type]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch);
  });

  const sections: NodeSection[] = ["Triggers", "Actions"];

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton
        className="w-full gap-0 p-0 sm:max-w-[340px]"
      >
        <SheetHeader className="border-b border-border pr-12">
          <SheetTitle>Add nodes</SheetTitle>
          <SheetDescription>
            Search and add workflow steps
          </SheetDescription>
        </SheetHeader>

        <div className="border-b border-border p-4">
          <label className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
            <Search className="size-4 shrink-0" />
            <input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search nodes"
              className="h-10 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {sections.map((section) => {
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
                      const Icon = iconMap[template.type];

                      return (
                        <button
                          key={`${section}-${template.type}-${template.label}`}
                          onClick={() => onAddNode(template)}
                          className="flex w-full items-start gap-3 rounded-xl border border-border bg-background px-3 py-3 text-left transition-colors hover:border-ring/40 hover:bg-muted/40"
                        >
                          <div
                            className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${colorMap[template.type]}`}
                          >
                            <Icon className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-medium text-foreground">
                                {template.label}
                              </div>
                              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                {typeLabels[template.type]}
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
