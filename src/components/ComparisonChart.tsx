import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { SolutionWithCosts } from '../types';

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toFixed(0);
}

interface ComparisonChartProps {
  results: SolutionWithCosts[];
}

export function ComparisonChart({ results }: ComparisonChartProps) {
  const tokenData = results.map((sol) => ({
    name: sol.result.label,
    'Input Tokens': sol.result.dailyInputTokens,
    'Output Tokens': sol.result.dailyOutputTokens,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h3
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          Daily Token Comparison
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tokenData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" tick={{ fill: '#8a8d9f', fontSize: 12 }} />
            <YAxis tick={{ fill: '#8a8d9f', fontSize: 12 }} tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1c2238',
                border: '1px solid rgba(0,120,212,0.3)',
                borderRadius: '6px',
                color: '#f3f4f6',
                fontFamily: "'Segoe UI', sans-serif",
              }}
              formatter={(value) => formatNumber(Number(value))}
            />
            <Legend wrapperStyle={{ color: '#8a8d9f' }} />
            <Bar dataKey="Input Tokens" fill="#0078d4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Output Tokens" fill="#00b294" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
