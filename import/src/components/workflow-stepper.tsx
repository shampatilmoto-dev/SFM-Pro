import { Check } from "lucide-react";
import { cn } from "../lib/utils";

const steps = ["Upload", "Validate", "Review", "Import"];

export function WorkflowStepper({ active }: { active: number }) {
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Import progress">
      {steps.map((step, index) => {
        const complete = index < active;
        const current = index === active;
        return (
          <li key={step} className="relative flex flex-col items-center gap-2 text-center">
            {index > 0 && <span className={cn("absolute right-1/2 top-4 -z-0 h-px w-full", complete ? "bg-blue-500" : "bg-slate-200")} />}
            <span className={cn("relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold", complete && "border-blue-600 bg-blue-600 text-white", current && "border-blue-600 bg-blue-50 text-blue-700", !complete && !current && "border-slate-200 bg-white text-slate-400")}>
              {complete ? <Check size={15} /> : index + 1}
            </span>
            <span className={cn("text-xs font-medium", current ? "text-blue-700" : "text-slate-500")}>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
