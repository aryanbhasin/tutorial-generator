# Tutorial Generator

**[Try it →](https://tutorial-generator.vercel.app)**

Transform documentation into AI-powered tutorial scaffolds. Built for content creators who want to turn technical docs into comprehensive, structured tutorials.

## What It Does

Tutorial Generator crawls documentation sites and uses AI to:
- Identify strong tutorial opportunities from your docs
- Generate structured tutorial scaffolds with real content
- Provide cost estimates for tutorial creation
- Export everything as ready-to-use Markdown files

## Value Add

Instead of manually combing through documentation to plan tutorials, get:
- **10-20 tutorial ideas** from any documentation site in minutes
- **Structured scaffolds** with actual informative content, not just outlines
- **Cost estimates** ($50/hour rate) for budgeting tutorial production
- **CSV index** for easy prioritization and assignment

Perfect for:
- Content teams planning tutorial roadmaps
- Developer advocates creating educational content
- Technical writers scoping documentation projects
- Course creators building curriculum

## How It Works

1. **Crawl**: Enter a documentation URL (e.g., `https://nextjs.org/docs`)
2. **Analyze**: AI identifies tutorial opportunities across your docs
3. **Generate**: Creates detailed scaffolds with sections, bullet points, and guidance
4. **Download**: Get a ZIP with Markdown files and a CSV index

Each scaffold includes:
- Informative content that sets context
- Bullet points breaking down key topics
- Short bracketed notes for expansion
- Estimated hours and cost reasoning
- References to source documentation

## Quick Start

```bash
# Install dependencies
pnpm install

# Add your API keys to .env.local
FIRECRAWL_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Run development server
pnpm run dev
```

Visit `http://localhost:3000` and enter any documentation URL to get started.

## Tech Stack

- **Next.js 15** with App Router
- **Firecrawl** for documentation crawling
- **Claude AI** (Anthropic) for intelligent analysis
- **shadcn/ui** for beautiful components
- **TypeScript** for type safety

## Features

- Real-time progress tracking with visual indicators
- Configurable settings (max pages, tutorial focus)
- Concurrent processing for speed
- Graceful error handling with partial results
- Clean, minimal UI built with Tailwind CSS

---

Built with ❤️ for ns.com
