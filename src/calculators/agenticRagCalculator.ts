import type {
  ConversationParams,
  RagParams,
  AgenticRagParams,
  SolutionResult,
  TokenBreakdown,
} from '../types';
import { wordsToTokens } from '../types';

export function calculateAgenticRag(
  convParams: ConversationParams,
  ragParams: RagParams,
  agenticParams: AgenticRagParams
): SolutionResult {
  const systemTokens = wordsToTokens(convParams.systemPromptWords);
  const userMsgTokens = wordsToTokens(convParams.avgUserMessageWords);
  const assistantMsgTokens = wordsToTokens(convParams.avgAssistantResponseWords);
  const ragChunkTokens = wordsToTokens(ragParams.avgChunkSizeWords) * ragParams.documentsRetrieved;
  const toolResultTokens = wordsToTokens(agenticParams.toolResultSizeWords);
  const reasoningMultiplier = 1 + agenticParams.reasoningOverheadPercent / 100;

  const n = convParams.messagesPerConversation;
  const steps = agenticParams.avgAgentSteps;
  const toolCallsPerStep = agenticParams.avgToolCallsPerStep;

  let totalConversationInput = 0;
  let totalConversationOutput = 0;
  let totalEmbeddingTokens = 0;

  for (let i = 0; i < n; i++) {
    const historyTokens = i * (userMsgTokens + assistantMsgTokens);

    // Each user message triggers a multi-step agent loop
    let queryInput = 0;
    let queryOutput = 0;

    for (let step = 0; step < steps; step++) {
      // Accumulated context from previous steps in this agent loop
      const prevStepContext = step * (toolResultTokens * toolCallsPerStep + assistantMsgTokens);

      // First step includes RAG retrieval
      const stepRagTokens = step === 0 ? ragChunkTokens : 0;

      const stepInput = Math.ceil(
        (systemTokens + historyTokens + userMsgTokens + stepRagTokens + prevStepContext) *
          reasoningMultiplier
      );

      // Each step produces a response (intermediate action or final answer)
      const stepOutput = Math.ceil(
        (step === steps - 1 ? assistantMsgTokens : assistantMsgTokens * 0.5) * reasoningMultiplier
      );

      queryInput += stepInput;
      queryOutput += stepOutput;
    }

    totalConversationInput += queryInput;
    totalConversationOutput += queryOutput;
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
    embeddingTokens: userMsgTokens,
    toolResults: Math.round(toolResultTokens * toolCallsPerStep * steps),
    reasoningOverhead: Math.round((reasoningMultiplier - 1) * 100),
  };

  return {
    label: 'Agentic RAG',
    description: 'Multi-step agent with tool calls, RAG retrieval, and reasoning',
    perRequestInput: Math.round(totalConversationInput / n),
    perRequestOutput: Math.round(totalConversationOutput / n),
    perConversationTotal: totalConversation,
    dailyInputTokens: dailyInput,
    dailyOutputTokens: dailyOutput,
    dailyTotalTokens: dailyInput + dailyOutput + dailyEmbedding,
    monthlyTotalTokens: (dailyInput + dailyOutput + dailyEmbedding) * 30,
    breakdown,
  };
}
