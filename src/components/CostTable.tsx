import type { SolutionWithCosts } from '../types';

function formatCurrency(n: number): string {
  if (n >= 1000) return '$' + n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (n >= 1) return '$' + n.toFixed(2);
  if (n >= 0.01) return '$' + n.toFixed(3);
  return '$' + n.toFixed(4);
}

interface CostTableProps {
  results: SolutionWithCosts[];
}

const HEADER_COLORS = ['#2b88d8', '#50e6a0', '#c4aeff'];

export function CostTable({ results }: CostTableProps) {
  // Get all unique model names from any solution
  const modelIds = results[0]?.costs.map((c) => c.modelId) ?? [];

  if (modelIds.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        Select at least one model to see cost estimates.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--foundry-border)' }}>
            <th
              className="text-left py-2 pr-4 text-xs font-medium uppercase tracking-wide"
              style={{ color: 'var(--text-secondary)' }}
            >
              Model
            </th>
            {results.map((sol, i) => (
              <th
                key={sol.result.label}
                className="text-center py-2 px-2 text-xs font-semibold"
                style={{ color: HEADER_COLORS[i] }}
                colSpan={2}
              >
                {sol.result.label}
              </th>
            ))}
          </tr>
          <tr style={{ borderBottom: '1px solid var(--foundry-border)' }}>
            <th className="py-1 pr-4"></th>
            {results.map((sol) => (
              <>
                <th
                  key={`${sol.result.label}-d`}
                  className="text-right py-1 px-2 text-xs font-normal"
                  style={{ color: 'var(--text-muted)' }}
                >
                  /day
                </th>
                <th
                  key={`${sol.result.label}-m`}
                  className="text-right py-1 px-2 text-xs font-normal"
                  style={{ color: 'var(--text-muted)' }}
                >
                  /month
                </th>
              </>
            ))}
          </tr>
        </thead>
        <tbody>
          {modelIds.map((modelId) => (
            <tr
              key={modelId}
              style={{ borderBottom: '1px solid var(--foundry-border-soft)' }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = 'transparent')
              }
            >
              <td className="py-2 pr-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {results[0].costs.find((c) => c.modelId === modelId)?.modelName}
              </td>
              {results.map((sol) => {
                const cost = sol.costs.find((c) => c.modelId === modelId);
                return (
                  <>
                    <td
                      key={`${sol.result.label}-${modelId}-d`}
                      className="text-right py-2 px-2 font-mono text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {cost ? formatCurrency(cost.dailyTotalCost) : '—'}
                    </td>
                    <td
                      key={`${sol.result.label}-${modelId}-m`}
                      className="text-right py-2 px-2 font-mono text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {cost ? formatCurrency(cost.monthlyCost) : '—'}
                    </td>
                  </>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
