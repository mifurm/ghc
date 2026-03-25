import type { SolutionWithCosts } from '../types';

function formatCurrency(n: number): string {
  if (n >= 1000) return '$' + n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (n >= 1) return '$' + n.toFixed(2);
  return '$' + n.toFixed(4);
}

interface PTUComparisonProps {
  results: SolutionWithCosts[];
}

const HEADER_COLORS = ['#2b88d8', '#50e6a0', '#c4aeff'];

export function PTUComparison({ results }: PTUComparisonProps) {
  // Get PTU models from first result
  const ptuModels = results[0]?.ptuEstimates ?? [];

  if (ptuModels.length === 0) {
    return null;
  }

  const uniqueModelIds = [...new Set(ptuModels.map((e) => e.modelId))];

  return (
    <div className="space-y-6">
      {uniqueModelIds.map((modelId) => {
        const modelName = ptuModels.find((e) => e.modelId === modelId)?.modelName ?? modelId;

        return (
          <div key={modelId}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--ms-teal)' }}>
              {modelName}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--foundry-border)' }}>
                    <th
                      className="text-left py-2 pr-4 text-xs font-medium uppercase tracking-wide"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Metric
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
                  <tr style={{ borderBottom: '1px solid var(--foundry-border-soft)' }}>
                    <td className="py-2 pr-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Peak TPM
                    </td>
                    {results.map((sol) => {
                      const est = sol.ptuEstimates.find((e) => e.modelId === modelId);
                      return (
                        <td
                          key={sol.result.label}
                          className="text-right py-2 px-3 font-mono text-sm"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {est ? est.requiredTPM.toLocaleString() : '—'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--foundry-border-soft)' }}>
                    <td className="py-2 pr-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      PTUs Required
                    </td>
                    {results.map((sol) => {
                      const est = sol.ptuEstimates.find((e) => e.modelId === modelId);
                      return (
                        <td
                          key={sol.result.label}
                          className="text-right py-2 px-3 font-mono font-bold text-sm"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {est ? est.requiredPTUs : '—'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--foundry-border-soft)' }}>
                    <td className="py-2 pr-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      PTU Cost /mo{' '}
                      <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
                        (hourly)
                      </span>
                    </td>
                    {results.map((sol) => {
                      const est = sol.ptuEstimates.find((e) => e.modelId === modelId);
                      return (
                        <td
                          key={sol.result.label}
                          className="text-right py-2 px-3 font-mono text-sm"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {est ? formatCurrency(est.monthlyPTUCostHourly) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--foundry-border-soft)' }}>
                    <td className="py-2 pr-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      PTU Cost /mo{' '}
                      <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
                        (committed)
                      </span>
                    </td>
                    {results.map((sol) => {
                      const est = sol.ptuEstimates.find((e) => e.modelId === modelId);
                      return (
                        <td
                          key={sol.result.label}
                          className="text-right py-2 px-3 font-mono text-sm"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {est ? formatCurrency(est.monthlyPTUCostCommitted) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--foundry-border-soft)' }}>
                    <td className="py-2 pr-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Pay-per-token /mo
                    </td>
                    {results.map((sol) => {
                      const est = sol.ptuEstimates.find((e) => e.modelId === modelId);
                      return (
                        <td
                          key={sol.result.label}
                          className="text-right py-2 px-3 font-mono text-sm"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {est ? formatCurrency(est.monthlyPayPerTokenCost) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--foundry-border-soft)' }}>
                    <td className="py-2 pr-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Breakeven Utilization
                    </td>
                    {results.map((sol) => {
                      const est = sol.ptuEstimates.find((e) => e.modelId === modelId);
                      return (
                        <td
                          key={sol.result.label}
                          className="text-right py-2 px-3 font-mono text-sm"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {est ? `${est.breakevenUtilization}%` : '—'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Recommendation
                    </td>
                    {results.map((sol) => {
                      const est = sol.ptuEstimates.find((e) => e.modelId === modelId);
                      if (!est) {
                        return (
                          <td key={sol.result.label} className="text-right py-2 px-3">
                            —
                          </td>
                        );
                      }
                      const isPTU = est.recommendation === 'ptu';
                      return (
                        <td key={sol.result.label} className="text-right py-2 px-3">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={
                              isPTU
                                ? {
                                    background: 'rgba(0,183,195,0.15)',
                                    color: '#00b7c3',
                                    border: '1px solid rgba(0,183,195,0.3)',
                                  }
                                : {
                                    background: 'rgba(255,185,0,0.1)',
                                    color: '#ffc83d',
                                    border: '1px solid rgba(255,185,0,0.25)',
                                  }
                            }
                          >
                            {isPTU ? '☁️ PTU' : '💳 Pay-Go'}
                            <span style={{ color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                              saves {formatCurrency(est.savingsPerMonth)}/mo
                            </span>
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
