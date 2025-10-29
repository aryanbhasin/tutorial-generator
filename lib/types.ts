export interface CrawledPage {
  id: string;
  url: string;
  title: string;
  markdown: string;
}

export interface TutorialOpportunity {
  topic: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  referencedPageIds: string[];
  rationale: string;
}

export interface TutorialSection {
  heading: string;
  content: string;
}

export interface TutorialReference {
  title: string;
  url: string;
}

export interface TutorialScaffold {
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  summary: string;
  estimatedHours: number;
  costReasoning: string;
  sections: TutorialSection[];
  references: TutorialReference[];
}

export type TutorialType = "balanced" | "practical" | "conceptual";

export interface GenerationSettings {
  maxPages: number;
  tutorialType: TutorialType;
}
