import React, { useMemo } from "react";
import "katex/dist/katex.min.css";
// @ts-ignore
import { InlineMath, BlockMath } from "react-katex";
import { parseLatexSegments } from "../../utils/katexHelper";

interface KaTeXRendererProps {
  content: string;
  className?: string;
}

export const KaTeXRenderer: React.FC<KaTeXRendererProps> = ({ content, className = "" }) => {
  const segments = useMemo(() => parseLatexSegments(content), [content]);

  return (
    <div className={`leading-relaxed ${className}`}>
      {segments.map((seg, i) => {
        if (seg.type === "block_math") {
          return (
            <div key={i} className="my-3 overflow-x-auto py-1">
              <BlockMath math={seg.content} errorColor="#ef4444" />
            </div>
          );
        }
        if (seg.type === "inline_math") {
          return <InlineMath key={i} math={seg.content} errorColor="#ef4444" />;
        }
        return <span key={i}>{seg.content}</span>;
      })}
    </div>
  );
};
