import type { SolutionResult, PTUParams, PTUEstimate, PTUModelConfig, CostEstimate } from '../types';

const HOURS_PER_MONTH = 730;

export function calculatePTU(
  result: SolutionResult,
  ptuParams: PTUParams,
  payPerTokenCosts: CostEstimate[]
): PTUEstimate[] {
  const { activeHoursPerDay, peakUtilizationPercent, models: ptuModels } = ptuParams;

  if (activeHoursPerDay <= 0) {
    return [];
  }

  // Distribute daily tokens across active hours, then find peak TPM
  const tokensPerActiveMinute = result.dailyTotalTokens / (activeHoursPerDay * 60);
  // Apply peak utilization: if usage is 80% of uniform, the peak is lower
  const peakTPM = tokensPerActiveMinute * (peakUtilizationPercent / 100);

  return ptuModels.map((ptuModel: PTUModelConfig) => {
    const requiredPTUs = Math.max(1, Math.ceil(peakTPM / ptuModel.tpmPerPTU));

    // PTU costs (PTUs are reserved 24/7 for the month)
    const monthlyPTUCostHourly = requiredPTUs * ptuModel.hourlyRate * HOURS_PER_MONTH;
    const monthlyPTUCostCommitted = requiredPTUs * ptuModel.monthlyCommitHourlyRate * HOURS_PER_MONTH;

    // Find the equivalent pay-per-token monthly cost
    const paygoMatch = payPerTokenCosts.find((c) => c.modelId === ptuModel.payPerTokenModelId);
    const monthlyPayPerTokenCost = paygoMatch ? paygoMatch.monthlyCost : 0;

    // Breakeven: at what utilization % does PTU committed cost = pay-per-token cost?
    // PTU cost is fixed. Pay-per-token cost scales linearly with utilization.
    // At 100% utilization, paygo = monthlyPayPerTokenCost.
    // breakeven = (monthlyPTUCostCommitted / monthlyPayPerTokenCost) * 100
    const breakevenUtilization =
      monthlyPayPerTokenCost > 0
        ? Math.round((monthlyPTUCostCommitted / monthlyPayPerTokenCost) * 100)
        : 0;

    const recommendation: 'ptu' | 'paygo' =
      monthlyPTUCostCommitted < monthlyPayPerTokenCost ? 'ptu' : 'paygo';

    const savingsPerMonth = Math.abs(monthlyPayPerTokenCost - monthlyPTUCostCommitted);

    return {
      modelId: ptuModel.id,
      modelName: ptuModel.name,
      requiredTPM: Math.round(peakTPM),
      requiredPTUs,
      monthlyPTUCostHourly: +monthlyPTUCostHourly.toFixed(2),
      monthlyPTUCostCommitted: +monthlyPTUCostCommitted.toFixed(2),
      monthlyPayPerTokenCost: +monthlyPayPerTokenCost.toFixed(2),
      breakevenUtilization,
      recommendation,
      savingsPerMonth: +savingsPerMonth.toFixed(2),
    };
  });
}
