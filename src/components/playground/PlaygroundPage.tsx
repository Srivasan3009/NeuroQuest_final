import React, { useState } from "react";
import {
  Sliders,
  Layers,
  Info
} from "lucide-react";
import { DecisionBoundaryWidget } from "../quest/widgets/DecisionBoundaryWidget";
import { TokenEmbeddingWidget } from "../quest/widgets/TokenEmbeddingWidget";

export const PlaygroundPage: React.FC = () => {
  const [activeLab, setActiveLab] = useState<"classifier" | "tokens">("classifier");

  return (
    <div id="playground-page-root" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
            Experimental Sandbox
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-sans tracking-tight mt-1">
            AI Developer Playground
          </h1>
          <p className="text-sm text-slate-400 font-sans mt-1">
            Test hypotheses, perturb hyperparameters, and analyze model behaviors across interactive benches.
          </p>
        </div>

        {/* Lab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-lg p-1 text-xs font-mono">
          <button
            onClick={() => setActiveLab("classifier")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              activeLab === "classifier"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Classifier 2D</span>
          </button>
          <button
            onClick={() => setActiveLab("tokens")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              activeLab === "tokens"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Token Matrix</span>
          </button>
        </div>
      </div>

      {/* Lab 1: Classifier 2D */}
      {activeLab === "classifier" && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-xs font-sans text-slate-300 flex items-start gap-3">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong>Linear Hyperplane Classifier:</strong> Tune the slope (weight rotation) and intercept (bias shift) to observe real-time classification accuracy on synthetic feature points.
            </p>
          </div>

          <DecisionBoundaryWidget initialSlope={0.9} initialIntercept={0.1} targetAccuracy={95} />
        </div>
      )}

      {/* Lab 2: Token Matrix */}
      {activeLab === "tokens" && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-xs font-sans text-slate-300 flex items-start gap-3">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong>Subword Tokenizer & Embedding Projection:</strong> Enter custom vocabulary to view byte-pair subword segmentation and 2D vector cosine similarity against reference concepts.
            </p>
          </div>

          <TokenEmbeddingWidget initialText="Reinforcement learning from human feedback and transformer self-attention" />
        </div>
      )}
    </div>
  );
};
