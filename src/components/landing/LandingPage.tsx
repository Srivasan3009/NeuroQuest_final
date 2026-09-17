import React, { useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  Bot,
  Terminal,
  ShieldCheck,
  Zap,
  BookOpen,
  Sliders,
  CheckCircle2,
  Award
} from "lucide-react";
import { Stage } from "../../types";
import { DecisionBoundaryWidget } from "../quest/widgets/DecisionBoundaryWidget";

interface LandingPageProps {
  stages: Stage[];
  onStartJourney: (questId?: string) => void;
  onExplorePlayground: () => void;
  onOpenTutor: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  stages,
  onStartJourney,
  onExplorePlayground,
  onOpenTutor,
}) => {
  const [heroAccuracy, setHeroAccuracy] = useState<number>(78);
  const [heroGoalMet, setHeroGoalMet] = useState<boolean>(false);

  return (
    <div id="landing-page-root" className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-8 sm:pt-20 sm:pb-16 overflow-hidden">
        {/* Subtle geometric ambient backdrop glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-5 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Artificial Intelligence Curriculum</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-100 tracking-tight font-sans leading-[1.15]">
              Learn AI by actually <span className="text-cyan-400">interacting</span> with it.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed max-w-2xl mx-auto">
              Master artificial intelligence through short, hands-on micro-quests. Explore decision boundaries, adjust neuron weights, tokenize semantic vectors, and build autonomous agents.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                id="hero-start-journey-btn"
                onClick={() => onStartJourney("q1-ai-vs-ml")}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-sans text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.02]"
              >
                <span>Start Learning Journey</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-explore-playground-btn"
                onClick={onExplorePlayground}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium font-sans text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Open AI Playground</span>
              </button>
            </div>
          </div>

          {/* Embedded Hero Interactive Preview */}
          <div className="mt-14 max-w-3xl mx-auto">
            <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    Quest Preview: Machine Learning Hyperplane Separator
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400">
                  Try adjusting the sliders live below:
                </span>
              </div>

              <DecisionBoundaryWidget
                initialSlope={1.2}
                initialIntercept={-0.1}
                targetAccuracy={95}
                onGoalAchieved={(achieved, acc) => {
                  setHeroGoalMet(achieved);
                  setHeroAccuracy(acc);
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PEDAGOGICAL PHILOSOPHY: LEARN -> INTERACT -> SOLVE -> PROVE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase">
            Pedagogical Engine
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 font-sans tracking-tight">
            Learn → Interact → Solve → Prove
          </h2>
          <p className="text-sm text-slate-400 font-sans max-w-xl mx-auto">
            No passive 2-hour video lectures. Every concept is internalized through hands-on experimental iteration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase">1. Learn</div>
            <h3 className="text-base font-bold text-slate-100 font-sans">Clear Mental Models</h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Understand the core mechanics, intuitions, and formal equations behind the concept without jargon bloat.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-mono font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-sky-400 font-bold uppercase">2. Interact</div>
            <h3 className="text-base font-bold text-slate-100 font-sans">Dynamic Sandboxes</h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Experiment with parameters, weights, loss gradients, and prompts directly in real-time browser simulations.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-amber-400 font-bold uppercase">3. Solve</div>
            <h3 className="text-base font-bold text-slate-100 font-sans">Target Challenges</h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Achieve measurable targets: hit 95% classification accuracy, tune prompts to avoid hallucinations, or fix agent loops.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-emerald-400 font-bold uppercase">4. Prove</div>
            <h3 className="text-base font-bold text-slate-100 font-sans">Verify Comprehension</h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Answer rigorous conceptual questions with instant feedback and engineering explanations to lock in mastery.
            </p>
          </div>
        </div>
      </section>

      {/* 3. STRUCTURED 6-STAGE LEARNING PATH PREVIEW */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase">
              Curriculum Map
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 font-sans tracking-tight mt-1">
              From Foundations to Autonomous Agents
            </h2>
          </div>
          <button
            onClick={() => onStartJourney()}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View Complete Syllabus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stages.map((st) => (
            <div
              key={st.id}
              onClick={() => onStartJourney(st.quests[0]?.id)}
              className="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 transition-all cursor-pointer group space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-cyan-400 font-bold">
                  Stage 0{st.number}
                </span>
                <span className="text-xs font-mono text-slate-400">{st.quests.length} Quests</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-100 font-sans group-hover:text-cyan-300 transition-colors">
                  {st.title}
                </h3>
                <p className="text-xs text-slate-400 font-sans line-clamp-2">
                  {st.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>{st.subtitle}</span>
                <span className="text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Start Stage →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DUAL HIGHLIGHTS: NEURO AI TUTOR & PLAYGROUND */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Neuro AI Tutor Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-7 space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono text-cyan-400 font-semibold uppercase">
                Integrated Socratic Mentor
              </div>
              <h3 className="text-xl font-bold text-slate-100 font-sans">
                Neuro AI: Socratic Pedagogical Guidance
              </h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Rather than hallucinating quick solutions, Neuro AI acts as your pedagogical tutor. It adjusts explanations from basic analogies to formal mathematics, highlights common misconceptions, and generates practice drills.
              </p>
            </div>

            <button
              onClick={onOpenTutor}
              className="px-5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span>Talk with Neuro AI</span>
            </button>
          </div>

          {/* Playground Lab Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-7 space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono text-sky-400 font-semibold uppercase">
                Interactive Sandbox
              </div>
              <h3 className="text-xl font-bold text-slate-100 font-sans">
                Interactive Visual Sandbox
              </h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Interact with live 2D decision boundary hyperplanes and explore real-time subword tokenization and vector cosine similarity embedding spaces.
              </p>
            </div>

            <button
              onClick={onExplorePlayground}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Launch Sandbox Benches</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-4 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-sans">
            Ready to master Artificial Intelligence?
          </h2>
          <p className="text-sm text-slate-400 font-sans max-w-lg mx-auto">
            Take your first 5-minute quest today. No prerequisites or complex local environments required.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onStartJourney("q1-ai-vs-ml")}
              className="px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-sans text-sm inline-flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              <span>Begin Quest 1: AI Foundations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
