import { normalPlan } from '@/data/optimized-plan';
import { disruptedPlan } from '@/data/disrupted-plan';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function runMockOptimization() {
  await sleep(2000);
  return normalPlan;
}

export async function runMockReoptimization() {
  await sleep(1500);
  return disruptedPlan;
}

export const optimizationSteps = [
  'Reviewing task priorities',
  'Reviewing available work times',
  'Grouping suitable tasks',
  'Reviewing crews and equipment',
  'Reviewing the effect on trains',
  'Preparing the weekly plan',
];
