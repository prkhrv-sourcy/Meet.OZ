import { forwardRef } from 'react';

const variants = {
  primary: 'bg-gold-gradient text-surface-dark font-semibold shadow-gold hover:shadow-gold-lg hover:scale-[1.02] active:scale-[0.98]',
  secondary: 'glass glass-hover text-white',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30 hover:border-red-500/30 active:scale-[0.98]',
  ghost: 'text-white/60 hover:text-white hover:bg-white/[0.06]',
};

const sizes = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
  icon: 'p-3',
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className = '', children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 ease-out disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
