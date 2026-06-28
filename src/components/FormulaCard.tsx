import React from "react";
import { Divider, Card } from "antd";
import { InlineMath, BlockMath } from "react-katex";
import { Zap, MessageSquareWarning } from "lucide-react";
import "katex/dist/katex.min.css";

interface FormulaCardProps {
  card: {
    id: string;
    title: string;
    definition: string;
    formula: string;
    variables: Record<string, string>;
    units: Record<string, string>;
    important_notes?: string[];
    common_mistakes?: string[];
    example?: string;
    difficulty?: string;
    exam_relevance: string[];
    status?: {
      not_seen?: boolean;
      memorized?: boolean;
      bookmarked?: boolean;
      need_revision?: boolean;
    };
  };
  subjectKey: string;
}

export const FormulaCard: React.FC<FormulaCardProps> = ({ card, subjectKey }) => {
  return (
    <Card
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: "24px",
        color: "#ffffff",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
      }}
      bodyStyle={{ padding: "24px" }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-4">
        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">
          {subjectKey} Reference
        </span>
        <h2 className="text-2xl font-bold text-white tracking-tight mt-3 font-serif">
          {card.title}
        </h2>
      </div>

      <Divider style={{ backgroundColor: "rgba(255, 255, 255, 0.15)", margin: "8px 0" }} />

      <div className="my-4 text-center">
        <div className="relative z-10 text-xl text-white font-medium py-3 bg-white/5 rounded-xl border border-white/10 shadow-inner flex items-center justify-center">
          <BlockMath math={card.formula} />
        </div>
      </div>

      <div className="mb-4 text-slate-300 text-sm leading-relaxed font-medium bg-white/5 p-4 rounded-xl border border-white/5">
        {card.definition}
      </div>

      {/* Variables & Units */}
      {card.variables && Object.keys(card.variables).length > 0 && (
        <div className="mb-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            Parameters & Units
          </h3>
          <div className="space-y-2">
            {Object.entries(card.variables).map(([symbol, meaning]) => (
              <div
                key={symbol}
                className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center text-white font-medium border border-white/10 text-xs">
                    <InlineMath math={symbol} />
                  </div>
                  <span className="text-slate-300 text-xs font-medium">
                    {String(meaning)}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  {card.units[symbol] || "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Important Notes */}
      {card.important_notes && card.important_notes.length > 0 && (
        <div className="mb-4">
          <h3 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Zap size={12} className="fill-amber-400 text-amber-400" /> Key Insights
          </h3>
          <ul className="space-y-1.5 bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/10">
            {card.important_notes.map((note, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-slate-300 text-xs leading-relaxed"
              >
                <span className="block w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Common Mistakes */}
      {card.common_mistakes && card.common_mistakes.length > 0 && (
        <div className="mb-4">
          <h3 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <MessageSquareWarning size={12} className="text-rose-400" /> Watch Out
          </h3>
          <ul className="space-y-1.5 bg-rose-500/5 p-3.5 rounded-xl border border-rose-500/10">
            {card.common_mistakes.map((mistake, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-slate-300 text-xs leading-relaxed"
              >
                <span className="block w-1.5 h-1.5 rounded bg-rose-400 mt-1.5 shrink-0 rotate-45"></span>
                {mistake}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Example */}
      {card.example && (
        <div className="bg-blue-500/5 p-3.5 rounded-xl border border-blue-500/10 relative overflow-hidden">
          <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
            Practical Scenario
          </h3>
          <p className="text-slate-300 italic text-xs leading-relaxed">
            {card.example}
          </p>
        </div>
      )}
    </Card>
  );
};
