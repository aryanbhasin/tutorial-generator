import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { scaffoldResponseSchema } from "@/lib/schemas";


const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})  

export async function POST(request: NextRequest) {
  try {
    const { opportunity, contextPages } = await request.json();

    if (!opportunity || !contextPages) {
      return NextResponse.json(
        { error: "Opportunity and context pages are required" },
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

    const context = contextPages
      .map((page: any) => {
        return `### ${page.title}\nURL: ${page.url}\n\n${page.markdown.slice(0, 3000)}`;
      })
      .join("\n\n---\n\n");

    const prompt = `You are creating a tutorial scaffold for content creators to expand into a full tutorial or video.

Tutorial Topic: ${opportunity.topic}
Difficulty: ${opportunity.difficulty}
Rationale: ${opportunity.rationale}

Here is the relevant documentation context:

${context}

Create a tutorial scaffold with:
1. A clear, engaging title
2. A 2-3 sentence summary of what learners will accomplish
3. Section headings with brief outlines including placeholders like:
   - "[Describe what the learner should have accomplished]"
   - "[Expand on the setup steps needed]"
   - "[Include code examples for...]"
   - "[Explain the key concepts of...]"
4. Estimated hours to CREATE this tutorial (not to complete it as a learner)
5. Cost reasoning explaining the time estimate based on complexity, code required, etc.
6. References to the source documentation pages

The scaffold should guide a content creator to develop a complete, high-quality tutorial.`;

    const result = await generateObject({
      model: anthropic("claude-4-5-sonnet"),
      schema: scaffoldResponseSchema,
      prompt,
    });

    return NextResponse.json({ scaffold: result.object });
  } catch (error) {
    console.error("Scaffold generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate scaffold" },
      { status: 500 }
    );
  }
}
