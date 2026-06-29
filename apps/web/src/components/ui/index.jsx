import { clsx } from "clsx"
import { Loader2 } from "lucide-react"

export function Spinner({ size = 20, className }) {
  return (
    <Loader2
      size={size}
      className={clsx("animate-spin text-teal", className)}
    />
  )
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className,
  children,
  ...rest
}) {
  const variants = {
    primary: "bg-teal hover:bg-teal-dark text-navy",
    dark:    "bg-navy hover:bg-navy-800 text-white",
    outline: "border border-border bg-white hover:bg-slate-50 text-navy",
    ghost:   "bg-transparent hover:bg-slate-100 text-navy",
    danger:  "bg-danger hover:opacity-90 text-white"
  }

  const sizes = {
    sm: "px-3 py-2 text-sm rounded-lg",
    md: "px-4 py-2.5 text-sm rounded-xl",
    lg: "px-5 py-3 text-base rounded-xl",
    xl: "px-6 py-4 text-lg rounded-2xl"
  }

  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  )
}

export function Input({ label, error, helper, className, ...rest }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-navy">
          {label}
        </label>
      )}

      <input
        className={clsx(
          "input-field",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          className
        )}
        {...rest}
      />

      {error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : helper ? (
        <p className="text-sm text-slate-500">{helper}</p>
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

  return (
    <span className={classes[status] ?? classes.pending}>
      {children}
    </span>
  )
}