"use client";

import { useFormStatus } from "react-dom";

/**
 * A submit button that (optionally) confirms before letting its form's action
 * through, and shows the form is saving so nobody taps it twice.
 */
export function ConfirmSubmitButton({
  confirmMessage,
  className,
  name,
  value,
  pendingLabel,
  disabled,
  children,
  ...rest
}: {
  confirmMessage?: string;
  className?: string;
  name?: string;
  value?: string;
  pendingLabel?: React.ReactNode;
  disabled?: boolean;
  children: React.ReactNode;
} & Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "aria-pressed" | "title">) {
  const { pending, data } = useFormStatus();
  // With several submit buttons in one form, only the one pressed says "saving".
  const mine = pending && (name === undefined || data?.get(name) === value);
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={disabled || pending}
      aria-busy={mine || undefined}
      className={`${className ?? ""} ${pending ? "cursor-wait" : ""} ${mine ? "opacity-70" : ""}`}
      onClick={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) e.preventDefault();
      }}
      {...rest}
    >
      {mine && pendingLabel ? pendingLabel : children}
    </button>
  );
}
