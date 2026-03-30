import MarkdownIt from "markdown-it";
import DOMPurify from "isomorphic-dompurify";

// Single shared markdown-it instance — never instantiate outside this module.
const md = new MarkdownIt({
  html: false, // prevent raw HTML injection
  linkify: true, // auto-convert URLs to links
  typographer: true, // smart quotes and dashes
  breaks: true, // convert \n to <br>
});

/**
 * Converts a Markdown string to sanitized HTML.
 * Always call this function before setting innerHTML.
 */
export function renderMarkdown(input: string): string {
  if (!input || input.trim() === "") return "";
  const rawHtml = md.render(input);
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "b",
      "i",
      "u",
      "s",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "pre",
      "code",
      "a",
      "hr",
    ],
    ALLOWED_ATTR: ["href", "title", "target", "rel"],
    FORCE_BODY: true,
  });
}

/**
 * Returns a plain-text preview of a Markdown string (strips HTML tags).
 * Useful for table cell previews.
 */
export function markdownToPlainText(input: string, maxLength = 100): string {
  const html = renderMarkdown(input);
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}
