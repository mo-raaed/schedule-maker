import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary-solid text-white font-semibold hover:brightness-110 shadow-card",
  secondary:
    "bg-transparent text-primary border border-border hover:bg-surface-2",
  ghost:
    "text-foreground hover:bg-surface-2",
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
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70
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
