import { describe, expect, it } from 'vitest';
import { EconomicSimulation } from '../src/simulation/engine.ts';

function run(sim: EconomicSimulation, periods: number): EconomicSimulation {
  for (let i = 0; i < periods; i += 1) sim.advance();
  return sim;
}

describe('economic simulation', () => {
  it('is deterministic for the same seed and actions', () => {
    const a = new EconomicSimulation({ seed: 42 });
    const b = new EconomicSimulation({ seed: 42 });
    for (const action of [25, 0, -25, 25, 25] as const) {
      a.setPolicy(action);
      b.setPolicy(action);
      a.advance();
      b.advance();
    }
    expect(a.getState()).toEqual(b.getState());
  });

  it('survives save/restore without breaking determinism', () => {
    const a = new EconomicSimulation({ seed: 7 });
    a.setPolicy(25);
    run(a, 3);
    const b = EconomicSimulation.restore(a.serialize());
    a.setPolicy(-25);
    b.setPolicy(-25);
    a.advance();
    b.advance();
    expect(b.getState()).toEqual(a.getState());
  });

  it('persistent inflation responds more to sustained restrictive policy than to an easier path', () => {
    const setup = {
      seed: 11,
      federalFundsRate: 4.0,
      hidden: {
        demandPressure: 0.85,
        supplyPressure: 0.2,
        underlyingInflationGap: 1.8,
        inflationPersistence: 0.78,
        neutralRate: 3.0,
        laborTightness: 0.8
      }
    };
    const restrictive = new EconomicSimulation(setup);
    const easier = new EconomicSimulation(setup);
    restrictive.setPolicy(50);
    restrictive.setPolicy(50);
    easier.setPolicy(-50);
    run(restrictive, 10);
    run(easier, 10);
    expect(restrictive.getState().hidden.underlyingInflationGap)
      .toBeLessThan(easier.getState().hidden.underlyingInflationGap);
    expect(restrictive.getState().hidden.demandPressure)
      .toBeLessThan(easier.getState().hidden.demandPressure);
  });

  it('a supply shock fades but aggressive tightening creates a weaker labor outcome', () => {
    const setup = {
      seed: 22,
      federalFundsRate: 3.5,
      hidden: {
        supplyPressure: 1.4,
        demandPressure: 0.05,
        underlyingInflationGap: 1.2,
        neutralRate: 3.0,
        laborTightness: 0.05
      }
    };
    const hike = new EconomicSimulation(setup);
    const hold = new EconomicSimulation(setup);
    hike.setPolicy(50);
    hike.setPolicy(50);
    run(hike, 8);
    run(hold, 8);
    expect(hike.getState().hidden.supplyPressure).toBeLessThan(0.4);
    expect(hold.getState().hidden.supplyPressure).toBeLessThan(0.4);
    expect(hike.getState().hidden.laborTightness).toBeLessThan(hold.getState().hidden.laborTightness);
  });

  it('easing supports a recessionary economy with a lag', () => {
    const setup = {
      seed: 33,
      federalFundsRate: 4.5,
      hidden: {
        demandPressure: -0.85,
        laborTightness: -0.75,
        creditStress: 0.25,
        neutralRate: 3.0,
        underlyingInflationGap: 0.05
      }
    };
    const ease = new EconomicSimulation(setup);
    const hold = new EconomicSimulation(setup);
    ease.setPolicy(-50);
    ease.setPolicy(-50);
    run(ease, 9);
    run(hold, 9);
    expect(ease.getState().hidden.demandPressure).toBeGreaterThan(hold.getState().hidden.demandPressure);
    expect(ease.getState().hidden.laborTightness).toBeGreaterThan(hold.getState().hidden.laborTightness);
  });

  it('fragility turns very restrictive conditions into more credit stress', () => {
    const setup = {
      seed: 44,
      federalFundsRate: 5.0,
      hidden: {
        neutralRate: 2.5,
        financialFragility: 0.95,
        creditStress: 0.3,
        demandPressure: 0.1
      }
    };
    const hike = new EconomicSimulation(setup);
    const hold = new EconomicSimulation(setup);
    hike.setPolicy(50);
    hike.setPolicy(50);
    run(hike, 6);
    run(hold, 6);
    expect(hike.getState().hidden.creditStress).toBeGreaterThan(hold.getState().hidden.creditStress);
  });

  it('low credibility raises expectations and leaves inflation harder to normalize', () => {
    const base = {
      seed: 55,
      federalFundsRate: 4.5,
      hidden: {
        demandPressure: 0.25,
        supplyPressure: 0.1,
        underlyingInflationGap: 1.0,
        neutralRate: 3.0,
        inflationExpectations: 2.5
      }
    };
    const low = new EconomicSimulation({ ...base, hidden: { ...base.hidden, credibility: 0.38 } });
    const high = new EconomicSimulation({ ...base, hidden: { ...base.hidden, credibility: 0.9 } });
    run(low, 8);
    run(high, 8);
    expect(low.getState().hidden.inflationExpectations).toBeGreaterThan(high.getState().hidden.inflationExpectations);
    expect(low.getState().hidden.underlyingInflationGap).toBeGreaterThan(high.getState().hidden.underlyingInflationGap);
  });

  it('stays within explicit safety bounds across seeded stress runs', () => {
    for (let seed = 1; seed <= 80; seed += 1) {
      const sim = new EconomicSimulation({
        seed,
        hidden: {
          demandPressure: ((seed % 7) - 3) / 2,
          supplyPressure: (seed % 5) / 2,
          financialFragility: (seed % 10) / 10,
          credibility: 0.25 + (seed % 8) / 11
        }
      });
      for (let t = 0; t < 24; t += 1) {
        const action = ([-50, -25, 0, 25, 50] as const)[(seed + t) % 5] ?? 0;
        sim.setPolicy(action);
        const state = sim.advance();
        for (const value of Object.values(state.visible)) expect(Number.isFinite(value)).toBe(true);
        expect(state.hidden.demandPressure).toBeGreaterThanOrEqual(-1.8);
        expect(state.hidden.demandPressure).toBeLessThanOrEqual(1.8);
        expect(state.hidden.underlyingInflationGap).toBeGreaterThanOrEqual(-1.5);
        expect(state.hidden.underlyingInflationGap).toBeLessThanOrEqual(4.5);
        expect(state.hidden.creditStress).toBeGreaterThanOrEqual(0);
        expect(state.hidden.creditStress).toBeLessThanOrEqual(1.5);
      }
    }
  });
});
