import React from "react";
import { Github, ExternalLink, Cpu, Shield, Sparkles } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Vision */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <BrandLogo isDark={true} size="sm" showText={true} />
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-sm">
              An interactive learning platform designed to teach students Artificial Intelligence through short, engaging, hands-on learning experiences.
            </p>
            <div className="flex items-center gap-3 text-slate-500 text-[11px] font-mono">
              <span>Learn</span>
              <span>➔</span>
              <span>Interact</span>
              <span>➔</span>
              <span>Solve</span>
              <span>➔</span>
              <span>Prove</span>
            </div>
          </div>

          {/* Curriculum Stages */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase text-slate-200 font-semibold tracking-wider">
              Learning Path
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400 font-sans">
              <li>1. AI Foundations</li>
              <li>2. Machine Learning</li>
              <li>3. Neural Networks</li>
              <li>4. Generative AI</li>
              <li>5. AI Agents</li>
              <li>6. AI Projects</li>
            </ul>
          </div>

          {/* Architecture & Stack */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase text-slate-200 font-semibold tracking-wider">
              Architecture
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400 font-sans">
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>Adaptive Pedagogical Mentor</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>Local Storage Architecture</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Client Persistent State</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div>
            © 2026 NeuroQuest. Built for hands-on, rigorous AI mastery.
          </div>
          <div className="flex items-center gap-4">
            <span>Server-side API Protection</span>
            <span>•</span>
            <span>No AI Slop</span>
            <span>•</span>
            <span>Universal Approximation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
