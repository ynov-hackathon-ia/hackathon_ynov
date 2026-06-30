import type { Conversation, Example, ModelOption } from './types'

export const modelOptions = [
  {
    id: 'financial',
    name: 'Phi-3.5-Financial',
    tag: 'Production',
    accent: true,
    model: import.meta.env.VITE_MODEL_FINANCIAL ?? import.meta.env.VITE_MODEL_NAME ?? 'techcorp-financial',
  },
  {
    id: 'medical',
    name: 'Med-LoRA',
    tag: 'Expérimental',
    accent: false,
    model: import.meta.env.VITE_MODEL_MEDICAL ?? 'med-lora',
  },
] satisfies readonly ModelOption[]

export const exampleQuestions: Record<string, Example[]> = {
  financial: [
    { tag: 'LIQUIDITÉ', text: "Analyse les ratios de liquidité d'une PME" },
    { tag: 'VALORISATION', text: 'Explique le coût moyen pondéré du capital' },
    { tag: 'TRÉSORERIE', text: 'Comment construire un budget de trésorerie sur 12 mois ?' },
    { tag: 'RENTABILITÉ', text: 'Quels indicateurs suivre pour évaluer la rentabilité ?' },
  ],
  medical: [
    { tag: 'DIAGNOSTIC', text: "Quels sont les symptômes courants d'une pneumonie bactérienne ?" },
    { tag: 'TRAITEMENT', text: 'Quelles sont les premières lignes de traitement pour le diabète de type 2 ?' },
    { tag: 'PHARMACOLOGIE', text: "Explique le mécanisme d'action des inhibiteurs de la pompe à protons" },
    { tag: 'URGENCES', text: 'Comment reconnaître et gérer un AVC en phase aiguë ?' },
  ],
}

export const modelDescriptions: Record<string, string> = {
  financial: "Assistant d'analyse financière et business. Posez une question ou choisissez un exemple.",
  medical: 'Assistant médical expérimental basé sur Med-LoRA. À titre informatif uniquement.',
}

export function initialConversations(): Conversation[] {
  return [{ id: 'c1', title: 'Nouvelle conversation', messages: [] }]
}
