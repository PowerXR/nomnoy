import * as Icons from "lucide-react";

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function LucideIcon({ name, className = "", size = 20 }: LucideIconProps) {
  // Resolve icon dynamically from all lucide-react exports
  const IconComponent = (Icons as any)[name];
  
  if (!IconComponent) {
    // Return a default icon if not found
    const Fallback = Icons.HelpCircle;
    return <Fallback className={className} size={size} />;
  }
  
  return <IconComponent className={className} size={size} />;
}
