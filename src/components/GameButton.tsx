import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface GameButtonProps {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  variant?: "cyan" | "purple" | "pink" | "green";
  className?: string;
}

const variantStyles = {
  cyan: "bg-card border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-primary-foreground shadow-glow-cyan",
  purple: "bg-card border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-primary-foreground shadow-glow-purple", 
  pink: "bg-card border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-primary-foreground shadow-glow-pink",
  green: "bg-card border-neon-green text-neon-green hover:bg-neon-green hover:text-primary-foreground"
};

export const GameButton = ({ 
  active, 
  onClick, 
  disabled = false, 
  variant = "cyan",
  className 
}: GameButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-16 h-16 border-2 transition-all duration-300 ease-cyber relative overflow-hidden",
        "hover:scale-105 active:scale-95",
        variantStyles[variant],
        active && "animate-neon-pulse scale-110",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-grid animate-grid-glow" />
      <div className="relative z-10 w-4 h-4 rounded-full bg-current" />
    </Button>
  );
};