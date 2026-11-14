import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Send,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  GraduationCap,
  Bot,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TutorChatMessage, TutorDifficulty, TutorMode, AppTheme } from "../../types";
import { askNeuroTutor } from "../../services/tutorApi";

interface NeuroTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeQuestTitle?: string;
  activeStageTitle?: string;
  activePhase?: string;
  theme?: AppTheme;
}

export const NeuroTutorDrawer: React.FC<NeuroTutorDrawerProps> = ({
  isOpen,
  onClose,
  activeQuestTitle = "Artificial Intelligence",
  activeStageTitle = "Foundations",
  activePhase = "Learn",
  theme = "neumorphic",
}) => {
  const isDark =
    theme === "obsidian-gold" ||
    theme === "obsidian-noir" ||
    theme === "cyber-dark" ||
    theme === "neon-matrix";

  const [difficulty, setDifficulty] = useState<TutorDifficulty>("intermediate");

  const createWelcomeMessage = (): TutorChatMessage => ({
    id: "welcome-msg",
    sender: "neuro-ai",
    text: `Welcome to your study session. I'm NeuroBot, powered by Gemini. Instead of handing out shortcuts, I help you build lasting intuition.\n\nWhat would you like to explore in ${activeQuestTitle}?`,
    timestamp: "Just now",
  });

  const [messages, setMessages] = useState<TutorChatMessage[]>([createWelcomeMessage()]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleResetChat = () => {
    setMessages([createWelcomeMessage()]);
    setErrorBanner(null);
  };

  const sendMessage = async (customPrompt?: string, mode: TutorMode = "chat") => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isLoading) return;

    setErrorBanner(null);

    const history = messages
      .filter((m) => m.id !== "welcome-msg" && !m.id.startsWith("err-"))
      .map((m) => ({
        role: (m.sender === "user" ? "user" : "model") as "user" | "model",
        text: m.text,
      }));

    const userMessage: TutorChatMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInputText("");
    setIsLoading(true);

    try {
      const response = await askNeuroTutor({
        prompt: textToSend,
        questTitle: activeQuestTitle,
        stageTitle: activeStageTitle,
        currentPhase: activePhase,
        difficulty,
        mode,
        history,
      });

      const aiMessage: TutorChatMessage = {
        id: "ai-" + Date.now(),
        sender: "neuro-ai",
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        mode,
        difficulty,
        source: response.source,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      const errMsg =
        err instanceof Error && err.message
          ? err.message
          : "Unable to reach NeuroBot right now. Please try again.";
      setErrorBanner(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPill = (prompt: string, mode: TutorMode) => {
    sendMessage(prompt, mode);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
          {/* Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
          />

          {/* Slide-over Apple Sheet */}
          <motion.aside
            id="neuro-tutor-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className={`absolute inset-y-0 right-0 w-full sm:w-[440px] flex flex-col pointer-events-auto border-l ${
              isDark
                ? "bg-[#141416] text-zinc-100 border-white/[0.08] shadow-2xl"
                : "bg-[#FBFBFD] text-[#1D1D1F] border-black/[0.08] shadow-2xl"
            }`}
          >
            {/* Header */}
            <div
              className={`px-5 py-4 border-b flex items-center justify-between apple-glass ${
                isDark ? "border-white/[0.08]" : "border-black/[0.06]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                    isDark
                      ? "bg-[#2997FF]/15 text-[#2997FF]"
                      : "bg-[#0071E3]/10 text-[#0071E3]"
                  }`}
                >
                  <Bot className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-semibold tracking-tight">
                      NeuroBot
                    </h3>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                        isDark
                          ? "bg-white/[0.08] text-zinc-300"
                          : "bg-black/[0.05] text-[#6E6E73]"
                      }`}
                    >
                      Gemini Tutor
                    </span>
                  </div>
                  <p
                    className={`text-xs truncate max-w-[230px] ${
                      isDark ? "text-zinc-400" : "text-[#6E6E73]"
                    }`}
                  >
                    {activeQuestTitle} · {activePhase}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <motion.button
                  id="reset-tutor-chat-btn"
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={handleResetChat}
                  title="New conversation"
                  aria-label="Reset conversation"
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isDark
                      ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08]"
                      : "text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.05]"
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.button>
                <motion.button
                  id="close-tutor-btn"
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={onClose}
                  aria-label="Close tutor drawer"
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isDark
                      ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08]"
                      : "text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.05]"
                  }`}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Depth Segmented Control */}
            <div
              className={`px-5 py-2.5 flex items-center justify-between border-b ${
                isDark
                  ? "bg-[#1C1C1E]/60 border-white/[0.06]"
                  : "bg-white/70 border-black/[0.05]"
              }`}
            >
              <span
                className={`text-xs font-medium flex items-center gap-1.5 ${
                  isDark ? "text-zinc-400" : "text-[#6E6E73]"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
                <span>Explanation Depth</span>
              </span>

              <div
                className={`flex rounded-full p-0.5 border ${
                  isDark
                    ? "bg-[#141416] border-white/[0.08]"
                    : "bg-black/[0.05] border-black/[0.04]"
                }`}
              >
                {(["beginner", "intermediate", "advanced"] as TutorDifficulty[]).map((level) => {
                  const active = difficulty === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
                        active
                          ? isDark
                            ? "bg-[#2C2C2E] text-white shadow-xs"
                            : "bg-white text-[#1D1D1F] shadow-xs"
                          : isDark
                          ? "text-zinc-400 hover:text-zinc-200"
                          : "text-[#6E6E73] hover:text-[#1D1D1F]"
                      }`}
                    >
                      {level === "beginner"
                        ? "Simple"
                        : level === "intermediate"
                        ? "Standard"
                        : "Formal"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Prompts Strip */}
            <div
              className={`px-5 py-2.5 overflow-x-auto flex items-center gap-2 no-scrollbar border-b ${
                isDark ? "border-white/[0.06]" : "border-black/[0.05]"
              }`}
            >
              <button
                type="button"
                onClick={() => handleQuickPill("Explain simply", "explain")}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors border whitespace-nowrap ${
                  isDark
                    ? "bg-[#1C1C1E] border-white/[0.08] text-zinc-200 hover:bg-[#2C2C2E]"
                    : "bg-white border-black/[0.08] text-[#1D1D1F] hover:bg-[#F2F2F7]"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Explain simply</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPill("Give a hint", "hint")}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors border whitespace-nowrap ${
                  isDark
                    ? "bg-[#1C1C1E] border-white/[0.08] text-zinc-200 hover:bg-[#2C2C2E]"
                    : "bg-white border-black/[0.08] text-[#1D1D1F] hover:bg-[#F2F2F7]"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
                <span>Socratic hint</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPill("Common misconceptions", "misconceptions")}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors border whitespace-nowrap ${
                  isDark
                    ? "bg-[#1C1C1E] border-white/[0.08] text-zinc-200 hover:bg-[#2C2C2E]"
                    : "bg-white border-black/[0.08] text-[#1D1D1F] hover:bg-[#F2F2F7]"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Misconceptions</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPill("Practice drill", "practice")}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors border whitespace-nowrap ${
                  isDark
                    ? "bg-[#1C1C1E] border-white/[0.08] text-zinc-200 hover:bg-[#2C2C2E]"
                    : "bg-white border-black/[0.08] text-[#1D1D1F] hover:bg-[#F2F2F7]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Practice drill</span>
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => {
                const isAI = msg.sender === "neuro-ai";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    className={`flex gap-2.5 ${isAI ? "items-start" : "items-end justify-end"}`}
                  >
                    {isAI && (
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isDark
                            ? "bg-[#2997FF]/15 text-[#2997FF]"
                            : "bg-[#0071E3]/10 text-[#0071E3]"
                        }`}
                      >
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                        isAI
                          ? isDark
                            ? "bg-[#1C1C1E] border border-white/[0.08] text-zinc-100"
                            : "bg-white border border-black/[0.06] text-[#1D1D1F] shadow-xs"
                          : "bg-[#0071E3] text-white shadow-xs"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      <div
                        className={`text-[10px] mt-1.5 font-mono tabular-nums flex items-center gap-1.5 ${
                          isAI
                            ? isDark
                              ? "text-zinc-500"
                              : "text-[#86868B]"
                            : "text-white/75"
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {msg.source && (
                          <span>
                            · {msg.source === "gemini" ? "Gemini AI" : "Pedagogy Engine"}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {errorBanner && (
                <div
                  role="alert"
                  className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                    isDark
                      ? "bg-rose-500/10 border-rose-500/25 text-rose-300"
                      : "bg-rose-50 border-rose-200 text-rose-700"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorBanner}</span>
                </div>
              )}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5 items-center"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isDark ? "bg-[#2997FF]/15 text-[#2997FF]" : "bg-[#0071E3]/10 text-[#0071E3]"
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                  </div>
                  <div
                    className={`px-3.5 py-2 rounded-2xl text-xs ${
                      isDark
                        ? "bg-[#1C1C1E] text-zinc-400 border border-white/[0.06]"
                        : "bg-white text-[#6E6E73] border border-black/[0.06]"
                    }`}
                  >
                    NeuroBot is thinking...
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer */}
            <div
              className={`p-4 border-t apple-glass ${
                isDark ? "border-white/[0.08]" : "border-black/[0.06]"
              }`}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  id="tutor-input-box"
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Ask about ${activeQuestTitle}...`}
                  className={`flex-1 rounded-full px-4 py-2.5 text-[13px] transition-colors focus:outline-none border ${
                    isDark
                      ? "bg-[#1C1C1E] border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-[#2997FF]"
                      : "bg-white border-black/[0.08] text-[#1D1D1F] placeholder-[#86868B] focus:border-[#0071E3]"
                  }`}
                />
                <motion.button
                  id="send-tutor-msg-btn"
                  whileTap={{ scale: 0.94 }}
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  aria-label="Send message"
                  className="w-10 h-10 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white flex items-center justify-center transition-colors shrink-0 disabled:opacity-35 disabled:cursor-not-allowed shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
