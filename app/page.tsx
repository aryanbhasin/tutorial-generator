"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp } from "lucide-react";
import { SettingsPopover } from "@/components/settings-popover";
import { ProgressDisplay } from "@/components/progress-display";
import { GenerationSettings, TutorialScaffold, TutorialOpportunity } from "@/lib/types";
import { createZipFile, downloadBlob } from "@/lib/file-utils";

type GenerationPhase = "idle" | "crawling" | "analyzing" | "generating" | "preparing" | "complete" | "error";

export default function Home() {
  const [url, setUrl] = useState("");
  const [settings, setSettings] = useState<GenerationSettings>({
    maxPages: 10,
    tutorialType: "balanced",
  });
  const [phase, setPhase] = useState<GenerationPhase>("idle");
  const [progress, setProgress] = useState({
    opportunitiesFound: 0,
    scaffoldsGenerated: 0,
    totalScaffolds: 0,
  });
  const [scaffolds, setScaffolds] = useState<TutorialScaffold[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setPhase("crawling");
      setError(null);

      const crawlResponse = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          maxPages: settings.maxPages,
        }),
      });

      if (!crawlResponse.ok) {
        throw new Error("Failed to crawl documentation");
      }

      const { pages } = await crawlResponse.json();

      setPhase("analyzing");

      const BATCH_SIZE = 5;
      const batches = [];
      for (let i = 0; i < pages.length; i += BATCH_SIZE) {
        batches.push(pages.slice(i, i + BATCH_SIZE));
      }

      // calculate opportunities per batch to target ~50-70% of page count
      // for 5 pages: ~3 tutorials, for 10 pages: ~6 tutorials
      const totalTargetOpportunities = Math.max(4, Math.ceil(pages.length * 0.7));
      const opportunitiesPerBatch = Math.max(3, Math.ceil(totalTargetOpportunities / batches.length));

      const analysisPromises = batches.map((batch) =>
        fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pages: batch.map((p: { id: string; title: string; url: string }) => ({
              id: p.id,
              title: p.title,
              url: p.url,
            })),
            opportunitiesPerBatch,
            tutorialType: settings.tutorialType,
          }),
        }).then((res) => res.json())
      );

      const analysisResults = await Promise.allSettled(analysisPromises);
      const allOpportunities = analysisResults
        .filter((result): result is PromiseFulfilledResult<{ opportunities: TutorialOpportunity[] }> => result.status === "fulfilled")
        .flatMap((result) => result.value.opportunities);

      setProgress((prev) => ({
        ...prev,
        opportunitiesFound: allOpportunities.length,
        totalScaffolds: allOpportunities.length,
      }));

      setPhase("generating");

      const generateScaffold = async (opportunity: TutorialOpportunity) => {
        const contextPages = pages.filter((p: { id: string }) =>
          opportunity.referencedPageIds.includes(p.id)
        );

        const response = await fetch("/api/generate-scaffold", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            opportunity,
            contextPages,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate scaffold for ${opportunity.topic}`);
        }

        const { scaffold } = await response.json();

        setProgress((prev) => ({
          ...prev,
          scaffoldsGenerated: prev.scaffoldsGenerated + 1,
        }));

        return scaffold;
      };

      // Run all scaffold generation in parallel for speed
      const scaffoldResults = await Promise.allSettled(
        allOpportunities.map(opp => generateScaffold(opp))
      );

      const successfulScaffolds = scaffoldResults
        .filter((result): result is PromiseFulfilledResult<TutorialScaffold> => result.status === "fulfilled")
        .map((result) => result.value);

      setScaffolds(successfulScaffolds);
      setPhase("complete");

      if (successfulScaffolds.length < allOpportunities.length) {
        const failed = allOpportunities.length - successfulScaffolds.length;
        setError(`Generated ${successfulScaffolds.length} of ${allOpportunities.length} tutorials (${failed} failed)`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setPhase("error");
    }
  };

  const handleDownload = async () => {
    try {
      setPhase("preparing");
      const zipBlob = await createZipFile(scaffolds);
      downloadBlob(zipBlob, "tutorial-scaffolds.zip");
      setPhase("complete");
    } catch (err) {
      setError("Failed to create download file");
      setPhase("error");
    }
  };

  const handleReset = () => {
    setPhase("idle");
    setUrl("");
    setProgress({ opportunitiesFound: 0, scaffoldsGenerated: 0, totalScaffolds: 0 });
    setScaffolds([]);
    setError(null);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Tutorial Generator Logo"
              width={60}
              height={60}
              priority
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Tutorial Generator</h1>
            <p className="text-muted-foreground">
              Turn documentation into tutorial scaffolds | Built for NS
            </p>
          </div>
        </div>

        <div className="relative">
          <SettingsPopover settings={settings} onSettingsChange={setSettings} />
          <Input
            type="url"
            placeholder="Enter documentation URL (e.g., https://docs.example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={phase !== "idle"}
            className="pr-12 pl-12 py-6 rounded-full text-lg"
          />
          <Button
            size="icon"
            onClick={handleGenerate}
            disabled={!url || phase !== "idle"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-10 w-10"
          >
            <ArrowUp className="h-6 w-6 rounded-full" />
          </Button>
        </div>

        <ProgressDisplay
          phase={phase}
          progress={progress}
          error={error}
          scaffolds={scaffolds}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      </div>
      <footer className="w-full absolute bottom-2 left-0 flex justify-center">
        <span className="text-xs text-gray-400">
          Built with <span role="img" aria-label="love">❤️</span> by{" "}
          <a
            href="https://aryanbhasin.com"
            className="underline text-gray-400 hover:text-gray-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            Aryan
          </a>
        </span>
      </footer>
    </main>
  );
}
