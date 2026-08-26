import React from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'glass' | 'subtle';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
  asExternal?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  href,
  asExternal,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizeClass = size === 'md' ? '' : `btn-${size}`;
  const baseClasses = `btn btn-${variant} ${sizeClass} ${isLoading ? 'btn-loading' : ''} ${className}`.trim().replace(/\s+/g, ' ');
  const isDisabled = disabled || isLoading;

  const content = (
    <>
      {isLoading ? (
        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: children ? '8px' : '0' }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeLinecap="round" />
        </svg>
      ) : leftIcon ? (
        <span className="btn-icon-left" style={{ display: 'inline-flex', marginRight: children ? '6px' : '0' }}>{leftIcon}</span>
      ) : null}
      
      {children && <span>{children}</span>}
      
      {!isLoading && rightIcon && (
        <span className="btn-icon-right" style={{ display: 'inline-flex', marginLeft: children ? '6px' : '0' }}>{rightIcon}</span>
      )}
    </>
  );

  if (href) {
    if (asExternal) {
      return (
        <a href={href} className={baseClasses} target="_blank" rel="noopener noreferrer" onClick={props.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={baseClasses} onClick={props.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}>
        {content}
      </Link>
    );
  }

  return (
    <button className={baseClasses} disabled={isDisabled} {...props}>
      {content}
    </button>
  );
}
