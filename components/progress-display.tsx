"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Download, Loader2 } from "lucide-react";

type GenerationPhase = "idle" | "crawling" | "analyzing" | "generating" | "preparing" | "complete" | "error";

interface ProgressDisplayProps {
  phase: GenerationPhase;
  progress: {
    opportunitiesFound: number;
    scaffoldsGenerated: number;
    totalScaffolds: number;
  };
  error: string | null;
  onDownload: () => void;
  onReset: () => void;
}

export function ProgressDisplay({
  phase,
  progress,
  error,
  onDownload,
  onReset,
}: ProgressDisplayProps) {
  if (phase === "idle") {
    return null;
  }

  return (
    <div className="space-y-4">
      {phase === "crawling" && (
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Crawling documentation...</span>
        </div>
      )}

      {phase === "analyzing" && (
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Analyzing pages...</span>
        </div>
      )}

      {(phase === "generating" || phase === "analyzing") && progress.opportunitiesFound > 0 && (
        <div className="flex items-center gap-3 text-muted-foreground">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span>Found {progress.opportunitiesFound} tutorial opportunities</span>
        </div>
      )}

      {phase === "generating" && (
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>
            Generating tutorial scaffolds... {progress.scaffoldsGenerated}/{progress.totalScaffolds}
          </span>
        </div>
      )}

      {phase === "preparing" && (
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Preparing download...</span>
        </div>
      )}

      {phase === "complete" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">
              Generated {progress.scaffoldsGenerated} tutorial scaffolds
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
        </div>
      )}

      {phase === "error" && (
        <div className="space-y-4">
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
