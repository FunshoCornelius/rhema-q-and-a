import React from 'react'

export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onClose?: () => void
  children: React.ReactNode
}

export const Dialog = ({
  open,
  onClose,
  children,
  className = '',
  ...props
}: DialogProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center m-0">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Dialog Panel */}
      <div
        className={`relative z-10 p-6 rounded-xl shadow-xl border border-(--border-gray) bg-(--bg-white) w-[90vw] max-w-md animate-in fade-in-90 zoom-in-95 duration-200 focus:outline-none ${className}`}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

Dialog.displayName = 'Dialog'

export const DialogHeader = ({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`flex flex-col space-y-1.5 text-center sm:text-left mb-5 ${className}`}
    {...props}
  />
)

export const DialogTitle = ({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className={`text-lg font-semibold leading-none tracking-tight text-(--text-main) ${className}`}
    {...props}
  />
)

export const DialogDescription = ({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-(--text-muted) ${className}`} {...props} />
)

export const DialogFooter = ({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6 ${className}`}
    {...props}
  />
)
