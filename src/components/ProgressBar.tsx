import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  stage: number;
  totalStages: number;
  className?: string;
}

export const ProgressBar = ({ 
  progress, 
  stage, 
  totalStages, 
  className 
}: ProgressBarProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Stage</span>
        <span className="text-neon-cyan font-mono">
          {stage}/{totalStages}
        </span>
      </div>
      
      <div className="relative h-3 bg-card rounded-full border border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-grid animate-grid-glow opacity-30" />
        <div
          className="h-full bg-gradient-cyber-primary transition-all duration-500 ease-cyber relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  );
};