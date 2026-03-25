import type { SolutionWithCosts } from '../types';

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toFixed(0);
}

function formatCurrency(n: number): string {
  if (n >= 1000) return '$' + n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (n >= 1) return '$' + n.toFixed(2);
  return '$' + n.toFixed(4);
}

const CARD_STYLES = [
  { border: 'rgba(0,120,212,0.35)', accent: '#0078d4', bg: 'rgba(0,120,212,0.06)' },
  { border: 'rgba(0,178,148,0.35)', accent: '#00b294', bg: 'rgba(0,178,148,0.06)' },
  { border: 'rgba(135,100,184,0.35)', accent: '#8764b8', bg: 'rgba(135,100,184,0.06)' },
];
const LABEL_COLORS = ['#2b88d8', '#50e6a0', '#c4aeff'];

interface ResultsPanelProps {
  results: SolutionWithCosts[];
}

export function ResultsPanel({ results }: ResultsPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {results.map((sol, i) => {
        const cheapest = sol.costs.length > 0
          ? sol.costs.reduce((a, b) => (a.dailyTotalCost < b.dailyTotalCost ? a : b))
          : null;
        const mostExpensive = sol.costs.length > 0
          ? sol.costs.reduce((a, b) => (a.dailyTotalCost > b.dailyTotalCost ? a : b))
          : null;

        return (
          <div
            key={sol.result.label}
            className="rounded-lg p-4"
            style={{
              background: CARD_STYLES[i].bg,
              border: `1px solid ${CARD_STYLES[i].border}`,
            }}
          >
            <h3 className="text-base font-semibold" style={{ color: LABEL_COLORS[i] }}>
              {sol.result.label}
            </h3>
            <p
              className="text-xs mt-1 mb-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              {sol.result.description}
            </p>

            <div className="space-y-3">
              <div>
                <div
                  className="text-xs uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Daily Tokens
                </div>
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {formatNumber(sol.result.dailyTotalTokens)}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {formatNumber(sol.result.dailyInputTokens)} in /{' '}
                  {formatNumber(sol.result.dailyOutputTokens)} out
                </div>
              </div>

              <div>
                <div
                  className="text-xs uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Monthly Tokens
                </div>
                <div className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {formatNumber(sol.result.monthlyTotalTokens)}
                </div>
              </div>

              <div>
                <div
                  className="text-xs uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Per Conversation
                </div>
                <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {formatNumber(sol.result.perConversationTotal)} tokens
                </div>
              </div>

              <div>
                <div
                  className="text-xs uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Avg Per Request
                </div>
                <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {formatNumber(sol.result.perRequestInput)} in /{' '}
                  {formatNumber(sol.result.perRequestOutput)} out
                </div>
              </div>

              {cheapest && mostExpensive && (
                <div
                  className="pt-3 mt-3"
                  style={{ borderTop: `1px solid ${CARD_STYLES[i].border}` }}
                >
                  <div
                    className="text-xs uppercase tracking-wide"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Daily Cost Range
                  </div>
                  <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(cheapest.dailyTotalCost)} –{' '}
                    {formatCurrency(mostExpensive.dailyTotalCost)}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {formatCurrency(cheapest.monthlyCost)} –{' '}
                    {formatCurrency(mostExpensive.monthlyCost)} / mo
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
