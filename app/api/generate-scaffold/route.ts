import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { scaffoldResponseSchema } from "@/lib/schemas";


const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const maxDuration = 60;

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
3. Section headings with mixed content that includes:
   - Actual informative content (2-3 sentences explaining the concept or what will be covered)
   - Bullet points outlining key sub-topics or steps
   - Short guidance notes in brackets where the creator should expand with specifics
   - Line breaks between different elements for readability
4. Estimated hours to CREATE this tutorial (not to complete it as a learner)
5. Cost reasoning explaining the time estimate based on complexity, code required, etc.
6. References to the source documentation pages

IMPORTANT FORMATTING RULES:
- Each section should be READABLE, not just a wall of bracketed instructions
- Include actual informative text that sets context (2-3 sentences per section)
- Use bullet points to break down key topics or steps
- Add line breaks (\\n\\n) between paragraphs, bullet lists, and bracketed notes
- Bracketed notes should be SHORT and SPECIFIC, like "[Add code example]" or "[Include screenshot of dashboard]"
- Avoid long bracketed paragraphs - break them into bullets or separate notes

GOOD EXAMPLE:
"This section will guide you through setting up your Firecrawl account and obtaining API credentials.

Key steps:
- Create a new account at firecrawl.dev
- Navigate to the API settings page
- Generate your API key

[Add screenshots of the signup flow]
[Include a note about rate limits for the free tier]"

BAD EXAMPLE:
"[Expand on the step-by-step process to create a Firecrawl account] [Include screenshots of the signup process] [Explain how to navigate to the API keys section] [Show how to generate and securely store an API key] [Discuss rate limits and pricing tiers for beginners to understand]"

The scaffold should be informative and readable while guiding the content creator on where to add depth.`;

    const result = await generateObject({
      model: anthropic("claude-sonnet-4-5-20250929"),
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
