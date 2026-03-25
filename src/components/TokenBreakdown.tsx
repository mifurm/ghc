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

const BAR_COLORS = [
  'bg-blue-400',
  'bg-emerald-400',
  'bg-purple-400',
];

export function TokenBreakdown({ results }: TokenBreakdownProps) {
  const breakdownKeys = Object.keys(COMPONENT_LABELS);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left text-gray-400 py-2 pr-4">Component</th>
            {results.map((sol, i) => (
              <th key={sol.result.label} className={`text-right py-2 px-3 ${BAR_COLORS[i].replace('bg-', 'text-')}`}>
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
              <tr key={key} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="text-gray-300 py-2 pr-4">{COMPONENT_LABELS[key]}</td>
                {values.map((v, i) => (
                  <td key={i} className="text-right py-2 px-3 text-white font-mono">
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
