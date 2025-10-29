import JSZip from "jszip";
import { TutorialScaffold } from "./types";

/**
 * Convert a tutorial scaffold to markdown format with YAML frontmatter
 */
export function scaffoldToMarkdown(scaffold: TutorialScaffold): string {
  const frontmatter = `---
title: "${scaffold.title}"
difficulty: "${scaffold.difficulty}"
estimatedHours: ${scaffold.estimatedHours}
summary: "${scaffold.summary}"
---`;

  const sections = scaffold.sections
    .map((section) => `## ${section.heading}\n\n${section.content}`)
    .join("\n\n");

  const references =
    scaffold.references.length > 0
      ? `## References\n\n${scaffold.references.map((ref) => `- [${ref.title}](${ref.url})`).join("\n")}`
      : "";

  return `${frontmatter}\n\n${sections}${references ? "\n\n" + references : ""}`.trim();
}

/**
 * Create a filename-safe slug from a title
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate CSV content from scaffolds
 */
export function generateCSV(scaffolds: TutorialScaffold[]): string {
  const HOURLY_RATE = 50;

  const headers = [
    "Title",
    "Summary",
    "Difficulty",
    "Estimated Hours",
    "Estimated Cost",
    "Cost Reasoning",
  ];

  const rows = scaffolds.map((scaffold) => {
    const cost = scaffold.estimatedHours * HOURLY_RATE;
    return [
      scaffold.title,
      scaffold.summary,
      scaffold.difficulty,
      scaffold.estimatedHours.toString(),
      `$${cost}`,
      scaffold.costReasoning,
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return csvContent;
}

/**
 * Create a ZIP file containing all scaffolds and index CSV
 */
export async function createZipFile(
  scaffolds: TutorialScaffold[]
): Promise<Blob> {
  const zip = new JSZip();

  const csvContent = generateCSV(scaffolds);
  zip.file("index.csv", csvContent);

  const scaffoldsFolder = zip.folder("scaffolds");

  scaffolds.forEach((scaffold) => {
    const markdown = scaffoldToMarkdown(scaffold);
    const filename = `${slugify(scaffold.title)}.md`;
    scaffoldsFolder?.file(filename, markdown);
  });

  return await zip.generateAsync({ type: "blob" });
}

/**
 * Trigger browser download of a blob
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
