import { NextRequest, NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";
import { CrawledPage } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { url, maxPages } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Firecrawl API key not configured" },
        { status: 500 }
      );
    }

    const firecrawl = new FirecrawlApp({ apiKey });

    // firecrawl.crawl expects a string argument (the URL)
    const crawlResult = await firecrawl.crawl(
      url,
      {
        limit: maxPages || 10,
        scrapeOptions: {
          formats: ["markdown"],
        },
      }
    );

    if (!crawlResult || !Array.isArray(crawlResult.data)) {
      return NextResponse.json(
        { error: "Failed to crawl documentation" },
        { status: 500 }
      );
    }


    const pages: CrawledPage[] = crawlResult.data.map((page: { metadata?: { sourceURL?: string; title?: string }; markdown?: string }, index: number) => ({
      id: page.metadata?.sourceURL || `page-${index}`,
      url: page.metadata?.sourceURL || url,
      title: page.metadata?.title || `Page ${index + 1}`,
      markdown: page.markdown || "",
    }));

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("Crawl error:", error);
    return NextResponse.json(
      { error: "Failed to crawl documentation" },
      { status: 500 }
    );
  }
}
