import { cn } from "@/lib/utils";

interface PipelineStage {
  name: string;
  count: number;
  color: string;
}

const pipelineStages: PipelineStage[] = [
  { name: "Applied", count: 156, color: "bg-muted-foreground" },
  { name: "Screening", count: 42, color: "bg-info" },
  { name: "Interview", count: 28, color: "bg-warning" },
  { name: "Assessment", count: 12, color: "bg-accent" },
  { name: "Offer", count: 5, color: "bg-success" },
  { name: "Hired", count: 3, color: "bg-primary" },
];

export function HiringPipeline() {
  const maxCount = Math.max(...pipelineStages.map((s) => s.count));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Hiring Pipeline</h3>
        <button className="text-sm text-accent hover:underline">View Details</button>
      </div>
      
      {/* Pipeline Visualization */}
      <div className="flex items-end gap-2 h-40">
        {pipelineStages.map((stage, index) => {
          const height = (stage.count / maxCount) * 100;
          return (
            <div
              key={stage.name}
              className="flex-1 flex flex-col items-center gap-2 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-sm font-medium text-foreground">{stage.count}</span>
              <div
                className={cn("w-full rounded-t-md transition-all duration-500", stage.color)}
                style={{ height: `${Math.max(height, 10)}%` }}
              />
              <span className="text-xs text-muted-foreground text-center">{stage.name}</span>
            </div>
          );
        })}
      </div>

      {/* Flow Indicators */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">246</p>
          <p className="text-xs text-muted-foreground">Total Active</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center">
          <p className="text-2xl font-bold text-success">23%</p>
          <p className="text-xs text-muted-foreground">Conversion Rate</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">18</p>
          <p className="text-xs text-muted-foreground">Avg. Days to Hire</p>
        </div>
      </div>
    </div>
  );
}
