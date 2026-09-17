import React, { useState, useEffect } from "react";
import { CheckCircle2, RotateCcw, AlertCircle, Layers } from "lucide-react";

interface TokenEmbeddingWidgetProps {
  initialText?: string;
  targetKeyword?: string;
  onGoalAchieved?: (achieved: boolean) => void;
}

interface ProjectedConcept {
  id: string;
  label: string;
  x: number;
  y: number;
  category: "ai" | "general" | "user";
}

export const TokenEmbeddingWidget: React.FC<TokenEmbeddingWidgetProps> = ({
  initialText = "Autonomous neural agent planning actions",
  targetKeyword = "Autonomous Neural Agent",
  onGoalAchieved,
}) => {
  const [inputText, setInputText] = useState(initialText);

  // Simple pedagogical BPE tokenizer simulation
  const tokenize = (text: string) => {
    if (!text.trim()) return [];
    // Splitting words and known prefixes/suffixes
    const words = text.trim().split(/\s+/);
    const tokens: { text: string; id: number }[] = [];
    let seed = 1200;

    words.forEach((word) => {
      // simulate subword splits for complex words
      if (word.length > 7 && !word.includes("-")) {
        const mid = Math.floor(word.length / 2);
        tokens.push({ text: word.slice(0, mid), id: ++seed });
        tokens.push({ text: "##" + word.slice(mid), id: ++seed });
      } else {
        tokens.push({ text: word, id: ++seed });
      }
    });
    return tokens;
  };

  const tokens = tokenize(inputText);

  // Semantic coordinate projection based on keywords
  const computeVectorProjection = (text: string): { x: number; y: number; similarity: number } => {
    const lower = text.toLowerCase();
    let x = 0;
    let y = 0;

    // Semantic axes:
    // X-axis: Static Rules (-1.0) <---> Autonomous Learning (+1.0)
    // Y-axis: Basic Data (-1.0) <---> Deep Intelligence (+1.0)

    if (lower.includes("neural") || lower.includes("deep") || lower.includes("transformer")) {
      x += 0.5;
      y += 0.6;
    }
    if (lower.includes("agent") || lower.includes("autonomous") || lower.includes("planning")) {
      x += 0.6;
      y += 0.4;
    }
    if (lower.includes("rule") || lower.includes("static") || lower.includes("if")) {
      x -= 0.7;
      y -= 0.3;
    }
    if (lower.includes("recipe") || lower.includes("banana") || lower.includes("cooking")) {
      x -= 0.6;
      y -= 0.7;
    }

    // Clamp coordinates
    x = Math.max(-1, Math.min(1, x));
    y = Math.max(-1, Math.min(1, y));

    // Target vector is at (0.85, 0.85) for "Autonomous Neural Agent"
    const targetX = 0.85;
    const targetY = 0.85;
    const dot = x * targetX + y * targetY;
    const magInput = Math.sqrt(x * x + y * y) || 0.001;
    const magTarget = Math.sqrt(targetX * targetX + targetY * targetY);
    const cosineSim = Math.max(-1, Math.min(1, dot / (magInput * magTarget)));

    return { x, y, similarity: Math.round(cosineSim * 100) / 100 };
  };

  const currentVector = computeVectorProjection(inputText);
  const isTargetAligned = currentVector.similarity >= 0.85;

  useEffect(() => {
    onGoalAchieved?.(isTargetAligned);
  }, [isTargetAligned, onGoalAchieved]);

  const referencePoints: ProjectedConcept[] = [
    { id: "p1", label: "Autonomous Neural Agent (Goal)", x: 0.85, y: 0.85, category: "ai" },
    { id: "p2", label: "Deep Learning Manifold", x: 0.65, y: 0.7, category: "ai" },
    { id: "p3", label: "Procedural IF-ELSE", x: -0.7, y: -0.2, category: "general" },
    { id: "p4", label: "Culinary Apple Pie", x: -0.65, y: -0.8, category: "general" },
  ];

  return (
    <div id="token-embedding-widget" className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono font-medium text-cyan-400 uppercase tracking-wider">
            Tokenization & Semantic Vector Space
          </span>
          <h4 className="text-sm font-semibold text-slate-100 mt-0.5">
            BPE Subword Tokens & Cosine Alignment
          </h4>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              isTargetAligned
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
            }`}
          >
            {isTargetAligned ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>Cosine Sim: {currentVector.similarity.toFixed(2)} / 1.0</span>
          </div>
          <button
            id="reset-token-btn"
            onClick={() => setInputText(initialText)}
            title="Reset text"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Input Prompt Box */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-slate-400">
          Enter custom prompt to inspect token boundary segmentation:
        </label>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type an AI concept (e.g., 'Autonomous neural agent reinforcement learning')..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 font-sans focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* Token Chips */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generated Tokens ({tokens.length})</span>
          </div>
          <span className="text-[11px] text-slate-500">Colorized Subword Boundaries</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {tokens.map((tok, idx) => {
            const hues = [
              "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
              "border-sky-500/30 bg-sky-500/10 text-sky-300",
              "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
              "border-purple-500/30 bg-purple-500/10 text-purple-300",
              "border-amber-500/30 bg-amber-500/10 text-amber-300",
            ];
            const style = hues[idx % hues.length];
            return (
              <div
                key={idx}
                className={`border rounded px-2 py-1 text-xs font-mono flex items-center gap-1.5 ${style}`}
              >
                <span>"{tok.text}"</span>
                <span className="text-[10px] opacity-60 font-sans">#{tok.id}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2D Vector Manifold Map */}
      <div className="relative w-full aspect-[16/9] bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center p-4">
        <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full">
          {/* Subtle Grid */}
          <line x1="-1.2" y1="0" x2="1.2" y2="0" stroke="#1e293b" strokeWidth="0.015" />
          <line x1="0" y1="-1.2" x2="0" y2="1.2" stroke="#1e293b" strokeWidth="0.015" />
          <circle cx="0" cy="0" r="1.0" fill="none" stroke="#1e293b" strokeWidth="0.01" strokeDasharray="0.05" />

          {/* Reference concepts */}
          {referencePoints.map((ref) => (
            <g key={ref.id}>
              <circle
                cx={ref.x}
                cy={ref.y}
                r="0.04"
                fill={ref.id === "p1" ? "#10b981" : "#64748b"}
              />
              <text
                x={ref.x + 0.05}
                y={ref.y + 0.02}
                fontSize="0.065"
                fill={ref.id === "p1" ? "#34d399" : "#94a3b8"}
                fontFamily="sans-serif"
                fontWeight={ref.id === "p1" ? "bold" : "normal"}
              >
                {ref.label}
              </text>
            </g>
          ))}

          {/* User's Current Vector */}
          <line
            x1="0"
            y1="0"
            x2={currentVector.x}
            y2={currentVector.y}
            stroke="#06b6d4"
            strokeWidth="0.03"
          />
          <circle
            cx={currentVector.x}
            cy={currentVector.y}
            r="0.06"
            fill="#06b6d4"
            stroke="#f8fafc"
            strokeWidth="0.015"
          />
          <text
            x={currentVector.x + 0.06}
            y={currentVector.y - 0.04}
            fontSize="0.07"
            fill="#38bdf8"
            fontWeight="bold"
            fontFamily="monospace"
          >
            Your Query Vector
          </text>
        </svg>

        <div className="absolute bottom-2 left-2 bg-slate-900/90 border border-slate-800 rounded px-2.5 py-1 text-[11px] text-slate-400 font-mono">
          Target: Align query vector with <span className="text-emerald-400 font-semibold">{targetKeyword}</span> (≥0.85)
        </div>
      </div>
    </div>
  );
};
