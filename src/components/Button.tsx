import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-2 py-1 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  size = "md",
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`
      rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer
      ${sizeClasses[size]}
      ${className}
      ${disabled ? "cursor-not-allowed bg-blue-500" : ""}
      flex justify-center items-center
    `}
  >
    {children}
  </button>
);

export default Button;