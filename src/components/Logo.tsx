import { Link } from "react-router-dom";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`flex items-center gap-2 font-bold text-xl ${className}`}>
    <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-vibrant shadow-glow">
      <span className="text-primary-foreground text-sm">V</span>
    </span>
    <span>VibeTix</span>
  </Link>
);
