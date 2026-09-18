import assert from 'node:assert/strict';
import { EconomicSimulation } from '../src/simulation/engine.ts';

function run(sim: EconomicSimulation, periods: number): EconomicSimulation {
  for (let i = 0; i < periods; i += 1) sim.advance();
  return sim;
}

function check(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

check('determinism', () => {
  const a = new EconomicSimulation({ seed: 42 });
  const b = new EconomicSimulation({ seed: 42 });
  for (const action of [25, 0, -25, 25, 25] as const) {
    a.setPolicy(action); b.setPolicy(action); a.advance(); b.advance();
  }
  assert.deepEqual(a.getState(), b.getState());
});

check('save/restore determinism', () => {
  const a = new EconomicSimulation({ seed: 7 });
  a.setPolicy(25); run(a, 3);
  const b = EconomicSimulation.restore(a.serialize());
  a.setPolicy(-25); b.setPolicy(-25); a.advance(); b.advance();
  assert.deepEqual(a.getState(), b.getState());
});

check('persistent inflation policy separation', () => {
  const setup = { seed: 11, federalFundsRate: 4.0, hidden: { demandPressure: 0.85, supplyPressure: 0.2, underlyingInflationGap: 1.8, inflationPersistence: 0.78, neutralRate: 3.0, laborTightness: 0.8 } };
  const restrictive = new EconomicSimulation(setup);
  const easier = new EconomicSimulation(setup);
  restrictive.setPolicy(50); restrictive.setPolicy(50); easier.setPolicy(-50);
  run(restrictive, 10); run(easier, 10);
  assert(restrictive.getState().hidden.underlyingInflationGap < easier.getState().hidden.underlyingInflationGap);
  assert(restrictive.getState().hidden.demandPressure < easier.getState().hidden.demandPressure);
});

check('supply shock tradeoff', () => {
  const setup = { seed: 22, federalFundsRate: 3.5, hidden: { supplyPressure: 1.4, demandPressure: 0.05, underlyingInflationGap: 1.2, neutralRate: 3.0, laborTightness: 0.05 } };
  const hike = new EconomicSimulation(setup);
  const hold = new EconomicSimulation(setup);
  hike.setPolicy(50); hike.setPolicy(50); run(hike, 8); run(hold, 8);
  assert(hike.getState().hidden.supplyPressure < 0.4);
  assert(hold.getState().hidden.supplyPressure < 0.4);
  assert(hike.getState().hidden.laborTightness < hold.getState().hidden.laborTightness);
});

check('recession easing lag', () => {
  const setup = { seed: 33, federalFundsRate: 4.5, hidden: { demandPressure: -0.85, laborTightness: -0.75, creditStress: 0.25, neutralRate: 3.0, underlyingInflationGap: 0.05 } };
  const ease = new EconomicSimulation(setup);
  const hold = new EconomicSimulation(setup);
  ease.setPolicy(-50); ease.setPolicy(-50); run(ease, 9); run(hold, 9);
  assert(ease.getState().hidden.demandPressure > hold.getState().hidden.demandPressure);
  assert(ease.getState().hidden.laborTightness > hold.getState().hidden.laborTightness);
});

check('financial fragility stress', () => {
  const setup = { seed: 44, federalFundsRate: 5.0, hidden: { neutralRate: 2.5, financialFragility: 0.95, creditStress: 0.3, demandPressure: 0.1 } };
  const hike = new EconomicSimulation(setup);
  const hold = new EconomicSimulation(setup);
  hike.setPolicy(50); hike.setPolicy(50); run(hike, 6); run(hold, 6);
  assert(hike.getState().hidden.creditStress > hold.getState().hidden.creditStress);
});

check('credibility channel', () => {
  const base = { seed: 55, federalFundsRate: 4.5, hidden: { demandPressure: 0.25, supplyPressure: 0.1, underlyingInflationGap: 1.0, neutralRate: 3.0, inflationExpectations: 2.5 } };
  const low = new EconomicSimulation({ ...base, hidden: { ...base.hidden, credibility: 0.38 } });
  const high = new EconomicSimulation({ ...base, hidden: { ...base.hidden, credibility: 0.9 } });
  run(low, 8); run(high, 8);
  assert(low.getState().hidden.inflationExpectations > high.getState().hidden.inflationExpectations);
  assert(low.getState().hidden.underlyingInflationGap > high.getState().hidden.underlyingInflationGap);
});

check('80-seed 24-period bounded stress run', () => {
  let boundHits = 0;
  for (let seed = 1; seed <= 80; seed += 1) {
    const sim = new EconomicSimulation({ seed, hidden: { demandPressure: ((seed % 7) - 3) / 2, supplyPressure: (seed % 5) / 2, financialFragility: (seed % 10) / 10, credibility: 0.25 + (seed % 8) / 11 } });
    for (let t = 0; t < 24; t += 1) {
      const action = ([-50, -25, 0, 25, 50] as const)[(seed + t) % 5] ?? 0;
      sim.setPolicy(action);
      const state = sim.advance();
      for (const value of Object.values(state.visible)) assert(Number.isFinite(value));
      assert(state.hidden.demandPressure >= -1.8 && state.hidden.demandPressure <= 1.8);
      assert(state.hidden.underlyingInflationGap >= -1.5 && state.hidden.underlyingInflationGap <= 4.5);
      assert(state.hidden.creditStress >= 0 && state.hidden.creditStress <= 1.5);
      if (Math.abs(state.hidden.demandPressure) === 1.8 || state.hidden.underlyingInflationGap === 4.5 || state.hidden.underlyingInflationGap === -1.5 || state.hidden.creditStress === 1.5) boundHits += 1;
    }
  }
  console.log(`INFO stress-bound-hits=${boundHits}`);
});

console.log('All executable Phase 1 smoke checks passed.');
