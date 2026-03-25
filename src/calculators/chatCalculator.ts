import type { ConversationParams, SolutionResult, TokenBreakdown } from '../types';
import { wordsToTokens } from '../types';

export function calculateChat(params: ConversationParams): SolutionResult {
  const systemTokens = wordsToTokens(params.systemPromptWords);
  const userMsgTokens = wordsToTokens(params.avgUserMessageWords);
  const assistantMsgTokens = wordsToTokens(params.avgAssistantResponseWords);

  const n = params.messagesPerConversation;
  let totalConversationInput = 0;
  let totalConversationOutput = 0;

  // Each turn i (1-indexed): input = system + all previous turns + current user message
  // History grows: turn i has (i-1) previous exchanges in context
  for (let i = 0; i < n; i++) {
    const historyTokens = i * (userMsgTokens + assistantMsgTokens);
    const turnInput = systemTokens + historyTokens + userMsgTokens;
    const turnOutput = assistantMsgTokens;
    totalConversationInput += turnInput;
    totalConversationOutput += turnOutput;
  }

  const totalConversation = totalConversationInput + totalConversationOutput;
  const requestsPerDay = params.users * params.conversationsPerUserPerDay;
  const dailyInput = totalConversationInput * requestsPerDay;
  const dailyOutput = totalConversationOutput * requestsPerDay;

  const avgHistoryTokens = ((n - 1) * n / 2 / n) * (userMsgTokens + assistantMsgTokens);

  const breakdown: TokenBreakdown = {
    systemPrompt: systemTokens,
    conversationHistory: Math.round(avgHistoryTokens),
    userMessage: userMsgTokens,
    assistantResponse: assistantMsgTokens,
    ragChunks: 0,
    embeddingTokens: 0,
    toolResults: 0,
    reasoningOverhead: 0,
  };

  return {
    label: 'Simple Chat',
    description: 'Direct LLM conversation with growing context window',
    perRequestInput: Math.round(totalConversationInput / n),
    perRequestOutput: assistantMsgTokens,
    perConversationTotal: totalConversation,
    dailyInputTokens: dailyInput,
    dailyOutputTokens: dailyOutput,
    dailyTotalTokens: dailyInput + dailyOutput,
    monthlyTotalTokens: (dailyInput + dailyOutput) * 30,
    breakdown,
  };
}
