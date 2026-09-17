import React, { useState, useEffect } from "react";
import { CheckCircle2, RotateCcw, AlertCircle, Bot, ArrowRight, Database, Calculator, Bell } from "lucide-react";

interface AgentLoopWidgetProps {
  onGoalAchieved?: (achieved: boolean) => void;
}

interface StepTrace {
  step: number;
  thought: string;
  actionTool: string;
  actionArgs: string;
  observation: string;
}

export const AgentLoopWidget: React.FC<AgentLoopWidgetProps> = ({ onGoalAchieved }) => {
  const [executedSteps, setExecutedSteps] = useState<StepTrace[]>([]);
  const [currentThought, setCurrentThought] = useState<string>(
    "I need to inspect customer account #4092 database telemetry to examine recent network anomalies."
  );

  const usedTools = executedSteps.map((s) => s.actionTool);
  const isGoalMet =
    usedTools.includes("queryDB") &&
    usedTools.includes("calculator") &&
    usedTools.includes("notifySlack");

  useEffect(() => {
    onGoalAchieved?.(isGoalMet);
  }, [isGoalMet, onGoalAchieved]);

  const dispatchTool = (tool: "queryDB" | "calculator" | "notifySlack") => {
    const nextStepNum = executedSteps.length + 1;
    let trace: StepTrace;

    if (tool === "queryDB") {
      trace = {
        step: nextStepNum,
        thought: "Querying account #4092 database logs to calculate error frequency.",
        actionTool: "queryDB",
        actionArgs: "{ accountId: 4092, range: '24h' }",
        observation: "Result: 1,420 total API calls, 284 HTTP 500 server errors logged.",
      };
      setCurrentThought("Errors detected! I should use the calculator to determine the exact error percentage.");
    } else if (tool === "calculator") {
      trace = {
        step: nextStepNum,
        thought: "Computing ratio: (284 / 1420) * 100 to evaluate service-level breach.",
        actionTool: "calculator",
        actionArgs: "{ expression: '(284 / 1420) * 100' }",
        observation: "Result: 20.0% error rate (critical threshold is > 5.0%).",
      };
      setCurrentThought("The error rate is 20%! I must notify the on-call team via Slack alert immediately.");
    } else {
      trace = {
        step: nextStepNum,
        thought: "Dispatching urgent alert with diagnostic logs to #incident-response channel.",
        actionTool: "notifySlack",
        actionArgs: "{ channel: '#incident-response', severity: 'HIGH', msg: 'Account 4092 error rate 20%' }",
        observation: "Result: Message published successfully (msg_id: slack_88921).",
      };
      setCurrentThought("Incident reported. ReAct autonomous loop concluded successfully.");
    }

    setExecutedSteps((prev) => [...prev, trace]);
  };

  const resetLoop = () => {
    setExecutedSteps([]);
    setCurrentThought("I need to inspect customer account #4092 database telemetry to examine recent network anomalies.");
  };

  return (
    <div id="agent-loop-widget" className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono font-medium text-cyan-400 uppercase tracking-wider">
            ReAct Autonomous Execution Loop
          </span>
          <h4 className="text-sm font-semibold text-slate-100 mt-0.5">
            Thought ➔ Action ➔ Observation Pipeline
          </h4>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              isGoalMet
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
            }`}
          >
            {isGoalMet ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>Mission: {isGoalMet ? "All 3 Tools Dispatched" : `${usedTools.length}/3 Tools Invoked`}</span>
          </div>
          <button
            id="reset-agent-loop-btn"
            onClick={resetLoop}
            title="Reset loop"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Agent Working Memory / Thought Bubble */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">
            Current Agent Reasoning Thought:
          </div>
          <p className="text-xs text-slate-200 font-sans italic">"{currentThought}"</p>
        </div>
      </div>

      {/* Tool Dispatch Palette */}
      <div>
        <div className="text-xs font-mono text-slate-400 mb-2">Available External Tools:</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            disabled={usedTools.includes("queryDB")}
            onClick={() => dispatchTool("queryDB")}
            className={`p-3 rounded-lg border text-left transition-all ${
              usedTools.includes("queryDB")
                ? "bg-slate-950 border-emerald-500/30 text-emerald-400 opacity-70"
                : "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200 hover:border-cyan-500"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Database className="w-4 h-4 text-cyan-400" />
              {usedTools.includes("queryDB") && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <div className="text-xs font-mono font-bold">queryDB()</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Fetch user logs & API counts</div>
          </button>

          <button
            type="button"
            disabled={usedTools.includes("calculator")}
            onClick={() => dispatchTool("calculator")}
            className={`p-3 rounded-lg border text-left transition-all ${
              usedTools.includes("calculator")
                ? "bg-slate-950 border-emerald-500/30 text-emerald-400 opacity-70"
                : "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200 hover:border-cyan-500"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Calculator className="w-4 h-4 text-cyan-400" />
              {usedTools.includes("calculator") && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <div className="text-xs font-mono font-bold">calculator()</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Compute arithmetic ratios</div>
          </button>

          <button
            type="button"
            disabled={usedTools.includes("notifySlack")}
            onClick={() => dispatchTool("notifySlack")}
            className={`p-3 rounded-lg border text-left transition-all ${
              usedTools.includes("notifySlack")
                ? "bg-slate-950 border-emerald-500/30 text-emerald-400 opacity-70"
                : "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200 hover:border-cyan-500"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Bell className="w-4 h-4 text-cyan-400" />
              {usedTools.includes("notifySlack") && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <div className="text-xs font-mono font-bold">notifySlack()</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Alert on-call engineers</div>
          </button>
        </div>
      </div>

      {/* Execution Trace Timeline */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
          <span>Agent Execution Trace Logs</span>
          <span className="text-[11px] text-slate-500">Chronological history</span>
        </div>

        {executedSteps.length === 0 ? (
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 text-center text-xs text-slate-500 italic">
            No actions executed yet. Select a tool above to begin the agent loop.
          </div>
        ) : (
          <div className="space-y-3">
            {executedSteps.map((trace) => (
              <div
                key={trace.step}
                className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2 text-xs font-mono"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-cyan-400 font-bold">Step #{trace.step}</span>
                  <span className="text-slate-500">Action: {trace.actionTool}</span>
                </div>
                <div className="text-slate-300">
                  <span className="text-amber-400 font-semibold">Thought:</span> {trace.thought}
                </div>
                <div className="text-slate-300">
                  <span className="text-sky-400 font-semibold">Action:</span> {trace.actionTool}(
                  <span className="text-slate-400">{trace.actionArgs}</span>)
                </div>
                <div className="bg-slate-900 border border-slate-800/80 rounded p-2 text-emerald-300">
                  <span className="text-slate-400">Observation:</span> {trace.observation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
