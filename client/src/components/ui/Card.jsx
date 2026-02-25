export default function Card({ className = '', glow = false, children, ...props }) {
  return (
    <div
      className={`glass rounded-2xl shadow-inner-glow ${glow ? 'gradient-border shadow-gold' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
