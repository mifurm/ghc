import type { CalculatorInputs } from '../types';
import { LLM_MODELS, EMBEDDING_MODELS } from '../constants/models';

interface InputPanelProps {
  inputs: CalculatorInputs;
  onChange: (inputs: CalculatorInputs) => void;
}

function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
  tooltip,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  tooltip?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-xs font-medium flex items-center gap-1"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
        {tooltip && (
          <span style={{ color: 'var(--text-muted)' }} className="cursor-help" title={tooltip}>
            ⓘ
          </span>
        )}
      </label>
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (!isNaN(v)) onChange(v);
        }}
        style={{
          background: 'var(--foundry-surface-2)',
          border: '1px solid var(--foundry-border)',
          color: 'var(--text-primary)',
          borderRadius: '4px',
        }}
        className="px-3 py-1.5 text-sm focus:outline-none"
        onFocus={(e) => {
          e.currentTarget.style.border = '1px solid var(--ms-blue)';
          e.currentTarget.style.boxShadow = '0 0 0 1px var(--ms-blue), 0 0 6px rgba(0,120,212,0.2)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = '1px solid var(--foundry-border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

export function InputPanel({ inputs, onChange }: InputPanelProps) {
  const updateConv = (key: string, value: number) =>
    onChange({
      ...inputs,
      conversation: { ...inputs.conversation, [key]: value },
    });

  const updateRag = (key: string, value: number | string) =>
    onChange({
      ...inputs,
      rag: { ...inputs.rag, [key]: value },
    });

  const updateAgentic = (key: string, value: number) =>
    onChange({
      ...inputs,
      agenticRag: { ...inputs.agenticRag, [key]: value },
    });

  const updatePtu = (key: string, value: number) =>
    onChange({
      ...inputs,
      ptu: { ...inputs.ptu, [key]: value },
    });

  const updatePtuModel = (index: number, key: string, value: number) => {
    const models = inputs.ptu.models.map((m, i) =>
      i === index ? { ...m, [key]: value } : m
    );
    onChange({ ...inputs, ptu: { ...inputs.ptu, models } });
  };

  const toggleModel = (modelId: string) => {
    const selected = inputs.selectedModels.includes(modelId)
      ? inputs.selectedModels.filter((id) => id !== modelId)
      : [...inputs.selectedModels, modelId];
    onChange({ ...inputs, selectedModels: selected });
  };

  return (
    <div className="space-y-6">
      {/* Conversation Parameters */}
      <section>
        <h3
          className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2"
          style={{ color: 'var(--ms-blue-2)' }}
        >
          <span style={{ color: 'var(--ms-blue)' }}>●</span> Conversation
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Users"
            value={inputs.conversation.users}
            onChange={(v) => updateConv('users', v)}
            min={1}
            tooltip="Total number of users"
          />
          <NumberInput
            label="Convos / user / day"
            value={inputs.conversation.conversationsPerUserPerDay}
            onChange={(v) => updateConv('conversationsPerUserPerDay', v)}
            min={1}
            tooltip="Average conversations per user per day"
          />
          <NumberInput
            label="Messages / convo"
            value={inputs.conversation.messagesPerConversation}
            onChange={(v) => updateConv('messagesPerConversation', v)}
            min={1}
            tooltip="Number of back-and-forth turns per conversation"
          />
          <NumberInput
            label="User msg (words)"
            value={inputs.conversation.avgUserMessageWords}
            onChange={(v) => updateConv('avgUserMessageWords', v)}
            min={1}
            tooltip="Average length of user message in words"
          />
          <NumberInput
            label="Response (words)"
            value={inputs.conversation.avgAssistantResponseWords}
            onChange={(v) => updateConv('avgAssistantResponseWords', v)}
            min={1}
            tooltip="Average length of assistant response in words"
          />
          <NumberInput
            label="System prompt (words)"
            value={inputs.conversation.systemPromptWords}
            onChange={(v) => updateConv('systemPromptWords', v)}
            min={0}
            tooltip="System prompt included with every request"
          />
        </div>
      </section>

      {/* RAG Parameters */}
      <section>
        <h3
          className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2"
          style={{ color: '#50e6a0' }}
        >
          <span style={{ color: '#00b294' }}>●</span> RAG Settings
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Docs retrieved"
            value={inputs.rag.documentsRetrieved}
            onChange={(v) => updateRag('documentsRetrieved', v)}
            min={1}
            tooltip="Number of document chunks retrieved per query"
          />
          <NumberInput
            label="Chunk size (words)"
            value={inputs.rag.avgChunkSizeWords}
            onChange={(v) => updateRag('avgChunkSizeWords', v)}
            min={1}
            tooltip="Average size of each retrieved document chunk"
          />
          <div className="col-span-2">
            <label
              className="text-xs font-medium block mb-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              Embedding model
            </label>
            <select
              value={inputs.rag.embeddingModel}
              onChange={(e) => updateRag('embeddingModel', e.target.value)}
              style={{
                background: 'var(--foundry-surface-2)',
                border: '1px solid var(--foundry-border)',
                color: 'var(--text-primary)',
                borderRadius: '4px',
              }}
              className="w-full px-3 py-1.5 text-sm focus:outline-none"
              onFocus={(e) => {
                e.currentTarget.style.border = '1px solid var(--ms-blue)';
                e.currentTarget.style.boxShadow = '0 0 0 1px var(--ms-blue), 0 0 6px rgba(0,120,212,0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = '1px solid var(--foundry-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {EMBEDDING_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Agentic RAG Parameters */}
      <section>
        <h3
          className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2"
          style={{ color: '#c4aeff' }}
        >
          <span style={{ color: 'var(--ms-purple)' }}>●</span> Agentic RAG
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Agent steps"
            value={inputs.agenticRag.avgAgentSteps}
            onChange={(v) => updateAgentic('avgAgentSteps', v)}
            min={1}
            tooltip="Average LLM calls per agentic loop"
          />
          <NumberInput
            label="Tool calls / step"
            value={inputs.agenticRag.avgToolCallsPerStep}
            onChange={(v) => updateAgentic('avgToolCallsPerStep', v)}
            min={0}
            step={0.5}
            tooltip="Average tool invocations per agent step"
          />
          <NumberInput
            label="Tool result (words)"
            value={inputs.agenticRag.toolResultSizeWords}
            onChange={(v) => updateAgentic('toolResultSizeWords', v)}
            min={0}
            tooltip="Average tokens returned by each tool call"
          />
          <NumberInput
            label="Reasoning overhead %"
            value={inputs.agenticRag.reasoningOverheadPercent}
            onChange={(v) => updateAgentic('reasoningOverheadPercent', v)}
            min={0}
            tooltip="Extra tokens for chain-of-thought reasoning"
          />
        </div>
      </section>

      {/* Model Selection */}
      <section>
        <h3
          className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2"
          style={{ color: '#ffd166' }}
        >
          <span style={{ color: '#f7b731' }}>●</span> Models
        </h3>
        <div className="space-y-1.5">
          {LLM_MODELS.map((model) => (
            <label
              key={model.id}
              className="flex items-center gap-2 text-sm cursor-pointer rounded px-2 py-1 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              }}
            >
              <input
                type="checkbox"
                checked={inputs.selectedModels.includes(model.id)}
                onChange={() => toggleModel(model.id)}
                style={{ accentColor: 'var(--ms-blue)' }}
                className="rounded"
              />
              <span>{model.name}</span>
              <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                {model.provider}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Azure PTU Parameters */}
      <section>
        <h3
          className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2"
          style={{ color: 'var(--ms-teal)' }}
        >
          <span style={{ color: 'var(--ms-teal)' }}>●</span> Azure PTU
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Active hours / day"
            value={inputs.ptu.activeHoursPerDay}
            onChange={(v) => updatePtu('activeHoursPerDay', v)}
            min={1}
            step={1}
            tooltip="Hours per day with active usage (affects required TPM)"
          />
          <NumberInput
            label="Peak utilization %"
            value={inputs.ptu.peakUtilizationPercent}
            onChange={(v) => updatePtu('peakUtilizationPercent', v)}
            min={1}
            step={5}
            tooltip="Peak usage as % of uniform distribution (lower = more spread out)"
          />
        </div>

        {inputs.ptu.models.map((model, i) => (
          <div
            key={model.id}
            className="mt-4 pt-3"
            style={{ borderTop: '1px solid var(--foundry-border)' }}
          >
            <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--ms-teal)' }}>
              {model.name}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="TPM per PTU"
                value={model.tpmPerPTU}
                onChange={(v) => updatePtuModel(i, 'tpmPerPTU', v)}
                min={1}
                step={100}
                tooltip="Tokens per minute provided by each PTU"
              />
              <NumberInput
                label="Hourly rate ($)"
                value={model.hourlyRate}
                onChange={(v) => updatePtuModel(i, 'hourlyRate', v)}
                min={0}
                step={0.01}
                tooltip="Cost per PTU per hour (no commitment)"
              />
              <NumberInput
                label="Committed rate ($)"
                value={model.monthlyCommitHourlyRate}
                onChange={(v) => updatePtuModel(i, 'monthlyCommitHourlyRate', v)}
                min={0}
                step={0.01}
                tooltip="Cost per PTU per hour (monthly commitment)"
              />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
