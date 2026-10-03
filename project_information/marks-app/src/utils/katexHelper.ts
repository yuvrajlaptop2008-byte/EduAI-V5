// Helper utility to segment text containing LaTeX formulas

export interface TextSegment {
  type: "text" | "inline_math" | "block_math";
  content: string;
}

export function parseLatexSegments(input: string): TextSegment[] {
  if (!input) return [];
  const segments: TextSegment[] = [];

  // Match $$block math$$ or $inline math$
  const regex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: input.slice(lastIndex, match.index),
      });
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith("$$") && matchedStr.endsWith("$$")) {
      segments.push({
        type: "block_math",
        content: matchedStr.slice(2, -2).trim(),
      });
    } else {
      segments.push({
        type: "inline_math",
        content: matchedStr.slice(1, -1).trim(),
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    segments.push({
      type: "text",
      content: input.slice(lastIndex),
    });
  }

  return segments;
}
