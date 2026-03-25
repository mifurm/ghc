import { useMemo } from 'react';
import type { CalculatorInputs, SolutionWithCosts, CostEstimate } from '../types';
import { calculateChat } from '../calculators/chatCalculator';
import { calculateRag } from '../calculators/ragCalculator';
import { calculateAgenticRag } from '../calculators/agenticRagCalculator';
import { calculatePTU } from '../calculators/ptuCalculator';
import { LLM_MODELS } from '../constants/models';

function computeCosts(
  dailyInput: number,
  dailyOutput: number,
  selectedModelIds: string[]
): CostEstimate[] {
  return selectedModelIds
    .map((modelId) => {
      const model = LLM_MODELS.find((m) => m.id === modelId);
      if (!model) return null;
      const dailyInputCost = (dailyInput / 1000) * model.inputPricePer1KTokens;
      const dailyOutputCost = (dailyOutput / 1000) * model.outputPricePer1KTokens;
      return {
        modelId: model.id,
        modelName: model.name,
        dailyInputCost,
        dailyOutputCost,
        dailyTotalCost: dailyInputCost + dailyOutputCost,
        monthlyCost: (dailyInputCost + dailyOutputCost) * 30,
      };
    })
    .filter((c): c is CostEstimate => c !== null);
}

export function useCalculator(inputs: CalculatorInputs): SolutionWithCosts[] {
  return useMemo(() => {
    const chatResult = calculateChat(inputs.conversation);
    const ragResult = calculateRag(inputs.conversation, inputs.rag);
    const agenticResult = calculateAgenticRag(
      inputs.conversation,
      inputs.rag,
      inputs.agenticRag
    );

    return [chatResult, ragResult, agenticResult].map((result) => {
      const costs = computeCosts(
        result.dailyInputTokens,
        result.dailyOutputTokens,
        inputs.selectedModels
      );
      const ptuModelIds = inputs.ptu.models.map((m) => m.payPerTokenModelId);
      const ptuCosts = computeCosts(result.dailyInputTokens, result.dailyOutputTokens, ptuModelIds);
      const ptuEstimates = calculatePTU(result, inputs.ptu, ptuCosts);
      return { result, costs, ptuEstimates };
    });
  }, [inputs]);
}
