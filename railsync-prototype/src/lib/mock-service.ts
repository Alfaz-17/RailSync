import { normalPlan } from '@/data/optimized-plan';
import { disruptedPlan } from '@/data/disrupted-plan';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function runMockOptimization() {
  await sleep(2500);
  return normalPlan;
}

export async function runMockReoptimization() {
  await sleep(2000);
  return disruptedPlan;
}

export const optimizationSteps = [
  'Analyzing maintenance tasks',
  'Checking candidate block windows',
  'Validating compatibility',
  'Checking resource availability',
  'Evaluating traffic impact',
  'Generating recommendation',
];

export const reoptimizationSteps = [
  'Checking updated availability',
  'Preserving planner locks',
  'Validating constraints',
  'Evaluating alternatives',
  'Generating revised recommendation',
];
