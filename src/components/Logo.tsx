import { Link } from "react-router-dom";
import logoMark from "@/assets/vibetix-mark.png";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`flex items-center gap-2 font-bold text-xl ${className}`} aria-label="VibeTix home">
    <img src={logoMark} alt="VibeTix" className="h-8 w-auto" width={56} height={32} />
    <span className="tracking-tight">VibeTix</span>
  </Link>
);
