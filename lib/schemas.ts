import { z } from "zod";

export const tutorialOpportunitySchema = z.object({
  topic: z.string().describe("The tutorial topic or title"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).describe("Difficulty level"),
  referencedPageIds: z.array(z.string()).describe("IDs of pages that support this tutorial"),
  rationale: z.string().describe("Why this would make a good tutorial"),
});

export const analysisResponseSchema = z.object({
  opportunities: z.array(tutorialOpportunitySchema),
});

export const tutorialSectionSchema = z.object({
  heading: z.string().describe("Section heading"),
  content: z.string().describe("Section outline with placeholders like [Expand on...]"),
});

export const tutorialReferenceSchema = z.object({
  title: z.string().describe("Reference page title"),
  url: z.string().describe("Reference page URL"),
});

export const scaffoldResponseSchema = z.object({
  title: z.string().describe("Tutorial title"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).describe("Difficulty level"),
  summary: z.string().describe("2-3 sentence tutorial summary"),
  estimatedHours: z.number().describe("Estimated hours to create this tutorial"),
  costReasoning: z.string().describe("Explanation of time estimate"),
  sections: z.array(tutorialSectionSchema).describe("Tutorial section outline"),
  references: z.array(tutorialReferenceSchema).describe("Source documentation references"),
});
