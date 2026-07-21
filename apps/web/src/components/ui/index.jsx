import { clsx }    from "clsx"
import { Loader2 } from "lucide-react"

export function Spinner({ size = 18, className }) {
  return (
    <Loader2
      size={size}
      className={clsx("animate-spin", className)}
      style={{ color: "currentColor" }}
    />
  )
}

export function Button({
  variant  = "primary",
  size     = "md",
  loading  = false,
  disabled = false,
  className,
  children,
  ...rest
}) {
  const variants = {
    primary: "btn-primary",
    dark:    "btn-dark",
    outline: "btn-outline",
    ghost:   "btn-ghost",
    danger:  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-medium transition-all bg-danger hover:opacity-90 text-white"
  }

  const sizes = {
    sm: "px-3 py-2 text-sm   rounded-lg  !gap-1.5",
    md: "px-4 py-2.5 text-sm   rounded-xl",
    lg: "px-5 py-3 text-base  rounded-xl",
    xl: "px-6 py-4 text-lg   rounded-2xl"
  }

  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        variants[variant],
        sizes[size],
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        className
      )}
      {...rest}
    >
      {loading && <Spinner size={15} />}
      {children}
    </button>
  )
}

export function Input({ label, error, helper, className, ...rest }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium" style={{ color: "var(--color-navy)" }}>
          {label}
        </label>
      )}
      <input
        className={clsx(
          "input-field",
          error && "error",
          className
        )}
        {...rest}
      />
      {error ? (
        <p className="text-xs" style={{ color: "var(--color-danger)" }}>{error}</p>
      ) : helper ? (
        <p className="text-xs text-slate-400">{helper}</p>
      ) : null}
    </div>
  )
}

export function Card({ className, children, ...rest }) {
  return (
    <div className={clsx("card", className)} {...rest}>
      {children}
    </div>
  )
}

export function Badge({ status = "pending", children }) {
  const classes = {
    verified: "badge-verified",
    pending:  "badge-pending",
    rejected: "badge-rejected"
  }
  return <span className={classes[status] ?? classes.pending}>{children}</span>
}

export function QualityDot({ ok }) {
  return (
    <div
      className="h-2 w-2 rounded-full transition-colors"
      style={{ background: ok ? "var(--color-success)" : "var(--color-border)" }}
    />
  )
}
