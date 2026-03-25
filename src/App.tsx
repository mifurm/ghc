import { useState } from 'react';
import type { CalculatorInputs } from './types';
import { DEFAULT_INPUTS } from './constants/defaults';
import { useCalculator } from './hooks/useCalculator';
import { InputPanel } from './components/InputPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { TokenBreakdown } from './components/TokenBreakdown';
import { ComparisonChart } from './components/ComparisonChart';
import { CostTable } from './components/CostTable';
import { PTUComparison } from './components/PTUComparison';

function App() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const results = useCalculator(inputs);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">
          LLM Token Calculator
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Compare token usage &amp; costs across Chat, RAG, and Agentic RAG architectures
        </p>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Input Panel - Sidebar */}
        <aside className="lg:w-80 xl:w-96 border-r border-gray-800 p-5 overflow-y-auto lg:h-[calc(100vh-73px)] lg:sticky lg:top-0 shrink-0">
          <InputPanel inputs={inputs} onChange={setInputs} />
        </aside>

        {/* Results */}
        <main className="flex-1 p-6 space-y-8 overflow-y-auto">
          {/* Summary Cards */}
          <section>
            <h2 className="text-lg font-semibold text-gray-300 mb-4">Overview</h2>
            <ResultsPanel results={results} />
          </section>

          {/* Comparison Chart */}
          <section className="bg-gray-900 rounded-lg border border-gray-800 p-5">
            <ComparisonChart results={results} />
          </section>

          {/* Token Breakdown */}
          <section className="bg-gray-900 rounded-lg border border-gray-800 p-5">
            <h2 className="text-lg font-semibold text-gray-300 mb-4">
              Per-Request Token Breakdown
            </h2>
            <TokenBreakdown results={results} />
          </section>

          {/* Cost Table */}
          <section className="bg-gray-900 rounded-lg border border-gray-800 p-5">
            <h2 className="text-lg font-semibold text-gray-300 mb-4">
              Cost Estimates by Model
            </h2>
            <CostTable results={results} />
          </section>

          {/* Azure PTU Analysis */}
          <section className="bg-gray-900 rounded-lg border border-cyan-900/50 p-5">
            <h2 className="text-lg font-semibold text-cyan-400 mb-1">
              ☁️ Azure PTU Analysis
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Provisioned Throughput Units — reserved capacity vs pay-per-token comparison
            </p>
            <PTUComparison results={results} />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
