import { DEFAULT_CONFIG, DEFAULT_HIDDEN_STATE } from './defaults.ts';
import { SeededRng } from './rng.ts';
import type {
  HiddenEconomyState,
  PolicyAction,
  SimulationConfig,
  SimulationState,
  VisibleIndicators
} from './types.ts';

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const round = (value: number, digits = 2): number => Number(value.toFixed(digits));

const POLICY_WEIGHTS = [0.08, 0.17, 0.27, 0.28, 0.20] as const;

export interface CreateSimulationOptions {
  seed?: number;
  federalFundsRate?: number;
  hidden?: Partial<HiddenEconomyState>;
  config?: Partial<SimulationConfig>;
}

export class EconomicSimulation {
  private state: SimulationState;
  private readonly config: SimulationConfig;
  private rng: SeededRng;

  constructor(options: CreateSimulationOptions = {}, restoredState?: SimulationState) {
    this.config = { ...DEFAULT_CONFIG, ...options.config };

    if (restoredState) {
      this.state = structuredClone(restoredState);
      this.rng = new SeededRng(this.state.seed, this.state.rngState);
      return;
    }

    const seed = options.seed ?? 19870811;
    const hidden = { ...DEFAULT_HIDDEN_STATE, ...options.hidden };
    const federalFundsRate = options.federalFundsRate ?? 4.5;
    this.rng = new SeededRng(seed);
    const policyHistory = Array.from({ length: POLICY_WEIGHTS.length }, () => federalFundsRate);
    const provisional: SimulationState = {
      version: 1,
      seed,
      rngState: this.rng.getState(),
      period: 0,
      hidden,
      visible: {} as VisibleIndicators,
      policyHistory
    };
    this.state = provisional;
    this.state.visible = this.observe(false);
    this.state.rngState = this.rng.getState();
  }

  getState(): SimulationState {
    return structuredClone(this.state);
  }

  setPolicy(action: PolicyAction): SimulationState {
    const current = this.state.visible.federalFundsRate;
    const next = clamp(current + action / 100, 0, 12);
    this.state.visible.federalFundsRate = round(next);
    this.state.policyHistory[0] = round(next);
    return this.getState();
  }

  advance(): SimulationState {
    const h = this.state.hidden;
    const effectiveStance = this.effectivePolicyStance();
    const currentPolicyGap = this.state.visible.federalFundsRate - h.neutralRate;

    const financialConditions = clamp(
      0.58 * effectiveStance + 1.1 * h.creditStress - 0.18 * h.demandPressure,
      -2.5,
      4.5
    );

    const nextCreditStress = clamp(
      h.creditStress * 0.82 +
        Math.max(0, financialConditions) * h.financialFragility * this.config.fragilityStressMultiplier +
        Math.max(0, currentPolicyGap - 2.5) * h.financialFragility * 0.018,
      0,
      1.5
    );

    const targetDemand = h.fiscalImpulse + 0.18 * (h.productivityGrowth - 1.5) - 0.45 * nextCreditStress;
    const nextDemand = clamp(
      h.demandPressure +
        this.config.demandMeanReversion * (targetDemand - h.demandPressure) -
        this.config.policySensitivity * effectiveStance,
      -1.8,
      1.8
    );

    const nextLaborTightness = clamp(
      0.72 * h.laborTightness + 0.28 * nextDemand - 0.12 * nextCreditStress,
      -1.5,
      1.5
    );

    const nextSupplyPressure = clamp(h.supplyPressure * this.config.supplyDecay, -0.8, 1.8);

    const credibilityDrag = Math.max(0, 0.72 - h.credibility) * 0.12;
    const restrictiveCredibilitySupport = Math.max(0, effectiveStance) * Math.max(0, h.underlyingInflationGap) * 0.012;
    const accommodationPenalty = Math.max(0, h.underlyingInflationGap - 0.45) * Math.max(0, -currentPolicyGap) * 0.018;
    const nextCredibility = clamp(
      h.credibility + restrictiveCredibilitySupport - accommodationPenalty + 0.015 * (0.78 - h.credibility),
      0.2,
      1
    );

    const expectationsTarget =
      2 + 0.40 * Math.max(-0.5, h.underlyingInflationGap) + 1.05 * Math.max(0, 0.75 - nextCredibility);
    const nextExpectations = clamp(0.72 * h.inflationExpectations + 0.28 * expectationsTarget, 1.4, 5.8);

    const persistence = clamp(h.inflationPersistence, 0.25, 0.92);
    const nextInflationGap = clamp(
      persistence * h.underlyingInflationGap +
        0.20 * nextDemand +
        0.22 * nextSupplyPressure +
        0.16 * (nextExpectations - 2) +
        credibilityDrag -
        0.045 * Math.max(0, effectiveStance),
      -1.5,
      4.5
    );

    this.state.hidden = {
      ...h,
      demandPressure: nextDemand,
      supplyPressure: nextSupplyPressure,
      laborTightness: nextLaborTightness,
      creditStress: nextCreditStress,
      underlyingInflationGap: nextInflationGap,
      inflationExpectations: nextExpectations,
      credibility: nextCredibility
    };

    this.state.period += 1;
    this.state.policyHistory = [
      this.state.visible.federalFundsRate,
      ...this.state.policyHistory.slice(0, POLICY_WEIGHTS.length - 1)
    ];
    this.state.visible = this.observe(true);
    this.state.rngState = this.rng.getState();
    return this.getState();
  }

  serialize(): string {
    return JSON.stringify(this.getState());
  }

  static restore(serialized: string, config: Partial<SimulationConfig> = {}): EconomicSimulation {
    const state = JSON.parse(serialized) as SimulationState;
    if (state.version !== 1) throw new Error(`Unsupported save version: ${String(state.version)}`);
    return new EconomicSimulation({ config }, state);
  }

  private effectivePolicyStance(): number {
    const neutralRate = this.state.hidden.neutralRate;
    return this.state.policyHistory.reduce((sum, rate, index) => {
      const weight = POLICY_WEIGHTS[index] ?? 0;
      return sum + weight * (rate - neutralRate);
    }, 0);
  }

  private observe(withNoise: boolean): VisibleIndicators {
    const h = this.state.hidden;
    const noiseScale = withNoise ? this.config.observationNoise : 0;
    const n = (sd: number): number => this.rng.normal() * sd * noiseScale;
    const fundsRate = this.state.visible?.federalFundsRate ?? this.state.policyHistory[0] ?? 4.5;
    const effectiveStance = this.effectivePolicyStance();

    const coreInflation = clamp(2 + h.underlyingInflationGap + n(0.07), 0.2, 9);
    const headlineInflation = clamp(coreInflation + 0.58 * h.supplyPressure + n(0.11), -0.5, 11);
    const unemployment = clamp(4.35 - 0.78 * h.laborTightness + 0.72 * h.creditStress + n(0.06), 2.5, 10);
    const payrollGrowth = clamp(125 + 105 * h.demandPressure + 70 * h.laborTightness - 120 * h.creditStress + n(18), -450, 650);
    const wageGrowth = clamp(3.25 + 0.82 * h.laborTightness + 0.25 * h.underlyingInflationGap + n(0.08), 1.2, 7.5);
    const gdpGrowth = clamp(h.productivityGrowth + 0.9 * h.demandPressure - 0.75 * h.creditStress + n(0.14), -5, 7);
    const treasuryYield10y = clamp(
      h.neutralRate + 0.55 * (h.inflationExpectations - 2) + 0.32 * effectiveStance + 0.35 + n(0.07),
      0.2,
      10
    );
    const financialConditions = clamp(0.58 * effectiveStance + 1.1 * h.creditStress - 0.18 * h.demandPressure, -2.5, 4.5);
    const marketStress = clamp(0.08 + 0.58 * h.creditStress + 0.10 * Math.max(0, financialConditions) + n(0.025), 0, 1.5);

    return {
      federalFundsRate: round(fundsRate),
      headlineInflation: round(headlineInflation),
      coreInflation: round(coreInflation),
      unemployment: round(unemployment),
      payrollGrowth: round(payrollGrowth, 0),
      wageGrowth: round(wageGrowth),
      gdpGrowth: round(gdpGrowth),
      inflationExpectations: round(h.inflationExpectations),
      treasuryYield10y: round(treasuryYield10y),
      financialConditions: round(financialConditions),
      marketStress: round(marketStress),
      fedCredibility: round(h.credibility * 100, 0)
    };
  }
}
