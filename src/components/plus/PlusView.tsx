import React, { useState } from "react";
import {
  Crown,
  Check,
  Zap,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Bot,
  Ban,
  Clock
} from "lucide-react";
import { UserProfile, AppTheme } from "../../types";
import { soundFx } from "../../utils/sound";

interface PlusViewProps {
  user: UserProfile;
  onTogglePlus: () => void;
  theme?: AppTheme;
}

export const PlusView: React.FC<PlusViewProps> = ({
  user,
  onTogglePlus,
  theme = "cyber-dark"
}) => {
  const isRiso = theme === "riso-pop";
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [policyModal, setPolicyModal] = useState<string | null>(null);

  const handleSubscribe = () => {
    soundFx.playChestOpen();
    onTogglePlus();
  };

  return (
    <div id="plus-view" className="space-y-6 pb-24 max-w-lg mx-auto px-4 pt-2">
      {/* 1. Hero Mascot & Banner matching video */}
      <div
        className={`p-6 rounded-3xl text-center space-y-3 relative overflow-hidden transition-all ${
          isRiso
            ? "bg-[#FFFDF9] border-2 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18]"
            : "bg-gradient-to-b from-violet-950/60 via-slate-900 to-slate-950 border border-violet-500/40 shadow-2xl"
        }`}
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Crown className="w-3.5 h-3.5 fill-current" />
          <span>NEUROQUEST PLUS</span>
        </div>

        {/* Mascot holding crown */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-violet-600/20 border border-violet-400/40 flex items-center justify-center text-violet-300 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          <Bot className="w-11 h-11" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100 uppercase leading-none">
          NO ADS. <br />
          MORE FLOW.
        </h1>

        <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
          The clean way to master modern AI — zero interruptions, zero anxiety on sparks or hints,
          one simple subscription.
        </p>

        {user.isPlus && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            <Check className="w-4 h-4" />
            <span>PLUS SUBSCRIPTION ACTIVE</span>
          </div>
        )}
      </div>

      {/* 2. Pricing Selector matching video */}
      <div
        className={`p-4 rounded-3xl space-y-4 transition-all ${
          isRiso
            ? "bg-[#FFFDF9] border-2 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18]"
            : "bg-slate-900/90 border border-slate-800 shadow-md"
        }`}
      >
        <div className="text-[10px] font-mono text-center uppercase tracking-widest text-slate-400 font-bold">
          THINK PLUS PLANS
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Monthly */}
          <button
            onClick={() => setSelectedPlan("monthly")}
            className={`p-4 rounded-2xl text-left border transition-all ${
              selectedPlan === "monthly"
                ? isRiso
                  ? "bg-[#FEF08A] border-2 border-[#1E1B18] shadow-sm"
                  : "bg-amber-500/10 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                : "bg-slate-950 border-slate-800 text-slate-400"
            }`}
          >
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400">
              MONTHLY
            </div>
            <div className="text-xl font-black text-slate-100 font-mono mt-1">₹299</div>
            <div className="text-[10px] text-slate-400 mt-0.5">$3.99 / mo</div>
          </button>

          {/* Yearly */}
          <button
            onClick={() => setSelectedPlan("yearly")}
            className={`p-4 rounded-2xl text-left border relative transition-all ${
              selectedPlan === "yearly"
                ? isRiso
                  ? "bg-[#FEF08A] border-2 border-[#1E1B18] shadow-sm"
                  : "bg-amber-500/10 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                : "bg-slate-950 border-slate-800 text-slate-400"
            }`}
          >
            <span className="absolute -top-2 right-2 text-[9px] font-mono font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
              SAVE 40%
            </span>
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400">
              YEARLY
            </div>
            <div className="text-xl font-black text-slate-100 font-mono mt-1">₹3,350</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Yearly saves almost a month</div>
          </button>
        </div>

        {/* Subscribe Action Buttons matching video */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleSubscribe}
            className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-98 ${
              user.isPlus
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : isRiso
                ? "bg-[#4F46E5] text-white hover:bg-[#4338CA] border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
                : "bg-gradient-to-r from-amber-400 via-amber-500 to-violet-500 text-slate-950 hover:brightness-110 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
            }`}
          >
            {user.isPlus
              ? "MANAGE SUBSCRIPTION (PLUS ACTIVE)"
              : selectedPlan === "monthly"
              ? "SUBSCRIBE MONTHLY • ₹299"
              : "SUBSCRIBE YEARLY • ₹3,350"}
          </button>
        </div>
      </div>

      {/* 3. Feature Perks matching video */}
      <div className="space-y-2.5">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-rose-400">
            <Ban className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">No ads</div>
            <div className="text-xs text-slate-400">(ya, I hate them too)</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">Unlimited Sparks</div>
            <div className="text-xs text-slate-400">Ask NEUROBOT endless deep dive questions</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-violet-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">Early access features</div>
            <div className="text-xs text-slate-400">(waiting is boring)</div>
          </div>
        </div>
      </div>

      {/* 4. Policies Box matching video */}
      <div
        className={`p-4 rounded-2xl space-y-2 transition-all ${
          isRiso
            ? "bg-[#FFFDF9] border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
            : "bg-slate-900/80 border border-slate-800"
        }`}
      >
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-2">
          POLICIES
        </div>

        <div className="space-y-1 text-xs">
          {["Privacy Policy", "Terms of Service", "Refund & Cancellation", "Customer Support"].map(
            (policy, i) => (
              <button
                key={i}
                onClick={() => setPolicyModal(policy)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 text-slate-300 hover:text-cyan-400 transition-colors"
              >
                <span>{policy}</span>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </button>
            )
          )}
        </div>
      </div>

      {/* Policy Modal */}
      {policyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl p-6 bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-100">{policyModal}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              NeuroQuest follows privacy-first policies. Your learning telemetry and prompt experiments
              are safely kept in your local workspace sandbox. Subscription cancellations take effect
              at the conclusion of the active billing cycle.
            </p>
            <button
              onClick={() => setPolicyModal(null)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-cyan-500 text-slate-950"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
