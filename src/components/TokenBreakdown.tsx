import type { SolutionWithCosts } from '../types';

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toFixed(0);
}

interface TokenBreakdownProps {
  results: SolutionWithCosts[];
}

const COMPONENT_LABELS: Record<string, string> = {
  systemPrompt: 'System Prompt',
  conversationHistory: 'Conversation History (avg)',
  userMessage: 'User Message',
  assistantResponse: 'Assistant Response',
  ragChunks: 'RAG Chunks',
  embeddingTokens: 'Embedding',
  toolResults: 'Tool Results',
  reasoningOverhead: 'Reasoning Overhead (%)',
};

const HEADER_COLORS = ['#2b88d8', '#50e6a0', '#c4aeff'];

export function TokenBreakdown({ results }: TokenBreakdownProps) {
  const breakdownKeys = Object.keys(COMPONENT_LABELS);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--foundry-border)' }}>
            <th
              className="text-left py-2 pr-4 text-xs font-medium uppercase tracking-wide"
              style={{ color: 'var(--text-secondary)' }}
            >
              Component
            </th>
            {results.map((sol, i) => (
              <th
                key={sol.result.label}
                className="text-right py-2 px-3 text-xs font-semibold"
                style={{ color: HEADER_COLORS[i] }}
              >
                {sol.result.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {breakdownKeys.map((key) => {
            const values = results.map(
              (sol) => sol.result.breakdown[key as keyof typeof sol.result.breakdown]
            );
            const anyNonZero = values.some((v) => v > 0);
            if (!anyNonZero) return null;

            return (
              <tr
                key={key}
                style={{ borderBottom: '1px solid var(--foundry-border-soft)' }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = 'transparent')
                }
              >
                <td className="py-2 pr-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {COMPONENT_LABELS[key]}
                </td>
                {values.map((v, i) => (
                  <td
                    key={i}
                    className="text-right py-2 px-3 font-mono text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {key === 'reasoningOverhead'
                      ? v > 0
                        ? `+${v}%`
                        : '—'
                      : v > 0
                        ? formatNumber(v)
                        : '—'}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
