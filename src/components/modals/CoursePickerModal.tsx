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
  const isNeumorphic = theme === "neumorphic";
  const isDark = theme === "obsidian-gold" || theme === "obsidian-noir";

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Cpu":
        return <Cpu className={`w-5 h-5 ${isNeumorphic ? "text-indigo-600" : isDark ? "text-amber-400" : "text-[#4F46E5]"}`} />;
      case "Bot":
        return <Bot className={`w-5 h-5 ${isNeumorphic ? "text-indigo-600" : isDark ? "text-amber-400" : "text-[#4F46E5]"}`} />;
      case "Sparkles":
        return <Sparkles className={`w-5 h-5 ${isNeumorphic ? "text-amber-600" : isDark ? "text-amber-400" : "text-[#EA580C]"}`} />;
      case "Film":
        return <Film className={`w-5 h-5 ${isNeumorphic ? "text-rose-600" : isDark ? "text-rose-400" : "text-[#E11D48]"}`} />;
      case "TrendingUp":
        return <TrendingUp className={`w-5 h-5 ${isNeumorphic ? "text-emerald-600" : isDark ? "text-emerald-400" : "text-[#059669]"}`} />;
      default:
        return <BookOpen className={`w-5 h-5 ${isNeumorphic ? "text-indigo-600" : isDark ? "text-amber-400" : "text-[#4F46E5]"}`} />;
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
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className={`relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto transition-all ${
              isNeumorphic
                ? "neu-raised text-slate-800"
                : isDark
                ? "bg-[#18181B] border-2 border-[#3F3F46] shadow-2xl text-zinc-100"
                : "bg-[#FFFDF9] border-2 border-[#1E1B18] shadow-[5px_5px_0px_#1E1B18] text-[#1E1B18]"
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between pb-3 border-b ${
                isNeumorphic
                  ? "border-slate-300"
                  : isDark
                  ? "border-[#27272A]"
                  : "border-[#1E1B18]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    isNeumorphic
                      ? "neu-inset text-indigo-600"
                      : isDark
                      ? "bg-amber-400/10 border-2 border-amber-400 text-amber-300"
                      : "bg-[#FEF08A] border-2 border-[#1E1B18] text-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]"
                  }`}
                >
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div
                    className={`text-[10px] font-mono uppercase tracking-widest font-black ${
                      isNeumorphic
                        ? "text-indigo-600"
                        : isDark
                        ? "text-amber-400"
                        : "text-[#4F46E5]"
                    }`}
                  >
                    CURRICULUM
                  </div>
                  <h2 className="text-lg font-black tracking-tight uppercase">Pick a course</h2>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`p-1.5 rounded-xl transition-colors ${
                  isNeumorphic
                    ? "neu-btn text-slate-600 hover:text-slate-950"
                    : isDark
                    ? "border-2 border-[#3F3F46] text-zinc-400 hover:text-zinc-100"
                    : "border-2 border-[#1E1B18] text-[#1E1B18] bg-white hover:bg-zinc-100"
                }`}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Course items */}
            <div className="space-y-2.5">
              {courses.map((course) => {
                const isSelected = course.id === activeCourseId;
                return (
                  <motion.button
                    key={course.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      soundFx.playTap();
                      onSelectCourse(course);
                      onClose();
                    }}
                    className={`w-full text-left p-4 rounded-2xl transition-all flex items-start gap-3.5 ${
                      isNeumorphic
                        ? isSelected
                          ? "neu-flat text-slate-900 ring-2 ring-indigo-500/50"
                          : "neu-raised text-slate-700 hover:text-slate-950"
                        : isSelected
                        ? isDark
                          ? "bg-[#27272A] border-2 border-amber-400 shadow-md"
                          : "bg-[#EEF2FF] border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]"
                        : isDark
                        ? "bg-[#27272A]/50 border-2 border-[#3F3F46] hover:border-zinc-500 text-zinc-300"
                        : "bg-white border-2 border-[#1E1B18]/30 hover:border-[#1E1B18] text-[#1E1B18]"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        isNeumorphic
                          ? isSelected
                            ? "neu-inset text-indigo-600"
                            : "neu-flat text-slate-600"
                          : isSelected
                          ? isDark
                            ? "bg-amber-400/20 border border-amber-400/40"
                            : "bg-[#FEF08A] border border-[#1E1B18]"
                          : isDark
                          ? "bg-[#18181B] border border-[#3F3F46]"
                          : "bg-[#FFFDF9] border border-zinc-200"
                      }`}
                    >
                      {getIcon(course.icon)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                            isNeumorphic
                              ? "neu-inset text-slate-600"
                              : isDark
                              ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                              : "bg-zinc-100 text-zinc-700 border border-zinc-300"
                          }`}
                        >
                          {course.tag}
                        </span>
                        <span
                          className={`text-xs font-mono ${
                            isNeumorphic ? "text-slate-500" : isDark ? "text-zinc-400" : "text-zinc-500"
                          }`}
                        >
                          {course.lessonsCount} lessons
                        </span>
                      </div>
                      <h3 className="font-black text-sm sm:text-base mt-1 leading-snug">
                        {course.title}
                      </h3>
                      <p
                        className={`text-xs mt-0.5 line-clamp-2 ${
                          isNeumorphic ? "text-slate-500" : isDark ? "text-zinc-400" : "text-zinc-600"
                        }`}
                      >
                        {course.subtitle}
                      </p>
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                          isNeumorphic
                            ? "neu-btn-primary text-white"
                            : isDark
                            ? "bg-amber-400 text-zinc-950 border border-amber-500"
                            : "bg-[#4F46E5] text-white border border-[#1E1B18]"
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div
              className={`pt-2 text-center text-xs font-mono ${
                isDark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              Switch courses anytime without losing your quest progress.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
