"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Download, Loader2 } from "lucide-react";
import { TutorialScaffold } from "@/lib/types";
import { downloadSingleScaffold, calculateScaffoldCost } from "@/lib/file-utils";

type GenerationPhase = "idle" | "crawling" | "analyzing" | "generating" | "preparing" | "complete" | "error";

interface ProgressDisplayProps {
  phase: GenerationPhase;
  progress: {
    opportunitiesFound: number;
    scaffoldsGenerated: number;
    totalScaffolds: number;
  };
  error: string | null;
  scaffolds: TutorialScaffold[];
  onDownload: () => void;
  onReset: () => void;
}

export function ProgressDisplay({
  phase,
  progress,
  error,
  scaffolds,
  onDownload,
  onReset,
}: ProgressDisplayProps) {
  if (phase === "idle") {
    return null;
  }

  const phaseOrder = ["crawling", "analyzing", "generating", "preparing", "complete"];
  const currentPhaseIndex = phaseOrder.indexOf(phase);

  return (
    <div className="space-y-3 px-4">
      {/* Crawling Step */}
      <div className="flex items-center gap-3">
        {currentPhaseIndex > 0 || phase === "complete" ? (
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
        ) : phase === "crawling" ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground flex-shrink-0" />
        ) : null}
        <span className={currentPhaseIndex > 0 || phase === "complete" ? "text-green-600" : "text-muted-foreground"}>
          Crawling documentation {phase === "crawling" && <span className="text-muted-foreground/60">(~40 sec)</span>}
        </span>
      </div>

      {/* Analyzing Step */}
      {currentPhaseIndex >= 1 && (
        <div className="flex items-center gap-3">
          {currentPhaseIndex > 1 || phase === "complete" ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          ) : phase === "analyzing" ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground flex-shrink-0" />
          ) : null}
          <span className={currentPhaseIndex > 1 || phase === "complete" ? "text-green-600" : "text-muted-foreground"}>
            Analyzing pages{progress.opportunitiesFound > 0 ? ` - found ${progress.opportunitiesFound} strong tutorial topics` : ""} {phase === "analyzing" && <span className="text-muted-foreground/60">(~5 sec)</span>}
          </span>
        </div>
      )}

      {/* Generating Step */}
      {currentPhaseIndex >= 2 && (
        <div className="flex items-center gap-3">
          {currentPhaseIndex > 2 || phase === "complete" ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          ) : phase === "generating" ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground flex-shrink-0" />
          ) : null}
          <span className={currentPhaseIndex > 2 || phase === "complete" ? "text-green-600" : "text-muted-foreground"}>
            Creating tutorial scaffolds{phase === "generating" ? ` - ${progress.scaffoldsGenerated}/${progress.totalScaffolds}` : ""} {phase === "generating" && <span className="text-muted-foreground/60">(~30 sec)</span>}
          </span>
        </div>
      )}

      {/* Preparing Step */}
      {currentPhaseIndex >= 3 && phase !== "complete" && (
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">Preparing download</span>
        </div>
      )}

      {/* Complete State */}
      {phase === "complete" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-green-600 font-medium">
            <CheckCircle2 className="h-5 w-5" />
            <span>
              Created {progress.scaffoldsGenerated} tutorial scaffolds
            </span>
          </div>
          {error && (
            <div className="flex items-center gap-3 text-amber-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex gap-3">
            <Button onClick={onDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download ZIP
            </Button>
            <Button onClick={onReset} variant="outline">
              Start Over
            </Button>
          </div>
          
          {/* Individual Scaffold Cards */}
          {scaffolds.length > 0 && (
            <div className="space-y-2 pt-3 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Tutorial Scaffolds</span>
                <span className="text-xs font-medium text-muted-foreground">
                  Total: ${scaffolds.reduce((sum, scaffold) => sum + calculateScaffoldCost(scaffold), 0).toFixed(2)}
                </span>
              </div>
              <div className="space-y-1.5">
                {scaffolds.map((scaffold, index) => {
                  const cost = calculateScaffoldCost(scaffold);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 px-2.5 py-1.5 border rounded-md hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-foreground truncate">
                          {scaffold.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          ${cost.toFixed(2)}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => downloadSingleScaffold(scaffold)}
                          className="h-6 w-6"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {phase === "error" && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{error || "An error occurred"}</span>
          </div>
          {progress.scaffoldsGenerated > 0 && (
            <Button onClick={onDownload} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Partial Results ({progress.scaffoldsGenerated} scaffolds)
            </Button>
          )}
          <Button onClick={onReset} variant="outline" className="w-full">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
