import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ColumnMapping, RuleConfig } from "@/types/wizard"

type WizardFiles = {
  internal?: File
  counterparty?: File
}

type WizardState = {
  reportId?: string
  // Mapping and rules were merged into a single step 1 — 2 never appears,
  // kept only so a value persisted before that merge still deserializes.
  step: 1 | 2 | 3 | 4
  files: WizardFiles
  columnMapping?: ColumnMapping
  ruleConfig?: RuleConfig
  // The in-progress "Reconciliation Name" input from ColumnMappingBoard —
  // synced here so MatchingRulesSidebar's "Save Draft" (a separate
  // component) can include it in the same PATCH as the mapping/config.
  name?: string
  // Transient, not persisted — true only while the /run call is actually in
  // flight. Exists so Header's ReconciliationStepper (rendered outside the
  // wizard's own component tree, in the dashboard layout) can reflect the
  // real current stage without needing a URL param for it.
  isRunning: boolean
  setReportId: (id: string | undefined) => void
  setStep: (step: WizardState["step"]) => void
  setFiles: (files: WizardFiles) => void
  setColumnMapping: (mapping: ColumnMapping) => void
  setRuleConfig: (config: RuleConfig) => void
  setName: (name: string) => void
  setIsRunning: (isRunning: boolean) => void
  reset: () => void
}

const initialState = {
  reportId: undefined,
  step: 1 as const,
  files: {},
  columnMapping: undefined,
  ruleConfig: undefined,
  name: undefined,
  isRunning: false,
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      ...initialState,
      setReportId: (id) => set({ reportId: id }),
      setStep: (step) => set({ step }),
      setFiles: (files) => set({ files }),
      setColumnMapping: (columnMapping) => set({ columnMapping }),
      setRuleConfig: (ruleConfig) => set({ ruleConfig }),
      setName: (name) => set({ name }),
      setIsRunning: (isRunning) => set({ isRunning }),
      reset: () => set(initialState),
    }),
    {
      name: "recon-wizard-store",
      // Files can't survive localStorage (not serializable) — everything
      // else is safe to persist so an accidental reload doesn't lose a
      // hand-tuned mapping/rule config mid-edit.
      partialize: (state) => ({
        reportId: state.reportId,
        step: state.step,
        columnMapping: state.columnMapping,
        ruleConfig: state.ruleConfig,
        name: state.name,
      }),
    },
  ),
)
