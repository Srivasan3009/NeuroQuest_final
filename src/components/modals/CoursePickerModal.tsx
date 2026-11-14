import React from "react";
import { X, Check, BookOpen, Sparkles, Bot, Cpu, Film, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Course, AppTheme } from "../../types";
import { soundFx } from "../../utils/sound";

interface CoursePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  activeCourseId: string;
  onSelectCourse: (course: Course) => void;
  theme?: AppTheme;
}

export const CoursePickerModal: React.FC<CoursePickerModalProps> = ({
  isOpen,
  onClose,
  courses,
  activeCourseId,
  onSelectCourse,
  theme = "neumorphic",
}) => {
  const isDark =
    theme === "obsidian-gold" ||
    theme === "obsidian-noir" ||
    theme === "cyber-dark" ||
    theme === "neon-matrix";

  const getIcon = (iconName: string) => {
    const colorClass = isDark ? "text-[#2997FF]" : "text-[#0071E3]";
    switch (iconName) {
      case "Cpu":
        return <Cpu className={`w-5 h-5 ${colorClass}`} />;
      case "Bot":
        return <Bot className={`w-5 h-5 ${colorClass}`} />;
      case "Sparkles":
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case "Film":
        return <Film className="w-5 h-5 text-rose-500" />;
      case "TrendingUp":
        return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      default:
        return <BookOpen className={`w-5 h-5 ${colorClass}`} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={`relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 space-y-5 max-h-[85vh] overflow-y-auto apple-surface ${
              isDark ? "text-zinc-100" : "text-[#1D1D1F]"
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between pb-4 border-b ${
                isDark ? "border-white/[0.08]" : "border-black/[0.06]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    isDark
                      ? "bg-[#2997FF]/15 text-[#2997FF]"
                      : "bg-[#0071E3]/10 text-[#0071E3]"
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div
                    className={`text-[11px] font-medium uppercase tracking-wider ${
                      isDark ? "text-zinc-400" : "text-[#6E6E73]"
                    }`}
                  >
                    Curriculum
                  </div>
                  <h2 className="font-display text-lg font-semibold tracking-tight">
                    Choose a Learning Track
                  </h2>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                aria-label="Close course picker"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isDark
                    ? "bg-white/[0.08] text-zinc-300 hover:bg-white/[0.14]"
                    : "bg-black/[0.05] text-[#6E6E73] hover:bg-black/[0.08] hover:text-[#1D1D1F]"
                }`}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Course items */}
            <div className="space-y-2.5">
              {courses.map((course) => {
                const isSelected = course.id === activeCourseId;
                return (
                  <motion.button
                    key={course.id}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => {
                      soundFx.playTap();
                      onSelectCourse(course);
                      onClose();
                    }}
                    className={`w-full text-left p-4 rounded-2xl transition-all flex items-start gap-3.5 border ${
                      isSelected
                        ? isDark
                          ? "bg-[#2997FF]/10 border-[#2997FF]/40"
                          : "bg-[#0071E3]/[0.05] border-[#0071E3]/40"
                        : isDark
                        ? "bg-[#2C2C2E]/60 border-white/[0.06] hover:bg-[#2C2C2E]"
                        : "bg-[#F5F5F7] border-black/[0.04] hover:bg-[#ECECF1]"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isDark ? "bg-[#1C1C1E]" : "bg-white shadow-xs"
                      }`}
                    >
                      {getIcon(course.icon)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`font-medium ${
                            isSelected
                              ? "text-[#0071E3] dark:text-[#2997FF]"
                              : isDark
                              ? "text-zinc-400"
                              : "text-[#6E6E73]"
                          }`}
                        >
                          {course.tag}
                        </span>
                        <span className={isDark ? "text-zinc-600" : "text-black/25"}>·</span>
                        <span
                          className={`font-mono tabular-nums ${
                            isDark ? "text-zinc-400" : "text-[#6E6E73]"
                          }`}
                        >
                          {course.lessonsCount} quests
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-sm sm:text-[15px] mt-0.5 leading-snug">
                        {course.title}
                      </h3>
                      <p
                        className={`text-xs mt-0.5 line-clamp-2 ${
                          isDark ? "text-zinc-400" : "text-[#6E6E73]"
                        }`}
                      >
                        {course.subtitle}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#0071E3] text-white flex items-center justify-center shrink-0 mt-1">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div
              className={`pt-1 text-center text-xs ${
                isDark ? "text-zinc-400" : "text-[#6E6E73]"
              }`}
            >
              Switch tracks anytime — your progress stays saved automatically.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
