import type { ComponentProps } from 'react'
import { Link } from 'react-router'
import { cn } from '@/shared/lib/cn'
import { Icon, type IconName } from './Icon'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'transparent' | 'outline'
type Size = 'md' | 'sm'

type StyleProps = {
  variant?: Variant
  size?: Size
  icon?: IconName
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-red text-primary',
  secondary: 'bg-primary text-page',
  transparent: 'bg-tint-white text-primary backdrop-blur-[22px] hover:bg-secondary',
  outline: 'border border-secondary text-primary hover:bg-tint-white',
}

const sizeClasses: Record<Size, string> = {
  md: 'px-5.5 py-3.25 text-button',
  sm: 'px-3 py-1.5 text-label-s',
}

function buttonClasses({ variant = 'primary', size = 'md' }: StyleProps, className?: string) {
  return cn(
    'inline-flex cursor-pointer items-center justify-center gap-1 rounded-full whitespace-nowrap transition-colors',
    'disabled:cursor-not-allowed disabled:bg-disabled disabled:text-secondary',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )
}

type ButtonProps = ComponentProps<'button'> & StyleProps & { loading?: boolean }

export function Button({
  variant,
  size,
  icon,
  loading = false,
  disabled,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size }, className)}
      {...props}
    >
      {loading ? <Spinner /> : icon && <Icon name={icon} />}
      {children}
    </button>
  )
}

type ButtonLinkProps = ComponentProps<typeof Link> & StyleProps

export function ButtonLink({
  variant,
  size,
  icon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size }, className)} {...props}>
      {icon && <Icon name={icon} />}
      {children}
    </Link>
  )
}
