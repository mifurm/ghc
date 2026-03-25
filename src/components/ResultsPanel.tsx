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

const COLORS = ['bg-blue-500/20 border-blue-500/50', 'bg-emerald-500/20 border-emerald-500/50', 'bg-purple-500/20 border-purple-500/50'];
const LABEL_COLORS = ['text-blue-400', 'text-emerald-400', 'text-purple-400'];

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
            className={`rounded-lg border p-4 ${COLORS[i]}`}
          >
            <h3 className={`text-lg font-bold ${LABEL_COLORS[i]}`}>
              {sol.result.label}
            </h3>
            <p className="text-xs text-gray-400 mt-1 mb-4">{sol.result.description}</p>

            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-400 uppercase">Daily Tokens</div>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(sol.result.dailyTotalTokens)}
                </div>
                <div className="text-xs text-gray-400">
                  {formatNumber(sol.result.dailyInputTokens)} in /{' '}
                  {formatNumber(sol.result.dailyOutputTokens)} out
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 uppercase">Monthly Tokens</div>
                <div className="text-xl font-semibold text-white">
                  {formatNumber(sol.result.monthlyTotalTokens)}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 uppercase">Per Conversation</div>
                <div className="text-sm text-white">
                  {formatNumber(sol.result.perConversationTotal)} tokens
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 uppercase">Avg Per Request</div>
                <div className="text-sm text-white">
                  {formatNumber(sol.result.perRequestInput)} in /{' '}
                  {formatNumber(sol.result.perRequestOutput)} out
                </div>
              </div>

              {cheapest && mostExpensive && (
                <div className="border-t border-gray-600 pt-3 mt-3">
                  <div className="text-xs text-gray-400 uppercase">Daily Cost Range</div>
                  <div className="text-lg font-semibold text-white">
                    {formatCurrency(cheapest.dailyTotalCost)} –{' '}
                    {formatCurrency(mostExpensive.dailyTotalCost)}
                  </div>
                  <div className="text-xs text-gray-400">
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
