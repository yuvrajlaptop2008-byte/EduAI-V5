import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  hoverEffect = false,
}) => {
  return (
    <div
      className={`glass rounded-2xl p-6 transition-all duration-200 ${
        hoverEffect ? "glass-hover" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};
