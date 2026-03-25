import type { SolutionWithCosts } from '../types';

function formatCurrency(n: number): string {
  if (n >= 1000) return '$' + n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (n >= 1) return '$' + n.toFixed(2);
  return '$' + n.toFixed(4);
}

interface PTUComparisonProps {
  results: SolutionWithCosts[];
}

const HEADER_COLORS = ['text-blue-400', 'text-emerald-400', 'text-purple-400'];

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
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">{modelName}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 py-2 pr-4">Metric</th>
                    {results.map((sol, i) => (
                      <th
                        key={sol.result.label}
                        className={`text-right py-2 px-3 ${HEADER_COLORS[i]}`}
                      >
                        {sol.result.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="text-gray-300 py-2 pr-4">Peak TPM</td>
                    {results.map((sol) => {
                      const est = sol.ptuEstimates.find((e) => e.modelId === modelId);
                      return (
                        <td key={sol.result.label} className="text-right py-2 px-3 text-white font-mono">
                          {est ? est.requiredTPM.toLocaleString() : '—'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="text-gray-300 py-2 pr-4">PTUs Required</td>
                    {results.map((sol) => {
                      const est = sol.ptuEstimates.find((e) => e.modelId === modelId);
                      return (
                        <td key={sol.result.label} className="text-right py-2 px-3 text-white font-mono font-bold">
                          {est ? est.requiredPTUs : '—'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="text-gray-300 py-2 pr-4">
                      PTU Cost /mo
                      <span className="text-gray-500 text-xs ml-1">(hourly)</span>
                    </td>
                    {results.map((sol) => {
                      const est = sol.ptuEstimates.find((e) => e.modelId === modelId);
                      return (
                        <td key={sol.result.label} className="text-right py-2 px-3 text-gray-400 font-mono">
                          {est ? formatCurrency(est.monthlyPTUCostHourly) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="text-gray-300 py-2 pr-4">
                      PTU Cost /mo
                      <span className="text-gray-500 text-xs ml-1">(committed)</span>
                    </td>
                    {results.map((sol) => {
                      const est = sol.ptuEstimates.find((e) => e.modelId === modelId);
                      return (
                        <td key={sol.result.label} className="text-right py-2 px-3 text-white font-mono">
                          {est ? formatCurrency(est.monthlyPTUCostCommitted) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="text-gray-300 py-2 pr-4">Pay-per-token /mo</td>
                    {results.map((sol) => {
                      const est = sol.ptuEstimates.find((e) => e.modelId === modelId);
                      return (
                        <td key={sol.result.label} className="text-right py-2 px-3 text-white font-mono">
                          {est ? formatCurrency(est.monthlyPayPerTokenCost) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="text-gray-300 py-2 pr-4">Breakeven Utilization</td>
                    {results.map((sol) => {
                      const est = sol.ptuEstimates.find((e) => e.modelId === modelId);
                      return (
                        <td key={sol.result.label} className="text-right py-2 px-3 text-white font-mono">
                          {est ? `${est.breakevenUtilization}%` : '—'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="text-gray-300 py-2 pr-4">Recommendation</td>
                    {results.map((sol) => {
                      const est = sol.ptuEstimates.find((e) => e.modelId === modelId);
                      if (!est) {
                        return (
                          <td key={sol.result.label} className="text-right py-2 px-3">—</td>
                        );
                      }
                      const isPTU = est.recommendation === 'ptu';
                      return (
                        <td key={sol.result.label} className="text-right py-2 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              isPTU
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {isPTU ? '☁️ PTU' : '💳 Pay-Go'}
                            <span className="text-gray-400">
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
