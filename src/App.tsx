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
    <div className="min-h-screen" style={{ background: 'var(--foundry-bg)', color: 'var(--text-primary)' }}>
      {/* ── Foundry-style top bar ── */}
      <header
        style={{
          background: 'linear-gradient(90deg, #0e1629 0%, #111827 100%)',
          borderBottom: '1px solid rgba(0,120,212,0.25)',
        }}
        className="px-6 py-3 flex items-center gap-4"
      >
        {/* Azure AI Foundry brand mark */}
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill="#0078d4" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
          </svg>
          <div>
            <div className="text-xs font-medium tracking-widest uppercase" style={{ color: '#8a8d9f', letterSpacing: '0.12em' }}>
              Microsoft&nbsp;Foundry
            </div>
            <div className="text-base font-semibold leading-tight" style={{ color: '#f3f4f6' }}>
              LLM Token Calculator
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(0,120,212,0.15)', color: '#2b88d8', border: '1px solid rgba(0,120,212,0.3)' }}
          >
            Azure AI
          </span>
        </div>
      </header>

      {/* ── Breadcrumb bar ── */}
      <div
        className="px-6 py-2 text-xs flex items-center gap-1.5"
        style={{ background: 'var(--foundry-surface)', borderBottom: '1px solid var(--foundry-border)', color: 'var(--text-secondary)' }}
      >
        <span>Home</span>
        <span style={{ color: 'var(--text-muted)' }}>›</span>
        <span>Azure AI Foundry</span>
        <span style={{ color: 'var(--text-muted)' }}>›</span>
        <span style={{ color: '#2b88d8' }}>Token Calculator</span>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* ── Input Panel – Foundry sidebar ── */}
        <aside
          className="lg:w-80 xl:w-96 p-5 overflow-y-auto lg:h-[calc(100vh-89px)] lg:sticky lg:top-0 shrink-0"
          style={{
            background: 'var(--foundry-surface)',
            borderRight: '1px solid var(--foundry-border)',
          }}
        >
          <InputPanel inputs={inputs} onChange={setInputs} />
        </aside>

        {/* ── Results ── */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Summary Cards */}
          <section>
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              Overview
            </h2>
            <ResultsPanel results={results} />
          </section>

          {/* Comparison Chart */}
          <section
            className="rounded-lg p-5"
            style={{ background: 'var(--foundry-surface)', border: '1px solid var(--foundry-border)' }}
          >
            <ComparisonChart results={results} />
          </section>

          {/* Token Breakdown */}
          <section
            className="rounded-lg p-5"
            style={{ background: 'var(--foundry-surface)', border: '1px solid var(--foundry-border)' }}
          >
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              Per-Request Token Breakdown
            </h2>
            <TokenBreakdown results={results} />
          </section>

          {/* Cost Table */}
          <section
            className="rounded-lg p-5"
            style={{ background: 'var(--foundry-surface)', border: '1px solid var(--foundry-border)' }}
          >
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cost Estimates by Model
            </h2>
            <CostTable results={results} />
          </section>

          {/* Azure PTU Analysis */}
          <section
            className="rounded-lg p-5"
            style={{
              background: 'var(--foundry-surface)',
              border: '1px solid rgba(0,183,195,0.25)',
            }}
          >
            <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--ms-teal)' }}>
              ☁️ Azure PTU Analysis
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
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
