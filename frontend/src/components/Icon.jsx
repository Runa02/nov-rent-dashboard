export default function Icon({ icon: LucideIcon, size = 16, ...props }) {
  return <LucideIcon size={size} strokeWidth={2} {...props} />;
}
