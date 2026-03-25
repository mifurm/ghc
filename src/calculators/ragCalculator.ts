import type { ConversationParams, RagParams, SolutionResult, TokenBreakdown } from '../types';
import { wordsToTokens } from '../types';

export function calculateRag(
  convParams: ConversationParams,
  ragParams: RagParams
): SolutionResult {
  const systemTokens = wordsToTokens(convParams.systemPromptWords);
  const userMsgTokens = wordsToTokens(convParams.avgUserMessageWords);
  const assistantMsgTokens = wordsToTokens(convParams.avgAssistantResponseWords);
  const ragChunkTokens = wordsToTokens(ragParams.avgChunkSizeWords) * ragParams.documentsRetrieved;

  const n = convParams.messagesPerConversation;
  let totalConversationInput = 0;
  let totalConversationOutput = 0;
  let totalEmbeddingTokens = 0;

  for (let i = 0; i < n; i++) {
    const historyTokens = i * (userMsgTokens + assistantMsgTokens);
    // RAG adds retrieved chunks to each request's context
    const turnInput = systemTokens + historyTokens + ragChunkTokens + userMsgTokens;
    const turnOutput = assistantMsgTokens;
    totalConversationInput += turnInput;
    totalConversationOutput += turnOutput;
    // Each user message is embedded for retrieval
    totalEmbeddingTokens += userMsgTokens;
  }

  const totalConversation = totalConversationInput + totalConversationOutput;
  const requestsPerDay = convParams.users * convParams.conversationsPerUserPerDay;
  const dailyInput = totalConversationInput * requestsPerDay;
  const dailyOutput = totalConversationOutput * requestsPerDay;
  const dailyEmbedding = totalEmbeddingTokens * requestsPerDay;

  const avgHistoryTokens = ((n - 1) * n / 2 / n) * (userMsgTokens + assistantMsgTokens);

  const breakdown: TokenBreakdown = {
    systemPrompt: systemTokens,
    conversationHistory: Math.round(avgHistoryTokens),
    userMessage: userMsgTokens,
    assistantResponse: assistantMsgTokens,
    ragChunks: ragChunkTokens,
    embeddingTokens: Math.round(dailyEmbedding / (requestsPerDay * n)),
    toolResults: 0,
    reasoningOverhead: 0,
  };

  return {
    label: 'RAG',
    description: 'Retrieval-Augmented Generation with vector DB context',
    perRequestInput: Math.round(totalConversationInput / n),
    perRequestOutput: assistantMsgTokens,
    perConversationTotal: totalConversation,
    dailyInputTokens: dailyInput,
    dailyOutputTokens: dailyOutput,
    dailyTotalTokens: dailyInput + dailyOutput + dailyEmbedding,
    monthlyTotalTokens: (dailyInput + dailyOutput + dailyEmbedding) * 30,
    breakdown,
  };
}
