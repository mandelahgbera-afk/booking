import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "glass" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 active:scale-95";

  const variants = {
    primary:
      "gradient-primary text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:brightness-110",
    secondary:
      "bg-white text-slate-800 border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md",
    glass:
      "glass text-slate-800 hover:bg-white/80",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
