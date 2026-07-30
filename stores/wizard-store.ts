import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ColumnMapping, RuleConfig } from "@/types/wizard"

type WizardFiles = {
  internal?: File
  counterparty?: File
}

type WizardState = {
  reportId?: string
  step: 1 | 2 | 3 | 4
  files: WizardFiles
  columnMapping?: ColumnMapping
  ruleConfig?: RuleConfig
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
  setIsRunning: (isRunning: boolean) => void
  reset: () => void
}

const initialState = {
  reportId: undefined,
  step: 1 as const,
  files: {},
  columnMapping: undefined,
  ruleConfig: undefined,
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
      }),
    },
  ),
)
