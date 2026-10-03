import { useState } from "react";

export default function MarkdownRenderer({ content = "" }) {
  if (!content) return null;

  // Split content into blocks: code blocks vs text blocks
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className="space-y-2 text-sm leading-relaxed text-[#dfeaf5]">
      {blocks.map((block, idx) => {
        if (block.type === "code") {
          return <CodeBlock key={idx} code={block.code} language={block.language} />;
        }
        return <FormattedTextBlock key={idx} text={block.text} />;
      })}
    </div>
  );
}

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 overflow-hidden rounded-xl border border-[#214a69] bg-[#061019] text-xs">
      <div className="flex items-center justify-between border-b border-[#1d374d] bg-[#0b1d2c] px-3 py-1.5 font-mono text-[11px] text-[#7fa7c0]">
        <span>{language ? language.toUpperCase() : "CODE"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded px-2 py-0.5 text-[10px] font-semibold text-[#7dd3fc] hover:bg-[#15344d]"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[#7dd3fc] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function FormattedTextBlock({ text }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header 1, 2, 3
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="mt-2 text-base font-bold text-[#7dd3fc]">
              {renderInlineMarkdown(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="mt-2 text-lg font-bold text-[#bfe7ff]">
              {renderInlineMarkdown(trimmed.slice(3))}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={idx} className="mt-2 text-xl font-bold text-[#ffffff]">
              {renderInlineMarkdown(trimmed.slice(2))}
            </h2>
          );
        }

        // Bullet lists
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-[#4dd0ff]">•</span>
              <span>{renderInlineMarkdown(trimmed.slice(2))}</span>
            </div>
          );
        }

        // Numbered lists (e.g. "1. ")
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="font-semibold text-[#7dd3fc]">{numMatch[1]}.</span>
              <span>{renderInlineMarkdown(numMatch[2])}</span>
            </div>
          );
        }

        // Blockquote
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote key={idx} className="my-1 border-l-2 border-[#4dd0ff] bg-[#0d2a3c]/50 py-1 pl-3 font-italic text-[#bfe7ff]">
              {renderInlineMarkdown(trimmed.slice(2))}
            </blockquote>
          );
        }

        // Regular paragraph line
        return <p key={idx}>{renderInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

function renderInlineMarkdown(text) {
  // Replace inline markdown elements: **bold**, *italic*, `code`
  const parts = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining) {
    // Check for inline code
    const codeMatch = remaining.match(/`([^`]+)`/);
    // Check for bold
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    // Check for italic
    const italicMatch = remaining.match(/\*([^*]+)\*/);

    let earliest = null;
    let type = null;

    if (codeMatch && (earliest === null || codeMatch.index < earliest.index)) {
      earliest = codeMatch;
      type = "code";
    }
    if (boldMatch && (earliest === null || boldMatch.index < earliest.index)) {
      earliest = boldMatch;
      type = "bold";
    }
    if (italicMatch && (earliest === null || italicMatch.index < earliest.index)) {
      earliest = italicMatch;
      type = "italic";
    }

    if (!earliest) {
      parts.push(<span key={keyIdx++}>{remaining}</span>);
      break;
    }

    if (earliest.index > 0) {
      parts.push(<span key={keyIdx++}>{remaining.slice(0, earliest.index)}</span>);
    }

    if (type === "code") {
      parts.push(
        <code key={keyIdx++} className="rounded bg-[#0b2436] px-1.5 py-0.5 font-mono text-xs text-[#7dd3fc] border border-[#1d374d]">
          {earliest[1]}
        </code>
      );
    } else if (type === "bold") {
      parts.push(
        <strong key={keyIdx++} className="font-bold text-[#ffffff]">
          {earliest[1]}
        </strong>
      );
    } else if (type === "italic") {
      parts.push(
        <em key={keyIdx++} className="italic text-[#bfe7ff]">
          {earliest[1]}
        </em>
      );
    }

    remaining = remaining.slice(earliest.index + earliest[0].length);
  }

  return parts;
}

function parseMarkdownBlocks(text) {
  const blocks = [];
  const lines = text.split("\n");
  let inCode = false;
  let codeLang = "";
  let codeLines = [];
  let textLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (inCode) {
        // End code block
        blocks.push({ type: "code", language: codeLang, code: codeLines.join("\n") });
        inCode = false;
        codeLang = "";
        codeLines = [];
      } else {
        // Start code block
        if (textLines.length > 0) {
          blocks.push({ type: "text", text: textLines.join("\n") });
          textLines = [];
        }
        inCode = true;
        codeLang = line.trim().slice(3).trim();
      }
    } else if (inCode) {
      codeLines.push(line);
    } else {
      textLines.push(line);
    }
  }

  if (inCode && codeLines.length > 0) {
    blocks.push({ type: "code", language: codeLang, code: codeLines.join("\n") });
  } else if (textLines.length > 0) {
    blocks.push({ type: "text", text: textLines.join("\n") });
  }

  return blocks;
}
