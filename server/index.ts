import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { calculateChat } from '../src/calculators/chatCalculator.js';
import { calculateRag } from '../src/calculators/ragCalculator.js';
import { calculateAgenticRag } from '../src/calculators/agenticRagCalculator.js';
import { calculatePTU } from '../src/calculators/ptuCalculator.js';
import { LLM_MODELS } from '../src/constants/models.js';
import { DEFAULT_INPUTS } from '../src/constants/defaults.js';
import type {
  ConversationParams,
  RagParams,
  AgenticRagParams,
  PTUParams,
  SolutionResult,
  CostEstimate,
  PTUEstimate,
} from '../src/types.js';

function computeCosts(result: SolutionResult, modelIds: string[]): CostEstimate[] {
  return modelIds
    .map((modelId) => {
      const model = LLM_MODELS.find((m) => m.id === modelId);
      if (!model) return null;
      const dailyInputCost = (result.dailyInputTokens / 1000) * model.inputPricePer1KTokens;
      const dailyOutputCost = (result.dailyOutputTokens / 1000) * model.outputPricePer1KTokens;
      return {
        modelId: model.id,
        modelName: model.name,
        dailyInputCost: +dailyInputCost.toFixed(4),
        dailyOutputCost: +dailyOutputCost.toFixed(4),
        dailyTotalCost: +(dailyInputCost + dailyOutputCost).toFixed(4),
        monthlyCost: +((dailyInputCost + dailyOutputCost) * 30).toFixed(2),
      };
    })
    .filter((c): c is CostEstimate => c !== null);
}

const conversationSchema = {
  users: z.number().min(1).default(100).describe('Total number of users'),
  conversationsPerUserPerDay: z.number().min(1).default(3).describe('Conversations per user per day'),
  messagesPerConversation: z.number().min(1).default(10).describe('Messages (turns) per conversation'),
  avgUserMessageWords: z.number().min(1).default(30).describe('Average user message length in words'),
  avgAssistantResponseWords: z.number().min(1).default(150).describe('Average assistant response length in words'),
  systemPromptWords: z.number().min(0).default(200).describe('System prompt length in words'),
};

const ragSchema = {
  documentsRetrieved: z.number().min(1).default(5).describe('Number of document chunks retrieved per query'),
  avgChunkSizeWords: z.number().min(1).default(300).describe('Average size of each retrieved chunk in words'),
};

const agenticSchema = {
  avgAgentSteps: z.number().min(1).default(4).describe('Average LLM calls per agentic loop'),
  avgToolCallsPerStep: z.number().min(0).default(1.5).describe('Average tool invocations per step'),
  toolResultSizeWords: z.number().min(0).default(100).describe('Average tokens returned by each tool call'),
  reasoningOverheadPercent: z.number().min(0).default(20).describe('Extra token percentage for chain-of-thought'),
};

const modelsSchema = {
  models: z
    .array(z.string())
    .default(['gpt-4o', 'claude-3.5-sonnet', 'gemini-1.5-pro'])
    .describe(
      `LLM model IDs for cost estimation. Available: ${LLM_MODELS.map((m) => m.id).join(', ')}`
    ),
};

const ptuSchema = {
  activeHoursPerDay: z.number().min(1).max(24).default(12).describe('Hours per day with active usage'),
  peakUtilizationPercent: z.number().min(1).max(200).default(80).describe('Peak usage as % of uniform distribution'),
};

function safeNum(value: unknown, fallback: number): number {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) return value;
  return fallback;
}

function parseConv(input: Record<string, unknown>): ConversationParams {
  const d = DEFAULT_INPUTS.conversation;
  return {
    users: safeNum(input.users, d.users),
    conversationsPerUserPerDay: safeNum(input.conversationsPerUserPerDay, d.conversationsPerUserPerDay),
    messagesPerConversation: safeNum(input.messagesPerConversation, d.messagesPerConversation),
    avgUserMessageWords: safeNum(input.avgUserMessageWords, d.avgUserMessageWords),
    avgAssistantResponseWords: safeNum(input.avgAssistantResponseWords, d.avgAssistantResponseWords),
    systemPromptWords: safeNum(input.systemPromptWords, d.systemPromptWords),
  };
}

function parseRag(input: Record<string, unknown>): RagParams {
  const d = DEFAULT_INPUTS.rag;
  return {
    documentsRetrieved: safeNum(input.documentsRetrieved, d.documentsRetrieved),
    avgChunkSizeWords: safeNum(input.avgChunkSizeWords, d.avgChunkSizeWords),
    embeddingModel: (input.embeddingModel as string) ?? d.embeddingModel,
  };
}

function parseAgentic(input: Record<string, unknown>): AgenticRagParams {
  const d = DEFAULT_INPUTS.agenticRag;
  return {
    avgAgentSteps: safeNum(input.avgAgentSteps, d.avgAgentSteps),
    avgToolCallsPerStep: safeNum(input.avgToolCallsPerStep, d.avgToolCallsPerStep),
    toolResultSizeWords: safeNum(input.toolResultSizeWords, d.toolResultSizeWords),
    reasoningOverheadPercent: safeNum(input.reasoningOverheadPercent, d.reasoningOverheadPercent),
  };
}

function parsePtu(input: Record<string, unknown>): PTUParams {
  const d = DEFAULT_INPUTS.ptu;
  return {
    activeHoursPerDay: safeNum(input.activeHoursPerDay, d.activeHoursPerDay),
    peakUtilizationPercent: safeNum(input.peakUtilizationPercent, d.peakUtilizationPercent),
    models: d.models,
  };
}

function formatResult(result: SolutionResult, costs: CostEstimate[]): string {
  const lines = [
    `## ${result.label}`,
    result.description,
    '',
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Daily Input Tokens | ${result.dailyInputTokens.toLocaleString()} |`,
    `| Daily Output Tokens | ${result.dailyOutputTokens.toLocaleString()} |`,
    `| Daily Total Tokens | ${result.dailyTotalTokens.toLocaleString()} |`,
    `| Monthly Total Tokens | ${result.monthlyTotalTokens.toLocaleString()} |`,
    `| Per Conversation | ${result.perConversationTotal.toLocaleString()} |`,
    `| Avg Request Input | ${result.perRequestInput.toLocaleString()} |`,
    `| Avg Request Output | ${result.perRequestOutput.toLocaleString()} |`,
  ];

  if (costs.length > 0) {
    lines.push('', '### Cost Estimates', '');
    lines.push('| Model | Daily Cost | Monthly Cost |');
    lines.push('|-------|-----------|-------------|');
    for (const c of costs) {
      lines.push(`| ${c.modelName} | $${c.dailyTotalCost.toFixed(2)} | $${c.monthlyCost.toFixed(2)} |`);
    }
  }

  return lines.join('\n');
}

const server = new McpServer({
  name: 'llm-token-calculator',
  version: '1.0.0',
});

server.tool(
  'calculate_chat_tokens',
  'Calculate token usage and costs for a simple LLM chat application (no RAG, no agents)',
  { ...conversationSchema, ...modelsSchema },
  async (input) => {
    try {
      const conv = parseConv(input);
      const models = (input.models as string[]) ?? DEFAULT_INPUTS.selectedModels;
      const result = calculateChat(conv);
      const costs = computeCosts(result, models);
      return { content: [{ type: 'text', text: formatResult(result, costs) }] };
    } catch (error) {
      return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
    }
  }
);

server.tool(
  'calculate_rag_tokens',
  'Calculate token usage and costs for a RAG (Retrieval-Augmented Generation) application',
  { ...conversationSchema, ...ragSchema, ...modelsSchema },
  async (input) => {
    try {
      const conv = parseConv(input);
      const rag = parseRag(input);
      const models = (input.models as string[]) ?? DEFAULT_INPUTS.selectedModels;
      const result = calculateRag(conv, rag);
      const costs = computeCosts(result, models);
      return { content: [{ type: 'text', text: formatResult(result, costs) }] };
    } catch (error) {
      return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
    }
  }
);

server.tool(
  'calculate_agentic_rag_tokens',
  'Calculate token usage and costs for an Agentic RAG application (multi-step agent with tool calls)',
  { ...conversationSchema, ...ragSchema, ...agenticSchema, ...modelsSchema },
  async (input) => {
    try {
      const conv = parseConv(input);
      const rag = parseRag(input);
      const agentic = parseAgentic(input);
      const models = (input.models as string[]) ?? DEFAULT_INPUTS.selectedModels;
      const result = calculateAgenticRag(conv, rag, agentic);
      const costs = computeCosts(result, models);
      return { content: [{ type: 'text', text: formatResult(result, costs) }] };
    } catch (error) {
      return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
    }
  }
);

server.tool(
  'compare_solutions',
  'Compare token usage and costs across all three architectures: Simple Chat, RAG, and Agentic RAG, including Azure PTU analysis',
  { ...conversationSchema, ...ragSchema, ...agenticSchema, ...ptuSchema, ...modelsSchema },
  async (input) => {
    try {
      const conv = parseConv(input);
      const rag = parseRag(input);
      const agentic = parseAgentic(input);
      const ptu = parsePtu(input);
      const models = (input.models as string[]) ?? DEFAULT_INPUTS.selectedModels;

      const chatResult = calculateChat(conv);
      const ragResult = calculateRag(conv, rag);
      const agenticResult = calculateAgenticRag(conv, rag, agentic);

      const ptuModelIds = ptu.models.map((m) => m.payPerTokenModelId);
      const sections = [chatResult, ragResult, agenticResult].map((r) => {
        const costs = computeCosts(r, models);
        const ptuCosts = computeCosts(r, ptuModelIds);
        const ptuEstimates = calculatePTU(r, ptu, ptuCosts);
        return formatResult(r, costs) + '\n' + formatPTUEstimates(ptuEstimates);
      });

      const multiplier = chatResult.dailyTotalTokens > 0
        ? (agenticResult.dailyTotalTokens / chatResult.dailyTotalTokens).toFixed(1)
        : 'N/A';

      const summary = [
        '# LLM Token Comparison',
        '',
        `> Agentic RAG uses **${multiplier}x** more tokens than Simple Chat`,
        '',
        ...sections,
      ].join('\n');

      return { content: [{ type: 'text', text: summary }] };
    } catch (error) {
      return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
    }
  }
);

server.tool(
  'list_models',
  'List all available LLM models and their pricing',
  {},
  async () => {
    const lines = [
      '# Available LLM Models',
      '',
      '| ID | Name | Provider | Input $/1K | Output $/1K |',
      '|----|------|----------|-----------|------------|',
      ...LLM_MODELS.map(
        (m) =>
          `| ${m.id} | ${m.name} | ${m.provider} | $${m.inputPricePer1KTokens} | $${m.outputPricePer1KTokens} |`
      ),
    ];
    return { content: [{ type: 'text', text: lines.join('\n') }] };
  }
);

function formatPTUEstimates(estimates: PTUEstimate[]): string {
  if (estimates.length === 0) return '';
  const lines = [
    '',
    '### Azure PTU Analysis',
    '',
    '| Model | PTUs | PTU $/mo (committed) | Pay-per-token $/mo | Breakeven | Winner |',
    '|-------|------|---------------------|-------------------|-----------|--------|',
    ...estimates.map((e) => {
      const winner = e.recommendation === 'ptu' ? '☁️ PTU' : '💳 Pay-Go';
      return `| ${e.modelName} | ${e.requiredPTUs} | $${e.monthlyPTUCostCommitted.toFixed(2)} | $${e.monthlyPayPerTokenCost.toFixed(2)} | ${e.breakevenUtilization}% | ${winner} (saves $${e.savingsPerMonth.toFixed(2)}/mo) |`;
    }),
  ];
  return lines.join('\n');
}

server.tool(
  'calculate_ptu_estimate',
  'Calculate Azure PTU (Provisioned Throughput Units) requirements and compare with pay-per-token pricing for GPT-4o and GPT-4o-mini',
  { ...conversationSchema, ...ragSchema, ...agenticSchema, ...ptuSchema },
  async (input) => {
    try {
      const conv = parseConv(input);
      const rag = parseRag(input);
      const agentic = parseAgentic(input);
      const ptu = parsePtu(input);

      const chatResult = calculateChat(conv);
      const ragResult = calculateRag(conv, rag);
      const agenticResult = calculateAgenticRag(conv, rag, agentic);

      const ptuModelIds = ptu.models.map((m) => m.payPerTokenModelId);
      const sections = [chatResult, ragResult, agenticResult].map((result) => {
        const costs = computeCosts(result, ptuModelIds);
        const ptuEstimates = calculatePTU(result, ptu, costs);
        return `## ${result.label}\n${result.description}\n${formatPTUEstimates(ptuEstimates)}`;
      });

      const summary = [
        '# Azure PTU Estimate',
        '',
        `> Active hours/day: ${ptu.activeHoursPerDay} | Peak utilization: ${ptu.peakUtilizationPercent}%`,
        '',
        ...sections,
      ].join('\n');

      return { content: [{ type: 'text', text: summary }] };
    } catch (error) {
      return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
