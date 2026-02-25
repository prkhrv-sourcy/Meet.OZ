import { forwardRef } from 'react';

const Input = forwardRef(function Input({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-white placeholder-white/30 outline-none focus:border-brand-gold/40 focus:bg-white/[0.06] focus:shadow-gold transition-all duration-200 ${className}`}
      {...props}
    />
  );
});

export default Input;
