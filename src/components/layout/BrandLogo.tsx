import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Quote } from "lucide-react";
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
  quote = "Learn today for better tomorrow",
  tooltipPosition = "bottom",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Determine if active theme is dark mode
  const isDark =
    isDarkProp !== undefined
      ? isDarkProp
      : theme === "obsidian-gold" ||
        theme === "obsidian-noir" ||
        theme === "cyber-dark" ||
        theme === "neon-matrix";

  // When in Light Mode -> Use Dark Brain Logo (#0F172A / #18181B)
  // When in Dark Mode  -> Use Light Brain Logo (#FFFFFF / #F8FAFC)
  const brainColor = isDark ? "#FFFFFF" : "#111827";
  const bulbGlowColor = isDark ? "#FBBF24" : "#F59E0B";
  const bulbWireColor = isDark ? "#FFFFFF" : "#111827";
  const bulbGlassColor = isDark ? "#FFFFFF" : "#FEF3C7";
  const textColor = isDark ? "text-white" : "text-slate-900";

  // Size configurations
  const dimensions = {
    sm: { icon: "w-7 h-7", textTop: "text-xs leading-none", textBot: "text-xs leading-none tracking-tight", gap: "gap-2" },
    md: { icon: "w-9 h-9", textTop: "text-sm leading-tight font-black", textBot: "text-sm leading-none font-serif font-black tracking-tight", gap: "gap-2.5" },
    lg: { icon: "w-12 h-12", textTop: "text-lg leading-tight font-black", textBot: "text-lg leading-none font-serif font-black", gap: "gap-3" },
    xl: { icon: "w-16 h-16", textTop: "text-2xl leading-tight font-black", textBot: "text-2xl leading-none font-serif font-black", gap: "gap-4" },
  }[size];

  // Tooltip position positioning classes
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
        className={`inline-flex items-center select-none ${dimensions.gap} ${onClick ? "cursor-pointer" : "cursor-default"} group ${className}`}
        id="brand-neuroquest-logo"
        title={quote}
      >
        {/* Dynamic Responsive SVG Brain & Lightbulb Icon */}
        <div className={`relative shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${dimensions.icon}`}>
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-sm transition-all duration-300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Left Hemisphere Folds */}
            <path
              d="M 45 15 C 32 14, 18 25, 18 40 C 12 43, 10 54, 15 62 C 11 68, 14 78, 22 82 C 30 87, 42 85, 45 76 Z"
              fill={brainColor}
            />
            {/* Inner Left Hemisphere Sulcal Details */}
            <path
              d="M 23 42 C 28 39, 36 43, 33 50 M 20 60 C 27 58, 35 64, 30 72 M 35 77 C 40 76, 44 68, 42 60"
              stroke={isDark ? "#18181B" : "#F8FAFC"}
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Outer Right Hemisphere Folds */}
            <path
              d="M 55 15 C 68 14, 82 25, 82 40 C 88 43, 90 54, 85 62 C 89 68, 86 78, 78 82 C 70 87, 58 85, 55 76 Z"
              fill={brainColor}
            />
            {/* Inner Right Hemisphere Sulcal Details */}
            <path
              d="M 77 42 C 72 39, 64 43, 67 50 M 80 60 C 73 58, 65 64, 70 72 M 65 77 C 60 76, 56 68, 58 60"
              stroke={isDark ? "#18181B" : "#F8FAFC"}
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Hanging Cord & Socket */}
            <line
              x1="50"
              y1="8"
              x2="50"
              y2="34"
              stroke={bulbWireColor}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <rect
              x="46"
              y="32"
              width="8"
              height="5"
              rx="1.5"
              fill={bulbWireColor}
            />

            {/* Glowing Center Lightbulb in Medial Fissure */}
            <defs>
              <radialGradient id="bulbGlowGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={isDark ? "#FFFFFF" : "#FFFFFF"} stopOpacity="1" />
                <stop offset="60%" stopColor={bulbGlowColor} stopOpacity={isDark ? "0.85" : "0.75"} />
                <stop offset="100%" stopColor={bulbGlowColor} stopOpacity="0" />
              </radialGradient>
              <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Ambient Bulb Aura Glow */}
            <circle
              cx="50"
              cy="47"
              r="16"
              fill="url(#bulbGlowGrad)"
              opacity={isDark ? "0.95" : "0.8"}
              filter="url(#softGlow)"
            />

            {/* Lightbulb Glass Shape */}
            <path
              d="M 45 37 C 42 39, 40 43, 40 48 C 40 54, 44 58, 47 60 L 47 63 L 53 63 L 53 60 C 56 58, 60 54, 60 48 C 60 43, 58 39, 55 37 Z"
              fill={bulbGlassColor}
              stroke={bulbWireColor}
              strokeWidth="2.2"
            />
            {/* Bulb Filament */}
            <path
              d="M 47 48 Q 50 43 53 48"
              stroke={isDark ? "#F59E0B" : "#D97706"}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Typography: Serif High-Contrast 'Neuro' / 'Quest' Branding */}
        {showText && (
          <div className="flex flex-col justify-center select-none font-serif">
            <span
              className={`font-black tracking-normal transition-colors duration-300 ${dimensions.textTop} ${textColor}`}
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
            >
              Neuro
            </span>
            <span
              className={`font-black tracking-normal transition-colors duration-300 ${dimensions.textBot} ${textColor}`}
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
            >
              Quest
            </span>
          </div>
        )}
      </div>

      {/* Interactive Hover Quote Popup */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            id="logo-hover-quote-tooltip"
            initial={{ opacity: 0, y: tooltipPosition === "bottom" ? -6 : 6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: tooltipPosition === "bottom" ? -4 : 4, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 26 }}
            className={`absolute z-50 pointer-events-none whitespace-nowrap ${positionClasses}`}
          >
            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-sans font-medium flex items-center gap-1.5 shadow-xl backdrop-blur-md border ${
                isDark
                  ? "bg-[#18181B]/95 text-amber-300 border-amber-500/40 shadow-amber-950/40"
                  : "bg-slate-900/95 text-amber-200 border-slate-700 shadow-slate-900/30"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
              <Quote className="w-3 h-3 text-amber-400/80 shrink-0 rotate-180" />
              <span className="font-serif italic font-semibold tracking-wide text-[12px]">
                {quote}
              </span>
              <Quote className="w-3 h-3 text-amber-400/80 shrink-0" />
            </div>
            
            {/* Tooltip Arrow Indicator */}
            {tooltipPosition === "bottom" && (
              <div
                className={`w-2 h-2 rotate-45 mx-auto -mt-1 border-t border-l ${
                  isDark
                    ? "bg-[#18181B] border-amber-500/40"
                    : "bg-slate-900 border-slate-700"
                }`}
              />
            )}
            {tooltipPosition === "top" && (
              <div
                className={`w-2 h-2 rotate-45 mx-auto -mb-1 border-b border-r ${
                  isDark
                    ? "bg-[#18181B] border-amber-500/40"
                    : "bg-slate-900 border-slate-700"
                }`}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
