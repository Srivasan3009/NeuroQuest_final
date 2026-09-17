import React, { useState, useEffect } from "react";
import { CheckCircle2, RotateCcw, AlertCircle, Zap } from "lucide-react";

interface NeuronWeightsWidgetProps {
  initialW1?: number;
  initialW2?: number;
  initialBias?: number;
  initialActivation?: "relu" | "sigmoid" | "step";
  targetGate?: "AND" | "OR";
  onGoalAchieved?: (achieved: boolean) => void;
}

export const NeuronWeightsWidget: React.FC<NeuronWeightsWidgetProps> = ({
  initialW1 = 1.0,
  initialW2 = 1.0,
  initialBias = -0.5,
  initialActivation = "relu",
  targetGate = "AND",
  onGoalAchieved,
}) => {
  const [w1, setW1] = useState(initialW1);
  const [w2, setW2] = useState(initialW2);
  const [bias, setBias] = useState(initialBias);
  const [activation, setActivation] = useState<"relu" | "sigmoid" | "step">(initialActivation);
  const [activeX1, setActiveX1] = useState<number>(1);
  const [activeX2, setActiveX2] = useState<number>(1);

  // Compute activation function
  const computeActivation = (z: number, func: "relu" | "sigmoid" | "step"): number => {
    if (func === "relu") return Math.max(0, z);
    if (func === "sigmoid") return 1 / (1 + Math.exp(-z));
    return z >= 0 ? 1 : 0;
  };

  // Truth Table Evaluation
  const testPairs = [
    { x1: 0, x2: 0, expectedAND: 0, expectedOR: 0 },
    { x1: 0, x2: 1, expectedAND: 0, expectedOR: 1 },
    { x1: 1, x2: 0, expectedAND: 0, expectedOR: 1 },
    { x1: 1, x2: 1, expectedAND: 1, expectedOR: 1 },
  ];

  let passedAllCases = true;
  const truthTableResults = testPairs.map((pair) => {
    const z = pair.x1 * w1 + pair.x2 * w2 + bias;
    const y = computeActivation(z, activation);
    const expected = targetGate === "AND" ? pair.expectedAND : pair.expectedOR;
    // For continuous functions, threshold at 0.5
    const isCorrect = expected === 1 ? y >= 0.5 : y < 0.5;
    if (!isCorrect) passedAllCases = false;
    return { ...pair, z, y, isCorrect };
  });

  useEffect(() => {
    onGoalAchieved?.(passedAllCases);
  }, [passedAllCases, onGoalAchieved]);

  // Active single calculation for interactive node
  const currentZ = activeX1 * w1 + activeX2 * w2 + bias;
  const currentY = computeActivation(currentZ, activation);

  const resetValues = () => {
    setW1(initialW1);
    setW2(initialW2);
    setBias(initialBias);
    setActivation(initialActivation);
  };

  return (
    <div id="neuron-weights-widget" className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono font-medium text-cyan-400 uppercase tracking-wider">
            Artificial Neuron Architecture
          </span>
          <h4 className="text-sm font-semibold text-slate-100 mt-0.5">
            Formula: <code className="text-cyan-300 font-mono">y = σ(w₁x₁ + w₂x₂ + b)</code>
          </h4>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              passedAllCases
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
            }`}
          >
            {passedAllCases ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>Target Gate ({targetGate}): {passedAllCases ? "Solved" : "Unmatched"}</span>
          </div>
          <button
            id="reset-neuron-btn"
            onClick={resetValues}
            title="Reset to default"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Neuron Node Diagram */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Inputs */}
          <div className="space-y-4">
            <div className="text-xs font-mono uppercase text-slate-400 font-semibold mb-2">Input Signals</div>
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-3">
              <span className="text-xs font-mono text-slate-300 font-medium">Input x₁:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveX1(0)}
                  className={`px-2.5 py-1 text-xs font-mono rounded font-medium transition-colors ${
                    activeX1 === 0 ? "bg-cyan-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => setActiveX1(1)}
                  className={`px-2.5 py-1 text-xs font-mono rounded font-medium transition-colors ${
                    activeX1 === 1 ? "bg-cyan-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  1
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-3">
              <span className="text-xs font-mono text-slate-300 font-medium">Input x₂:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveX2(0)}
                  className={`px-2.5 py-1 text-xs font-mono rounded font-medium transition-colors ${
                    activeX2 === 0 ? "bg-cyan-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => setActiveX2(1)}
                  className={`px-2.5 py-1 text-xs font-mono rounded font-medium transition-colors ${
                    activeX2 === 1 ? "bg-cyan-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  1
                </button>
              </div>
            </div>
          </div>

          {/* Central Soma (Neuron Body) */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-center relative">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border-2 border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] mb-3">
              <Zap className="w-7 h-7" />
            </div>
            <div className="text-xs font-mono text-slate-400">Summation (z)</div>
            <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">{currentZ.toFixed(2)}</div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              ({activeX1}×{w1.toFixed(1)}) + ({activeX2}×{w2.toFixed(1)}) + ({bias.toFixed(1)})
            </div>
          </div>

          {/* Activated Output */}
          <div className="space-y-4">
            <div className="text-xs font-mono uppercase text-slate-400 font-semibold mb-2">Activation & Output</div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Function (σ):</span>
                <select
                  value={activation}
                  onChange={(e) => setActivation(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 text-xs rounded px-2 py-1 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="relu">ReLU (max(0,z))</option>
                  <option value="sigmoid">Sigmoid (1/(1+e^-z))</option>
                  <option value="step">Step (z ≥ 0)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs font-mono text-slate-300 font-medium">Output (ŷ):</span>
                <span
                  className={`text-lg font-bold font-mono px-2 py-0.5 rounded ${
                    currentY >= 0.5 ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {currentY.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5 bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Weight w₁:</span>
            <span className="text-cyan-400 font-semibold">{w1.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="-3.0"
            max="3.0"
            step="0.1"
            value={w1}
            onChange={(e) => setW1(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
        </div>

        <div className="space-y-1.5 bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Weight w₂:</span>
            <span className="text-cyan-400 font-semibold">{w2.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="-3.0"
            max="3.0"
            step="0.1"
            value={w2}
            onChange={(e) => setW2(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
        </div>

        <div className="space-y-1.5 bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Bias b:</span>
            <span className="text-cyan-400 font-semibold">{bias.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="-3.0"
            max="3.0"
            step="0.1"
            value={bias}
            onChange={(e) => setBias(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Logical Gate Verification Table */}
      <div className="border border-slate-800 rounded-lg overflow-hidden">
        <div className="bg-slate-950 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Truth Table Verification: {targetGate} Gate</span>
          <span className="text-[11px] text-slate-500">Threshold: ŷ ≥ 0.5 fires</span>
        </div>
        <div className="divide-y divide-slate-800/60 bg-slate-900/50 text-xs font-mono">
          {truthTableResults.map((row, idx) => (
            <div key={idx} className="flex items-center justify-between px-3.5 py-2">
              <span className="text-slate-300">
                x₁ = {row.x1}, x₂ = {row.x2}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-slate-400">z = {row.z.toFixed(2)}</span>
                <span className="text-slate-300 font-semibold">ŷ = {row.y.toFixed(2)}</span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    row.isCorrect ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {row.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {row.isCorrect ? "Pass" : "Fail"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
