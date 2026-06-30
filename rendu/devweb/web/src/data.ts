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

export const exampleQuestions: Example[] = [
  { tag: 'LIQUIDITÉ', text: "Analyse les ratios de liquidité d'une PME" },
  { tag: 'VALORISATION', text: 'Explique le coût moyen pondéré du capital' },
  { tag: 'TRÉSORERIE', text: 'Comment construire un budget de trésorerie sur 12 mois ?' },
  { tag: 'RENTABILITÉ', text: 'Quels indicateurs suivre pour évaluer la rentabilité ?' },
]

function defaultAnswer() {
  return `Une marge d'exploitation qui recule malgré une hausse du chiffre d'affaires indique que les coûts progressent plus vite que les revenus.

• Structure de coûts — hausse des charges variables ou fixes.
• Mix produit — montée en volume sur des références à faible marge.
• Effet prix — remises commerciales ou pression concurrentielle.

Recommandation : isoler la marge par segment sur les 4 derniers trimestres.`
}

export function initialConversations(): Conversation[] {
  return [
    {
      id: 'c1',
      title: 'Analyse de marge T3',
      messages: [
        {
          role: 'user',
          content: "Comment interpréter une marge d'exploitation en baisse malgré une hausse du chiffre d'affaires ?",
        },
        {
          role: 'assistant',
          content: defaultAnswer(),
          timeSec: 1.4,
          tokPerSec: 58,
        },
      ],
    },
    { id: 'c2', title: "Ratio d'endettement optimal", messages: [] },
    { id: 'c3', title: 'Prévision de trésorerie 12 mois', messages: [] },
    { id: 'c4', title: 'Diversification de portefeuille', messages: [] },
  ]
}
