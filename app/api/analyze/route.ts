import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { analysisResponseSchema } from "@/lib/schemas";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { pages, opportunitiesPerBatch, tutorialType } = await request.json();

    if (!pages || !Array.isArray(pages)) {
      return NextResponse.json(
        { error: "Pages array is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Anthropic API key not configured" },
        { status: 500 }
      );
    }

    let typeGuidance = "";
    if (tutorialType === "practical") {
      typeGuidance = "Focus on hands-on, practical tutorials where users build something concrete.";
    } else if (tutorialType === "conceptual") {
      typeGuidance = "Focus on conceptual tutorials that explain theory and understanding.";
    } else {
      typeGuidance = "Include a balanced mix of practical and conceptual tutorials.";
    }

    const pageList = pages
      .map((p: { id: string; title: string; url: string }) => `- ID: ${p.id}\n  Title: ${p.title}\n  URL: ${p.url}`)
      .join("\n\n");

    const prompt = `You are analyzing documentation pages to identify strong tutorial opportunities.

${typeGuidance}

Here are the documentation pages:

${pageList}

Identify exactly ${opportunitiesPerBatch} tutorial opportunities from these pages. For each opportunity:
- Choose topics that would make strong, practical tutorials for developers
- Reference the specific page IDs that support this tutorial topic
- Explain why this would make a valuable tutorial

Focus on topics that:
- Address common use cases and workflows
- Have clear, achievable learning outcomes
- Would benefit from step-by-step guidance beyond just reading docs`;

    const result = await generateObject({
      model: anthropic("claude-sonnet-4-5-20250929"),
      schema: analysisResponseSchema,
      prompt,
    });

    return NextResponse.json({ opportunities: result.object.opportunities });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze pages" },
      { status: 500 }
    );
  }
}
