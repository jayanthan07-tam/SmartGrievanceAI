import React from 'react';
import { cn } from '../../lib/utils';

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#0037b0] hover:bg-[#001f6b] text-white focus:ring-[#0037b0] shadow-sm hover:shadow-md',
    secondary: 'bg-[#006a61] hover:bg-[#004d46] text-white focus:ring-[#006a61] shadow-sm',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-600 shadow-sm',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-600 shadow-sm',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-400',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-gray-400 shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, hint, icon, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-[#0037b0]/20 focus:border-[#0037b0] transition-all',
            'disabled:bg-gray-50 disabled:cursor-not-allowed',
            error ? 'border-red-400 focus:ring-red-100 focus:border-red-400' : 'border-gray-300 hover:border-gray-400',
            icon ? 'pl-10' : '',
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600 flex items-center gap-1">⚠ {error}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-[#0037b0]/20 focus:border-[#0037b0] transition-all resize-none',
          error ? 'border-red-400 focus:ring-red-100 focus:border-red-400' : 'border-gray-300 hover:border-gray-400',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600 flex items-center gap-1">⚠ {error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, hint, options, placeholder, className, id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          'w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-900',
          'focus:outline-none focus:ring-2 focus:ring-[#0037b0]/20 focus:border-[#0037b0] transition-all cursor-pointer',
          error ? 'border-red-400' : 'border-gray-300 hover:border-gray-400',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600 flex items-center gap-1">⚠ {error}</p>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({ children, className, padding = 'md', hover = false }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };
  return (
    <div className={cn(
      'bg-white rounded-xl border border-gray-200 shadow-sm',
      paddings[padding],
      hover && 'card-hover cursor-pointer',
      className
    )}>
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-blue-100 text-blue-700',
    secondary: 'bg-teal-100 text-teal-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-sky-100 text-sky-700',
  };
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}

// ─── Alert ────────────────────────────────────────────────────────────────────

interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export function Alert({ type, title, children, className, onClose }: AlertProps) {
  const configs = {
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'ℹ️', text: 'text-blue-800' },
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '✅', text: 'text-emerald-800' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '⚠️', text: 'text-amber-800' },
    error: { bg: 'bg-red-50', border: 'border-red-200', icon: '🚨', text: 'text-red-800' },
  };
  const config = configs[type];
  return (
    <div className={cn('rounded-lg border p-4 flex gap-3', config.bg, config.border, className)}>
      <span className="shrink-0 text-lg">{config.icon}</span>
      <div className="flex-1 min-w-0">
        {title && <p className={cn('font-semibold text-sm mb-1', config.text)}>{title}</p>}
        <div className={cn('text-sm', config.text)}>{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className={cn('shrink-0 text-lg hover:opacity-70', config.text)}>✕</button>
      )}
    </div>
  );
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────

export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={cn(
      'rounded-full border-2 border-[#0037b0]/20 border-t-[#0037b0] animate-spin',
      sizes[size],
      className
    )} />
  );
}

// ─── Loading Page ─────────────────────────────────────────────────────────────

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8ff]">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-gray-500 text-sm font-medium">Loading SmartGrievance AI...</p>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'teal' | 'red' | 'amber' | 'purple' | 'emerald';
  trend?: { value: string; positive: boolean };
}) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', value: 'text-blue-700' },
    teal: { bg: 'bg-teal-50', icon: 'text-teal-600', value: 'text-teal-700' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', value: 'text-red-700' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', value: 'text-amber-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', value: 'text-purple-700' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', value: 'text-emerald-700' },
  };
  const c = colorMap[color];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
          <p className={cn('text-3xl font-bold mt-1', c.value)}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className={cn('text-xs font-medium mt-1', trend.positive ? 'text-emerald-600' : 'text-red-600')}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn('p-3 rounded-xl', c.bg)}>
            <span className={c.icon}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn(
        'relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in',
        sizes[size]
      )}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Priority Badge ───────────────────────────────────────────────────────────

import { getPriorityConfig, getStatusConfig } from '../../lib/utils';
import type { Priority, ComplaintStatus } from '../../types';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = getPriorityConfig(priority);
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      config.badge
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const config = getStatusConfig(status);
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      config.badge
    )}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}

// ─── Demo Mode Banner ─────────────────────────────────────────────────────────

export function DemoBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <p className="text-xs text-amber-800 font-medium flex items-center gap-2">
          <span>⚗️</span>
          <span><strong>Demo Mode:</strong> Using simulated AI classification and fictional data. No real credentials required.</span>
        </p>
        <span className="text-xs font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
          SANDBOX v2.4.9
        </span>
      </div>
    </div>
  );
}
