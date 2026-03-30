"use client";

import { renderMarkdown } from "@/lib/markdown";

interface MarkdownRendererProps {
  source: string;
  className?: string;
}

export function MarkdownRenderer({ source, className = "" }: MarkdownRendererProps) {
  if (!source || source.trim() === "") {
    return <span className="text-gray-400 italic text-sm">—</span>;
  }

  return (
    <div
      className={`prose prose-sm max-w-none text-gray-700 ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(source) }}
    />
  );
}
