import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "gradient-primary text-white hover:brightness-110 shadow-soft dark:hover:shadow-[0_0_15px_rgba(129,174,255,0.3)]",
  secondary:
    "bg-transparent text-[var(--color-primary)] border-[1.5px] border-[var(--color-outline-variant)]/15 hover:bg-[var(--color-surface-container-high)]",
  ghost:
    "text-foreground hover:bg-[var(--color-surface-container-high)]",
  destructive:
    "bg-destructive text-destructive-foreground hover:brightness-110",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-4 text-sm rounded-full",
  md: "h-10 px-5 text-sm rounded-full",
  lg: "h-12 px-7 text-base rounded-full",
  icon: "h-10 w-10 rounded-full flex items-center justify-center",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-medium transition-all duration-200 ease-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
          disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.98]
          ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
