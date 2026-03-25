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

const HEADER_COLORS = ['text-blue-400', 'text-emerald-400', 'text-purple-400'];

export function CostTable({ results }: CostTableProps) {
  // Get all unique model names from any solution
  const modelIds = results[0]?.costs.map((c) => c.modelId) ?? [];

  if (modelIds.length === 0) {
    return (
      <p className="text-gray-400 text-sm">Select at least one model to see cost estimates.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left text-gray-400 py-2 pr-4">Model</th>
            {results.map((sol, i) => (
              <th key={sol.result.label} className={`text-center py-2 px-2 ${HEADER_COLORS[i]}`} colSpan={2}>
                {sol.result.label}
              </th>
            ))}
          </tr>
          <tr className="border-b border-gray-700">
            <th className="text-left text-gray-500 py-1 pr-4 text-xs"></th>
            {results.map((sol) => (
              <>
                <th key={`${sol.result.label}-d`} className="text-right text-gray-500 py-1 px-2 text-xs">
                  /day
                </th>
                <th key={`${sol.result.label}-m`} className="text-right text-gray-500 py-1 px-2 text-xs">
                  /month
                </th>
              </>
            ))}
          </tr>
        </thead>
        <tbody>
          {modelIds.map((modelId) => (
            <tr key={modelId} className="border-b border-gray-800 hover:bg-gray-800/50">
              <td className="text-gray-300 py-2 pr-4">
                {results[0].costs.find((c) => c.modelId === modelId)?.modelName}
              </td>
              {results.map((sol) => {
                const cost = sol.costs.find((c) => c.modelId === modelId);
                return (
                  <>
                    <td key={`${sol.result.label}-${modelId}-d`} className="text-right py-2 px-2 text-white font-mono">
                      {cost ? formatCurrency(cost.dailyTotalCost) : '—'}
                    </td>
                    <td key={`${sol.result.label}-${modelId}-m`} className="text-right py-2 px-2 text-gray-300 font-mono">
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
