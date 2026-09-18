import type { EconomicSimulation } from '../simulation/engine.ts';
import { SIMULATION_PERIOD_WEEKS } from '../simulation/constants.ts';
import type { PolicyAction, SimulationState } from '../simulation/types.ts';

const fmt = (value: number, suffix = ''): string => `${value.toFixed(Number.isInteger(value) ? 0 : 2)}${suffix}`;

function visibleRows(state: SimulationState): string {
  const v = state.visible;
  const rows: Array<[string, string]> = [
    ['Period', String(state.period)],
    ['Fed funds', fmt(v.federalFundsRate, '%')],
    ['Headline CPI', fmt(v.headlineInflation, '%')],
    ['Core CPI', fmt(v.coreInflation, '%')],
    ['Unemployment', fmt(v.unemployment, '%')],
    ['Payrolls', `${fmt(v.payrollGrowth, 'k')}`],
    ['Wage growth', fmt(v.wageGrowth, '%')],
    ['GDP growth', fmt(v.gdpGrowth, '%')],
    ['Infl. expectations', fmt(v.inflationExpectations, '%')],
    ['10Y Treasury', fmt(v.treasuryYield10y, '%')],
    ['Fin. conditions', fmt(v.financialConditions)],
    ['Market stress', fmt(v.marketStress)],
    ['Fed credibility', fmt(v.fedCredibility, '/100')]
  ];
  return rows.map(([label, value]) => `<span>${label}</span><strong>${value}</strong>`).join('');
}


function historyRows(history: readonly SimulationState[]): string {
  return history
    .slice(-8)
    .map((state) => {
      const v = state.visible;
      return `<tr><td>${state.period}</td><td>${v.federalFundsRate.toFixed(2)}</td><td>${v.coreInflation.toFixed(2)}</td><td>${v.unemployment.toFixed(2)}</td><td>${v.gdpGrowth.toFixed(2)}</td><td>${v.financialConditions.toFixed(2)}</td></tr>`;
    })
    .join('');
}

function hiddenRows(state: SimulationState): string {
  const h = state.hidden;
  const rows: Array<[string, number]> = [
    ['Demand pressure', h.demandPressure],
    ['Supply pressure', h.supplyPressure],
    ['Inflation gap', h.underlyingInflationGap],
    ['Neutral rate', h.neutralRate],
    ['Labor tightness', h.laborTightness],
    ['Credit stress', h.creditStress],
    ['Fragility', h.financialFragility],
    ['Fiscal impulse', h.fiscalImpulse],
    ['Credibility', h.credibility]
  ];
  return rows.map(([label, value]) => `<span>${label}</span><strong>${value.toFixed(2)}</strong>`).join('');
}

export function mountDebugPanel(simulation: EconomicSimulation): void {
  const root = document.querySelector<HTMLElement>('#debug-panel');
  if (!root) throw new Error('Missing #debug-panel');

  let state = simulation.getState();
  const history: SimulationState[] = [state];

  const render = (): void => {
    root.innerHTML = `
      <h1 class="debug-title">Economic Sandbox / Seed ${state.seed}</h1>
      <div class="controls">
        <button data-action="-25">-25bp</button>
        <button data-action="0">HOLD</button>
        <button data-action="25">+25bp</button>
      </div>
      <button class="advance" data-advance>ADVANCE ONE PERIOD</button>
      <h2 class="debug-subtitle">Visible release tape</h2>
      <div class="grid">${visibleRows(state)}</div>
      <h2 class="debug-subtitle">Recent trajectory</h2>
      <div class="history-wrap"><table class="history-table"><thead><tr><th>P</th><th>Rate</th><th>Core</th><th>U</th><th>GDP</th><th>FCI</th></tr></thead><tbody>${historyRows(history)}</tbody></table></div>
      <h2 class="debug-subtitle">Developer-only hidden state</h2>
      <div class="grid hidden-grid">${hiddenRows(state)}</div>
      <p class="note">One period represents roughly one FOMC intermeeting interval (~${SIMULATION_PERIOD_WEEKS} weeks). Policy changes enter a five-period lag pipeline. Visible data include seeded measurement noise; the hidden state is exposed here only to validate Phase 1 behavior.</p>
    `;

    root.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = Number(button.dataset.action) as PolicyAction;
        state = simulation.setPolicy(action);
        render();
      });
    });

    root.querySelector<HTMLButtonElement>('[data-advance]')?.addEventListener('click', () => {
      state = simulation.advance();
      history.push(state);
      render();
    });
  };

  render();
}
