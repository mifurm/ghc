import type { CalculatorInputs } from '../types';
import { DEFAULT_SELECTED_MODELS } from './models';

export const DEFAULT_INPUTS: CalculatorInputs = {
  conversation: {
    users: 100,
    conversationsPerUserPerDay: 3,
    messagesPerConversation: 10,
    avgUserMessageWords: 30,
    avgAssistantResponseWords: 150,
    systemPromptWords: 200,
  },
  rag: {
    documentsRetrieved: 5,
    avgChunkSizeWords: 300,
    embeddingModel: 'text-embedding-3-small',
  },
  agenticRag: {
    avgAgentSteps: 4,
    avgToolCallsPerStep: 1.5,
    toolResultSizeWords: 100,
    reasoningOverheadPercent: 20,
  },
  selectedModels: DEFAULT_SELECTED_MODELS,
  ptu: {
    activeHoursPerDay: 12,
    peakUtilizationPercent: 80,
    models: [
      {
        id: 'azure-gpt-4o-ptu',
        name: 'GPT-4o',
        tpmPerPTU: 2500,
        hourlyRate: 2.0,
        monthlyCommitHourlyRate: 1.3,
        payPerTokenModelId: 'gpt-4o',
      },
      {
        id: 'azure-gpt-4o-mini-ptu',
        name: 'GPT-4o Mini',
        tpmPerPTU: 37000,
        hourlyRate: 0.25,
        monthlyCommitHourlyRate: 0.16,
        payPerTokenModelId: 'gpt-4o-mini',
      },
    ],
  },
};
