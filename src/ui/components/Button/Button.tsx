import type { ButtonType, ButtonVariant } from "@/types";
import type { FunctionComponent } from "react";
import React from "react";

import $ from "./Button.module.css";

interface ButtonProps {
  onClick?: () => void;
  type?: ButtonType;
  variant?: ButtonVariant;
  loading?: boolean;
  children: React.ReactNode;
}

const Button: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  loading = false,
}) => {
  const buttonClasses = [
    $.button,
    variant === "primary" ? $.primary : $.secondary
  ].join(" ");

  return (
    <button
      className={buttonClasses}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
