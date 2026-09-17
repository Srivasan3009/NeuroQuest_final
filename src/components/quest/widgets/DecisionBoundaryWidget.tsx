import React, { useState, useEffect } from "react";
import { CheckCircle2, RotateCcw, AlertCircle } from "lucide-react";

interface Point {
  x: number;
  y: number;
  label: 1 | -1; // 1 = Blue, -1 = Orange
}

interface DecisionBoundaryWidgetProps {
  initialSlope?: number;
  initialIntercept?: number;
  targetAccuracy?: number;
  onGoalAchieved?: (achieved: boolean, currentAccuracy: number) => void;
}

export const DecisionBoundaryWidget: React.FC<DecisionBoundaryWidgetProps> = ({
  initialSlope = 1.0,
  initialIntercept = 0.0,
  targetAccuracy = 95,
  onGoalAchieved,
}) => {
  const [slope, setSlope] = useState(initialSlope);
  const [intercept, setIntercept] = useState(initialIntercept);

  // Generate a deterministic synthetic dataset
  const [points] = useState<Point[]>(() => {
    const pts: Point[] = [];
    // Class 1 (Blue) centered at (-0.5, 0.6)
    for (let i = 0; i < 25; i++) {
      const angle = (i / 25) * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 0.35;
      pts.push({
        x: -0.45 + r * Math.cos(angle),
        y: 0.55 + r * Math.sin(angle),
        label: 1,
      });
    }
    // Class -1 (Orange) centered at (0.5, -0.4)
    for (let i = 0; i < 25; i++) {
      const angle = (i / 25) * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 0.35;
      pts.push({
        x: 0.45 + r * Math.cos(angle),
        y: -0.35 + r * Math.sin(angle),
        label: -1,
      });
    }
    return pts;
  });

  // Calculate current accuracy
  // Line equation: y = m*x + c  =>  m*x - y + c = 0
  // If point is above line: (y - (m*x + c)) > 0 -> predicted 1
  let correctCount = 0;
  for (const pt of points) {
    const lineY = slope * pt.x + intercept;
    const predicted = pt.y > lineY ? 1 : -1;
    if (predicted === pt.label) {
      correctCount++;
    }
  }

  const accuracy = Math.round((correctCount / points.length) * 100);
  const isTargetMet = accuracy >= targetAccuracy;

  useEffect(() => {
    onGoalAchieved?.(isTargetMet, accuracy);
  }, [isTargetMet, accuracy, onGoalAchieved]);

  const resetValues = () => {
    setSlope(initialSlope);
    setIntercept(initialIntercept);
  };

  return (
    <div id="decision-boundary-widget" className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono font-medium text-cyan-400 uppercase tracking-wider">
            Interactive Linear Classifier
          </span>
          <h4 className="text-sm font-semibold text-slate-100 mt-0.5">
            Decision Boundary: <code className="text-cyan-300 font-mono">y = {slope.toFixed(2)}x + {intercept.toFixed(2)}</code>
          </h4>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              isTargetMet
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
            }`}
          >
            {isTargetMet ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>Accuracy: {accuracy}%</span>
          </div>
          <button
            id="reset-boundary-btn"
            onClick={resetValues}
            title="Reset to default"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG 2D Visualization */}
      <div className="relative w-full aspect-[16/9] bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
        <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full">
          {/* Coordinate Grid axes */}
          <line x1="-1.2" y1="0" x2="1.2" y2="0" stroke="#334155" strokeWidth="0.015" strokeDasharray="0.04" />
          <line x1="0" y1="-1.2" x2="0" y2="1.2" stroke="#334155" strokeWidth="0.015" strokeDasharray="0.04" />

          {/* Decision Boundary Line */}
          {/* Compute 2 endpoints for line: y = mx + c */}
          <line
            x1="-1.2"
            y1={slope * -1.2 + intercept}
            x2="1.2"
            y2={slope * 1.2 + intercept}
            stroke="#06b6d4"
            strokeWidth="0.04"
          />

          {/* Shaded regions */}
          <polygon
            points={`-1.2,${slope * -1.2 + intercept} 1.2,${slope * 1.2 + intercept} 1.2,1.2 -1.2,1.2`}
            fill="#06b6d4"
            fillOpacity="0.08"
          />
          <polygon
            points={`-1.2,${slope * -1.2 + intercept} 1.2,${slope * 1.2 + intercept} 1.2,-1.2 -1.2,-1.2`}
            fill="#f97316"
            fillOpacity="0.08"
          />

          {/* Data Points */}
          {points.map((pt, idx) => {
            const lineY = slope * pt.x + intercept;
            const isCorrect = (pt.y > lineY ? 1 : -1) === pt.label;
            const fillColor = pt.label === 1 ? "#38bdf8" : "#fb923c";

            return (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="0.045"
                  fill={fillColor}
                  stroke={isCorrect ? "#0f172a" : "#ef4444"}
                  strokeWidth="0.015"
                />
                {!isCorrect && (
                  <circle cx={pt.x} cy={pt.y} r="0.07" fill="none" stroke="#ef4444" strokeWidth="0.01" />
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating legend */}
        <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur border border-slate-800 rounded px-2.5 py-1 text-[11px] flex items-center gap-3 text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <span>Class A</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
            <span>Class B</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-400">
            <span className="w-2 h-2 rounded-full border border-red-400"></span>
            <span>Error</span>
          </div>
        </div>
      </div>

      {/* Control Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Slope (m): Weight Rotation</span>
            <span className="text-cyan-400 font-semibold">{slope.toFixed(2)}</span>
          </div>
          <input
            id="slider-slope"
            type="range"
            min="-3.0"
            max="3.0"
            step="0.05"
            value={slope}
            onChange={(e) => setSlope(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Intercept (c): Bias Threshold</span>
            <span className="text-cyan-400 font-semibold">{intercept.toFixed(2)}</span>
          </div>
          <input
            id="slider-intercept"
            type="range"
            min="-1.5"
            max="1.5"
            step="0.05"
            value={intercept}
            onChange={(e) => setIntercept(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
        </div>
      </div>

      {isTargetMet ? (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Objective Achieved!</span> Separating boundary isolated both clusters with {accuracy}% accuracy. The hyperplane cleanly bifurcates the feature space.
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400">
          Goal: Rotate and offset the boundary line until accuracy reaches <span className="text-cyan-400 font-semibold">{targetAccuracy}%</span>.
        </p>
      )}
    </div>
  );
};
