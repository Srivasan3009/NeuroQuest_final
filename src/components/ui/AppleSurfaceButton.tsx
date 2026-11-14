import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";

export interface AppleSurfaceButtonProps extends HTMLMotionProps<"button"> {
  pressScale?: number;
  hoverScale?: number;
}

export const AppleSurfaceButton = React.forwardRef<
  HTMLButtonElement,
  AppleSurfaceButtonProps
>(
  (
    {
      className = "",
      pressScale = 0.975,
      hoverScale = 1.008,
      whileTap,
      whileHover,
      transition,
      children,
      ...props
    },
    ref
  ) => {
    const mergedClassName = className.includes("apple-surface")
      ? className
      : `apple-surface ${className}`.trim();

    return (
      <motion.button
        ref={ref}
        whileHover={whileHover ?? { scale: hoverScale }}
        whileTap={whileTap ?? { scale: pressScale }}
        transition={
          transition ?? {
            type: "spring",
            stiffness: 460,
            damping: 30,
            mass: 0.75,
          }
        }
        className={mergedClassName}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

AppleSurfaceButton.displayName = "AppleSurfaceButton";
