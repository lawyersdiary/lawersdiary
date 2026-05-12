import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 focus:ring-indigo-500 shadow-lg shadow-indigo-500/25',
    secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10',
    danger: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500',
    ghost: 'text-slate-400 hover:text-white hover:bg-white/5',
    outline: 'border border-white/20 text-white hover:bg-white/10',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
      ) : icon}
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
      <input
        className={cn(
          'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all',
          icon && 'pl-10',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
    </div>
    {error && <p className="text-sm text-red-400">{error}</p>}
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
    <textarea
      className={cn(
        'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none',
        error && 'border-red-500 focus:ring-red-500',
        className
      )}
      {...props}
    />
    {error && <p className="text-sm text-red-400">{error}</p>}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({ label, options, className, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
    <select
      className={cn(
        'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none',
        className
      )}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-slate-800">{opt.label}</option>
      ))}
    </select>
  </div>
);

interface CardProps extends HTMLMotionProps<'div'> {
  glass?: boolean;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ glass = true, hover = false, padding = 'md', className, children, ...props }) => {
  const paddings = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-8' };
  return (
    <motion.div
      className={cn(
        'rounded-2xl border border-white/10',
        glass && 'bg-white/5 backdrop-blur-xl',
        !glass && 'bg-slate-800/80',
        hover && 'hover:border-white/20 hover:bg-white/[0.07] cursor-pointer',
        paddings[padding],
        className
      )}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={cn('w-full bg-slate-900 border border-white/10 rounded-2xl shadow-2xl', sizes[size])}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </motion.div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-white/10 text-slate-300',
    success: 'bg-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/20 text-amber-400',
    danger: 'bg-red-500/20 text-red-400',
    info: 'bg-blue-500/20 text-blue-400',
  };
  return <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>{children}</span>;
};

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', online, className }) => {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' };
  const statusSizes = { sm: 'w-2.5 h-2.5', md: 'w-3 h-3', lg: 'w-3.5 h-3.5', xl: 'w-4 h-4' };
  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img src={src} alt={name} className={cn('rounded-full object-cover border-2 border-white/10', sizes[size])} />
      ) : (
        <div className={cn('rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold border-2 border-white/10', sizes[size])}>
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      {online !== undefined && (
        <span className={cn('absolute bottom-0 right-0 rounded-full border-2 border-slate-900', statusSizes[size], online ? 'bg-emerald-500' : 'bg-slate-500')} />
      )}
    </div>
  );
};

interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
  const icons = { success: CheckCircle, error: AlertCircle, info: Info, warning: AlertTriangle };
  const colors = { success: 'text-emerald-400', error: 'text-red-400', info: 'text-blue-400', warning: 'text-amber-400' };
  const Icon = icons[type];
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 50 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="flex items-center gap-3 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl"
    >
      <Icon className={cn('w-5 h-5 shrink-0', colors[type])} />
      <span className="text-sm text-white">{message}</span>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
    </motion.div>
  );
};

export const ProgressBar: React.FC<{ value: number; max: number; color?: string; className?: string }> = ({ value, max, color = 'bg-indigo-500', className }) => (
  <div className={cn('w-full bg-white/10 rounded-full h-2 overflow-hidden', className)}>
    <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
  </div>
);

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ size = 'md', className }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <svg className={cn('animate-spin text-indigo-500', sizes[size])} viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  );
};

export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {icon && <div className="mb-4 text-slate-500">{icon}</div>}
    <h3 className="text-lg font-semibold text-slate-400 mb-2">{title}</h3>
    {description && <p className="text-sm text-slate-500 max-w-md mb-4">{description}</p>}
    {action}
  </div>
);

export const Tabs: React.FC<{ tabs: Array<{ id: string; label: string; icon?: React.ReactNode }>; activeTab: string; onChange: (id: string) => void; className?: string }> = ({ tabs, activeTab, onChange, className }) => (
  <div className={cn('flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10', className)}>
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
          activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
        )}
      >
        {tab.icon}
        {tab.label}
      </button>
    ))}
  </div>
);
