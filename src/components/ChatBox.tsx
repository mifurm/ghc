import { useState, useRef, useEffect } from 'react';
import type { CalculatorInputs, SolutionWithCosts } from '../types';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

interface ChatBoxProps {
  inputs: CalculatorInputs;
  results: SolutionWithCosts[];
}

// ── Knowledge base: question patterns → answers ──────────────────────────────

interface QA {
  patterns: RegExp[];
  answer: (inputs: CalculatorInputs, results: SolutionWithCosts[]) => string;
}

const KB: QA[] = [
  {
    patterns: [/token/i, /word.*token|token.*word/i, /ratio/i, /convert/i],
    answer: () =>
      'Words are converted to tokens using a ratio of **1.33 tokens per word** ' +
      '(the global average across common LLM tokenisers). ' +
      'So 100 words ≈ 133 tokens. This is a conservative estimate; ' +
      'technical or code-heavy content can run higher.',
  },
  {
    patterns: [/simple chat|chat calc|how.*chat work/i],
    answer: (inputs) => {
      const { systemPromptWords, avgUserMessageWords, avgAssistantResponseWords, messagesPerConversation } =
        inputs.conversation;
      const sys = Math.ceil(systemPromptWords * 1.33);
      const user = Math.ceil(avgUserMessageWords * 1.33);
      const asst = Math.ceil(avgAssistantResponseWords * 1.33);
      return (
        '**Simple Chat** accumulates context across turns:\n\n' +
        `- System prompt: ~${sys} tokens (sent every turn)\n` +
        `- Each user message: ~${user} tokens\n` +
        `- Each assistant response: ~${asst} tokens\n\n` +
        `With ${messagesPerConversation} turns, turn *i* sends the system prompt ` +
        `plus all *i−1* previous exchanges plus the new user message as input, ` +
        `so input tokens grow linearly with history depth.`
      );
    },
  },
  {
    patterns: [/rag|retriev/i],
    answer: (inputs) => {
      const { documentsRetrieved, avgChunkSizeWords } = inputs.rag;
      const chunkTokens = Math.ceil(avgChunkSizeWords * 1.33);
      const total = documentsRetrieved * chunkTokens;
      return (
        '**RAG** adds retrieved document chunks to every request:\n\n' +
        `- Chunks retrieved: ${documentsRetrieved}\n` +
        `- Avg chunk size: ${avgChunkSizeWords} words ≈ ${chunkTokens} tokens each\n` +
        `- RAG overhead per request: ~${total} extra input tokens\n\n` +
        'Embedding tokens for the query are also counted separately. ' +
        'The RAG cost is additive on top of the base chat cost.'
      );
    },
  },
  {
    patterns: [/agentic|agent|tool call|multi.?step/i],
    answer: (inputs) => {
      const { avgAgentSteps, avgToolCallsPerStep, toolResultSizeWords, reasoningOverheadPercent } =
        inputs.agenticRag;
      return (
        '**Agentic RAG** multiplies token cost across multiple LLM calls:\n\n' +
        `- Agent steps: ${avgAgentSteps} LLM calls per conversation\n` +
        `- Tool calls per step: ${avgToolCallsPerStep}\n` +
        `- Tool result size: ${toolResultSizeWords} words per call\n` +
        `- Reasoning overhead: +${reasoningOverheadPercent}% on top of base tokens\n\n` +
        'Each step feeds the previous output back as context, so token usage ' +
        'compounds quickly — this is why Agentic RAG can be several times more ' +
        'expensive than Simple Chat.'
      );
    },
  },
  {
    patterns: [/cost|price|dollar|\$/i],
    answer: (_inputs, results) => {
      if (results.length === 0) return 'No cost data available yet — select at least one model.';
      const chat = results[0];
      if (chat.costs.length === 0)
        return 'Select at least one model in the sidebar to see cost estimates.';
      const lines = chat.costs.map(
        (c) => `- **${c.modelName}**: $${c.dailyTotalCost.toFixed(2)}/day | $${c.monthlyCost.toFixed(2)}/mo`
      );
      return (
        'Costs are computed as:\n\n' +
        '`daily_cost = (daily_input_tokens / 1 000) × input_price_per_1K +\n' +
        '              (daily_output_tokens / 1 000) × output_price_per_1K`\n\n' +
        'Monthly cost = daily cost × 30.\n\n' +
        '**Current Simple Chat estimates:**\n' +
        lines.join('\n')
      );
    },
  },
  {
    patterns: [/ptu|provision|throughput/i],
    answer: (inputs) => {
      const { activeHoursPerDay, peakUtilizationPercent } = inputs.ptu;
      return (
        '**Azure PTU (Provisioned Throughput Units)** are compared to pay-per-token:\n\n' +
        `- Active hours/day: ${activeHoursPerDay}h\n` +
        `- Peak utilisation: ${peakUtilizationPercent}%\n\n` +
        'Required TPM = (daily tokens / active minutes) × (peak % / 100).\n' +
        'Required PTUs = ceil(required TPM / TPM-per-PTU).\n\n' +
        'The break-even utilisation is the fraction at which PTU committed cost equals ' +
        'pay-per-token cost. Above break-even, PTU wins; below it, pay-per-token is cheaper.'
      );
    },
  },
  {
    patterns: [/daily|month/i],
    answer: (_inputs, results) => {
      if (results.length === 0) return 'Run the calculator first to see token totals.';
      const lines = results.map(
        (r) =>
          `- **${r.result.label}**: ${r.result.dailyTotalTokens.toLocaleString()} tokens/day | ` +
          `${r.result.monthlyTotalTokens.toLocaleString()} tokens/mo`
      );
      return (
        'Daily tokens = total tokens per conversation × (users × convos/user/day).\n' +
        'Monthly tokens = daily tokens × 30.\n\n' +
        '**Current estimates:**\n' +
        lines.join('\n')
      );
    },
  },
  {
    patterns: [/embed/i],
    answer: (inputs) => {
      const { documentsRetrieved, avgChunkSizeWords } = inputs.rag;
      const queryWords = inputs.conversation.avgUserMessageWords;
      const embTokens = Math.ceil((queryWords + documentsRetrieved * avgChunkSizeWords) * 1.33);
      return (
        `Embedding tokens are calculated for the query + ${documentsRetrieved} retrieved chunks:\n\n` +
        `≈ (${queryWords} + ${documentsRetrieved}×${avgChunkSizeWords}) words × 1.33 = ~${embTokens} tokens per request.\n\n` +
        'These are billed at a much lower rate than LLM tokens and are shown separately in the Token Breakdown.'
      );
    },
  },
  {
    patterns: [/help|what can|hi|hello|hey/i],
    answer: () =>
      'Hi! I can explain how this calculator works. Try asking about:\n\n' +
      '- **tokens** – how words become tokens\n' +
      '- **simple chat** – growing context window\n' +
      '- **RAG** – retrieval-augmented generation cost\n' +
      '- **agentic** – multi-step agent overhead\n' +
      '- **cost / pricing** – how dollar amounts are computed\n' +
      '- **PTU** – provisioned throughput units\n' +
      '- **daily / monthly** – volume projections',
  },
];

function findAnswer(
  question: string,
  inputs: CalculatorInputs,
  results: SolutionWithCosts[]
): string {
  for (const qa of KB) {
    if (qa.patterns.some((p) => p.test(question))) {
      return qa.answer(inputs, results);
    }
  }
  return (
    "I don't have a specific answer for that yet. Try asking about **tokens**, " +
    '**simple chat**, **RAG**, **agentic**, **cost**, **PTU**, or **daily / monthly** projections.'
  );
}

// ── Simple markdown-like renderer (bold + newlines only) ─────────────────────

function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          style={{
            fontFamily: 'monospace',
            fontSize: '0.8em',
            background: 'rgba(255,255,255,0.07)',
            padding: '1px 4px',
            borderRadius: '3px',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div
      className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ alignItems: 'flex-start' }}
    >
      {/* Avatar */}
      <div
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
        style={{
          background: isUser ? 'rgba(0,120,212,0.3)' : 'rgba(0,183,195,0.2)',
          color: isUser ? '#2b88d8' : '#00b7c3',
          border: `1px solid ${isUser ? 'rgba(0,120,212,0.4)' : 'rgba(0,183,195,0.3)'}`,
        }}
      >
        {isUser ? 'U' : '🤖'}
      </div>

      {/* Bubble */}
      <div
        className="rounded-lg px-3 py-2 text-sm max-w-[80%]"
        style={{
          background: isUser ? 'rgba(0,120,212,0.15)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${isUser ? 'rgba(0,120,212,0.3)' : 'rgba(255,255,255,0.08)'}`,
          color: 'var(--text-primary)',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.5,
        }}
      >
        {msg.text.split('\n').map((line, li) => (
          <p key={li} className={li > 0 ? 'mt-1' : ''}>
            {renderText(line)}
          </p>
        ))}
      </div>
    </div>
  );
}

const INITIAL_MESSAGE: Message = {
  id: 0,
  role: 'assistant',
  text:
    'Hi! Ask me anything about how this calculator works — tokens, costs, RAG, ' +
    'Agentic pipelines, or Azure PTU. Type **help** to see all topics.',
};

export function ChatBox({ inputs, results }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [nextId, setNextId] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: nextId, role: 'user', text };
    const answer = findAnswer(text, inputs, results);
    const assistantMsg: Message = { id: nextId + 1, role: 'assistant', text: answer };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setNextId((n) => n + 2);
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSend();
  }

  return (
    <>
      {/* ── Floating toggle button ─────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Close calculator assistant' : 'Open calculator assistant'}
        title={isOpen ? 'Close assistant' : 'Ask how calculations work'}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 50,
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: isOpen
            ? 'rgba(0,120,212,0.25)'
            : 'linear-gradient(135deg, #0078d4, #00b7c3)',
          border: '1px solid rgba(0,120,212,0.5)',
          color: '#fff',
          fontSize: '22px',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,120,212,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
        }}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* ── Chat panel ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Calculator assistant"
          style={{
            position: 'fixed',
            bottom: '88px',
            right: '24px',
            zIndex: 50,
            width: '360px',
            maxHeight: '520px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '12px',
            background: 'var(--foundry-surface)',
            border: '1px solid rgba(0,120,212,0.35)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{
              background: 'linear-gradient(90deg, rgba(0,120,212,0.2), rgba(0,183,195,0.12))',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <span style={{ fontSize: '18px' }}>🤖</span>
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Calculator Assistant
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Ask how the calculations work
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ minHeight: 0 }}
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="flex gap-2 px-3 py-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about tokens, cost, RAG…"
              aria-label="Chat input"
              style={{
                flex: 1,
                background: 'var(--foundry-surface-2)',
                border: '1px solid var(--foundry-border)',
                color: 'var(--text-primary)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '13px',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = '1px solid var(--ms-blue)';
                e.currentTarget.style.boxShadow = '0 0 0 1px var(--ms-blue)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = '1px solid var(--foundry-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              aria-label="Send"
              style={{
                background: input.trim() ? 'var(--ms-blue)' : 'rgba(0,120,212,0.2)',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                padding: '6px 12px',
                fontSize: '13px',
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'background 0.15s',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
