import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useImportStore } from "../store/import.store";

const optionsSchema = z.object({
  mode: z.enum(["append", "replace-period", "update-existing"]),
  duplicateStrategy: z.enum(["skip", "update", "create"]),
  periodStart: z.string(),
  periodEnd: z.string(),
}).refine((values) => values.mode !== "replace-period" || (values.periodStart && values.periodEnd && values.periodStart <= values.periodEnd), {
  path: ["periodEnd"], message: "Choose a valid replacement period",
});

type OptionsForm = z.infer<typeof optionsSchema>;

export function ImportOptions() {
  const store = useImportStore();
  const { register, watch, formState: { errors } } = useForm<OptionsForm>({
    resolver: zodResolver(optionsSchema),
    defaultValues: { mode: store.mode, duplicateStrategy: store.duplicateStrategy, periodStart: store.periodStart, periodEnd: store.periodEnd },
  });
  const values = watch();
  useEffect(() => {
    store.setMode(values.mode);
    store.setDuplicateStrategy(values.duplicateStrategy);
    store.setPeriod(values.periodStart, values.periodEnd);
  }, [values.mode, values.duplicateStrategy, values.periodStart, values.periodEnd]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="space-y-1.5 text-sm font-medium text-slate-700">Import mode
        <select {...register("mode")} className="field"><option value="append">Append new records</option><option value="update-existing">Update existing matches</option><option value="replace-period">Replace selected period</option></select>
      </label>
      <label className="space-y-1.5 text-sm font-medium text-slate-700">Database duplicates
        <select {...register("duplicateStrategy")} className="field"><option value="skip">Skip duplicates</option><option value="update">Update matching records</option><option value="create">Create a new copy</option></select>
      </label>
      {values.mode === "replace-period" && <>
        <label className="space-y-1.5 text-sm font-medium text-slate-700">Period start<input type="date" {...register("periodStart")} className="field" /></label>
        <label className="space-y-1.5 text-sm font-medium text-slate-700">Period end<input type="date" {...register("periodEnd")} className="field" />{errors.periodEnd && <span className="text-xs text-red-600">{errors.periodEnd.message}</span>}</label>
      </>}
    </div>
  );
}
