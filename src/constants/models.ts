import type { ModelPricing, EmbeddingModelPricing, AzurePTUModel } from '../types';

export const LLM_MODELS: ModelPricing[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    inputPricePer1KTokens: 0.0025,
    outputPricePer1KTokens: 0.01,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    inputPricePer1KTokens: 0.00015,
    outputPricePer1KTokens: 0.0006,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    inputPricePer1KTokens: 0.0005,
    outputPricePer1KTokens: 0.0015,
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    inputPricePer1KTokens: 0.003,
    outputPricePer1KTokens: 0.015,
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    inputPricePer1KTokens: 0.00025,
    outputPricePer1KTokens: 0.00125,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    inputPricePer1KTokens: 0.00125,
    outputPricePer1KTokens: 0.005,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    inputPricePer1KTokens: 0.000075,
    outputPricePer1KTokens: 0.0003,
  },
];

export const EMBEDDING_MODELS: EmbeddingModelPricing[] = [
  {
    id: 'text-embedding-3-small',
    name: 'text-embedding-3-small',
    pricePer1KTokens: 0.00002,
  },
  {
    id: 'text-embedding-3-large',
    name: 'text-embedding-3-large',
    pricePer1KTokens: 0.00013,
  },
];

export const DEFAULT_SELECTED_MODELS = ['gpt-4o', 'claude-3.5-sonnet', 'gemini-1.5-pro'];

export const AZURE_PTU_MODELS: AzurePTUModel[] = [
  {
    id: 'azure-gpt-4o-ptu',
    name: 'GPT-4o (Azure PTU)',
    tpmPerPTU: 2500,
    hourlyRate: 2.0,
    monthlyCommitHourlyRate: 1.3,
    payPerTokenModelId: 'gpt-4o',
  },
  {
    id: 'azure-gpt-4o-mini-ptu',
    name: 'GPT-4o Mini (Azure PTU)',
    tpmPerPTU: 37000,
    hourlyRate: 0.25,
    monthlyCommitHourlyRate: 0.16,
    payPerTokenModelId: 'gpt-4o-mini',
  },
];
