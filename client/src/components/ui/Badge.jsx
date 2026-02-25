export default function Badge({ color, children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: color ? `${color}33` : undefined, color: color || undefined }}
    >
      {children}
    </span>
  );
}
