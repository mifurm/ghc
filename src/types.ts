export interface ConversationParams {
  users: number;
  conversationsPerUserPerDay: number;
  messagesPerConversation: number;
  avgUserMessageWords: number;
  avgAssistantResponseWords: number;
  systemPromptWords: number;
}

export interface RagParams {
  documentsRetrieved: number;
  avgChunkSizeWords: number;
  embeddingModel: string;
}

export interface AgenticRagParams {
  avgAgentSteps: number;
  avgToolCallsPerStep: number;
  toolResultSizeWords: number;
  reasoningOverheadPercent: number;
}

export interface CalculatorInputs {
  conversation: ConversationParams;
  rag: RagParams;
  agenticRag: AgenticRagParams;
  selectedModels: string[];
  ptu: PTUParams;
}

export interface TokenBreakdown {
  systemPrompt: number;
  conversationHistory: number;
  userMessage: number;
  assistantResponse: number;
  ragChunks: number;
  embeddingTokens: number;
  toolResults: number;
  reasoningOverhead: number;
}

export interface SolutionResult {
  label: string;
  description: string;
  perRequestInput: number;
  perRequestOutput: number;
  perConversationTotal: number;
  dailyInputTokens: number;
  dailyOutputTokens: number;
  dailyTotalTokens: number;
  monthlyTotalTokens: number;
  breakdown: TokenBreakdown;
}

export interface ModelPricing {
  id: string;
  name: string;
  provider: string;
  inputPricePer1KTokens: number;
  outputPricePer1KTokens: number;
}

export interface EmbeddingModelPricing {
  id: string;
  name: string;
  pricePer1KTokens: number;
}

export interface CostEstimate {
  modelId: string;
  modelName: string;
  dailyInputCost: number;
  dailyOutputCost: number;
  dailyTotalCost: number;
  monthlyCost: number;
}

export interface SolutionWithCosts {
  result: SolutionResult;
  costs: CostEstimate[];
  ptuEstimates: PTUEstimate[];
}

export interface AzurePTUModel {
  id: string;
  name: string;
  tpmPerPTU: number;
  hourlyRate: number;
  monthlyCommitHourlyRate: number;
  payPerTokenModelId: string;
}

export interface PTUModelConfig {
  id: string;
  name: string;
  tpmPerPTU: number;
  hourlyRate: number;
  monthlyCommitHourlyRate: number;
  payPerTokenModelId: string;
}

export interface PTUParams {
  activeHoursPerDay: number;
  peakUtilizationPercent: number;
  models: PTUModelConfig[];
}

export interface PTUEstimate {
  modelId: string;
  modelName: string;
  requiredTPM: number;
  requiredPTUs: number;
  monthlyPTUCostHourly: number;
  monthlyPTUCostCommitted: number;
  monthlyPayPerTokenCost: number;
  breakevenUtilization: number;
  recommendation: 'ptu' | 'paygo';
  savingsPerMonth: number;
}

export const WORDS_TO_TOKENS_RATIO = 1.33;

export function wordsToTokens(words: number): number {
  return Math.ceil(words * WORDS_TO_TOKENS_RATIO);
}
