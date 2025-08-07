'use client'

import Link from 'next/link'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
  variant?: 'primary' | 'action'
  children: React.ReactNode
  ariaLabel?: string
  loading?: boolean
}

const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ 
    href, 
    variant = 'action', 
    children, 
    ariaLabel, 
    loading = false, 
    className = '', 
    ...props 
  }, ref) => {
    const baseClasses = variant === 'action' ? 'btn-action' : 'btn-primary'
    const combinedClasses = `${baseClasses} ${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`

    const buttonContent = (
      <>
        {loading && (
          <svg 
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </>
    )

    if (href) {
      return (
        <Link 
          href={href} 
          className={combinedClasses}
          aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
          role="button"
          tabIndex={0}
        >
          {buttonContent}
        </Link>
      )
    }

    return (
      <button
        ref={ref}
        className={combinedClasses}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        disabled={loading}
        {...props}
      >
        {buttonContent}
      </button>
    )
  }
)

ActionButton.displayName = 'ActionButton'

export default ActionButton