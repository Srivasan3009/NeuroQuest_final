import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppTheme } from "../../types";

interface BrandLogoProps {
  theme?: AppTheme;
  isDark?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  onClick?: () => void;
  quote?: string;
  tooltipPosition?: "bottom" | "top" | "right";
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  theme,
  isDark: isDarkProp,
  size = "md",
  showText = true,
  className = "",
  onClick,
  quote = "Learn today for a brighter tomorrow",
  tooltipPosition = "bottom",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const isDark =
    isDarkProp !== undefined
      ? isDarkProp
      : theme === "obsidian-gold" ||
        theme === "obsidian-noir" ||
        theme === "cyber-dark" ||
        theme === "neon-matrix";

  const brainColor = isDark ? "#F5F5F7" : "#1D1D1F";
  const bulbGlowColor = isDark ? "#FBBF24" : "#F59E0B";
  const bulbWireColor = isDark ? "#F5F5F7" : "#1D1D1F";
  const bulbGlassColor = isDark ? "#FFFBEB" : "#FEF3C7";

  const dimensions = {
    sm: { icon: "w-6 h-6", text: "text-sm", gap: "gap-2" },
    md: { icon: "w-8 h-8", text: "text-base", gap: "gap-2" },
    lg: { icon: "w-11 h-11", text: "text-xl", gap: "gap-2.5" },
    xl: { icon: "w-14 h-14", text: "text-2xl", gap: "gap-3" },
  }[size];

  const positionClasses = {
    bottom: "top-full mt-2.5 left-1/2 -translate-x-1/2",
    top: "bottom-full mb-2.5 left-1/2 -translate-x-1/2",
    right: "left-full ml-3 top-1/2 -translate-y-1/2",
  }[tooltipPosition];

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={onClick}
        className={`inline-flex items-center select-none ${dimensions.gap} ${
          onClick ? "cursor-pointer" : "cursor-default"
        } group ${className}`}
        id="brand-neuroquest-logo"
        title={quote}
      >
        <div
          className={`relative shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${dimensions.icon}`}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 45 15 C 32 14, 18 25, 18 40 C 12 43, 10 54, 15 62 C 11 68, 14 78, 22 82 C 30 87, 42 85, 45 76 Z"
              fill={brainColor}
            />
            <path
              d="M 23 42 C 28 39, 36 43, 33 50 M 20 60 C 27 58, 35 64, 30 72 M 35 77 C 40 76, 44 68, 42 60"
              stroke={isDark ? "#0B0B0D" : "#F5F5F7"}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M 55 15 C 68 14, 82 25, 82 40 C 88 43, 90 54, 85 62 C 89 68, 86 78, 78 82 C 70 87, 58 85, 55 76 Z"
              fill={brainColor}
            />
            <path
              d="M 77 42 C 72 39, 64 43, 67 50 M 80 60 C 73 58, 65 64, 70 72 M 65 77 C 60 76, 56 68, 58 60"
              stroke={isDark ? "#0B0B0D" : "#F5F5F7"}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <line
              x1="50"
              y1="8"
              x2="50"
              y2="34"
              stroke={bulbWireColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <rect x="46" y="32" width="8" height="5" rx="1.5" fill={bulbWireColor} />
            <defs>
              <radialGradient id="bulbGlowGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="60%" stopColor={bulbGlowColor} stopOpacity="0.7" />
                <stop offset="100%" stopColor={bulbGlowColor} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="47" r="15" fill="url(#bulbGlowGrad)" opacity="0.75" />
            <path
              d="M 45 37 C 42 39, 40 43, 40 48 C 40 54, 44 58, 47 60 L 47 63 L 53 63 L 53 60 C 56 58, 60 54, 60 48 C 60 43, 58 39, 55 37 Z"
              fill={bulbGlassColor}
              stroke={bulbWireColor}
              strokeWidth="2.2"
            />
            <path
              d="M 47 48 Q 50 43 53 48"
              stroke="#D97706"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {showText && (
          <span
            className={`font-display font-bold tracking-tight transition-colors duration-200 whitespace-nowrap ${
              dimensions.text
            } ${isDark ? "text-[#F5F5F7]" : "text-[#1D1D1F]"}`}
          >
            NeuroQuest
          </span>
        )}
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            id="logo-hover-quote-tooltip"
            initial={{ opacity: 0, y: tooltipPosition === "bottom" ? -4 : 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: tooltipPosition === "bottom" ? -3 : 3, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute z-50 pointer-events-none whitespace-nowrap ${positionClasses}`}
          >
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-lg border backdrop-blur-md ${
                isDark
                  ? "bg-[#1C1C1E]/95 text-zinc-200 border-white/10"
                  : "bg-[#1D1D1F]/95 text-white border-black/10"
              }`}
            >
              {quote}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
