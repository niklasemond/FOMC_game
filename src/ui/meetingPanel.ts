import { EconomicSimulation } from '../simulation/engine.ts';
import type { PolicyAction } from '../simulation/types.ts';
import { getAdviserViews } from '../meeting/advisers.ts';
import { COMMUNICATION_CHOICES, PHASE_2_SCENARIO } from '../meeting/content.ts';
import { createStaffBriefing, resolvePrototypeMeeting } from '../meeting/meetingEngine.ts';
import type { CommunicationChoiceId, MeetingResult } from '../meeting/types.ts';

const actionLabel = (action: PolicyAction): string => {
  if (action === 50) return '+50bp';
  if (action === 25) return '+25bp';
  if (action === -25) return '-25bp';
  if (action === -50) return '-50bp';
  return 'HOLD';
};

const recommendationLabel = (action: PolicyAction): string => {
  if (action > 0) return `raise ${action}bp`;
  if (action < 0) return `cut ${Math.abs(action)}bp`;
  return 'hold';
};

export function mountMeetingPrototype(initialSimulation?: EconomicSimulation): void {
  const root = document.querySelector<HTMLElement>('#debug-panel');
  if (!root) throw new Error('Missing #debug-panel');

  let simulation = initialSimulation ?? new EconomicSimulation(PHASE_2_SCENARIO);
  let stage: 'briefing' | 'advisers' | 'communication' | 'policy' | 'result' = 'briefing';
  let communicationChoiceId: CommunicationChoiceId | null = null;
  let result: MeetingResult | null = null;

  const reset = (): void => {
    simulation = new EconomicSimulation(PHASE_2_SCENARIO);
    stage = 'briefing';
    communicationChoiceId = null;
    result = null;
    render();
  };

  const renderBriefing = (): string => {
    const state = simulation.getState();
    const briefing = createStaffBriefing(state);
    return `
      <div class="meeting-kicker">MEETING 1 · STAFF BRIEFING</div>
      <h1 class="debug-title">Crosscurrents</h1>
      <p class="meeting-copy">Inflation is still too high. Hiring is losing momentum. Financial conditions are already restrictive. The staff sees no clean answer.</p>
      <div class="briefing-grid">
        ${briefing.map((item) => `
          <article class="briefing-item">
            <div class="briefing-label">${item.label}</div>
            <div class="briefing-value">${item.value}</div>
            <div class="briefing-note">${item.interpretation}</div>
          </article>
        `).join('')}
      </div>
      <div class="uncertainty-box"><strong>Staff caveat:</strong> recent payroll data have been unusually noisy. One weak release may not persist, so the staff is reluctant to over-read it.</div>
      <button class="advance" data-next="advisers">READ ADVISER NOTES</button>
    `;
  };

  const renderAdvisers = (): string => {
    const views = getAdviserViews(simulation.getState());
    return `
      <div class="meeting-kicker">MEETING 1 · BEFORE THE VOTE</div>
      <h1 class="debug-title">Three people. One data set.</h1>
      <p class="meeting-copy">Their recommendations are generated from the releases you can see. None of them has access to the hidden “true economy.”</p>
      <div class="adviser-list">
        ${views.map((view) => `
          <article class="adviser-card">
            <div class="adviser-avatar">${view.portraitGlyph}</div>
            <div>
              <div class="adviser-name">${view.name}</div>
              <div class="adviser-role">${view.role}</div>
              <div class="adviser-headline">${view.headline}</div>
              <p>${view.rationale}</p>
              <div class="confidence">Confidence ${Math.round(view.confidence * 100)}%</div>
            </div>
          </article>
        `).join('')}
      </div>
      <button class="advance" data-next="communication">DRAFT THE STATEMENT</button>
      <button class="text-button" data-back="briefing">← Back to briefing</button>
    `;
  };

  const renderCommunication = (): string => `
    <div class="meeting-kicker">MEETING 1 · FORWARD GUIDANCE</div>
    <h1 class="debug-title">What do you want markets to hear?</h1>
    <p class="meeting-copy">This wording moves expectations before the next data release. The labels do not tell you which choice is safer.</p>
    <div class="choice-list">
      ${COMMUNICATION_CHOICES.map((choice) => `
        <button class="choice-card" data-communication="${choice.id}">
          <strong>${choice.label}</strong>
          <span>“${choice.statement}”</span>
          <em>${choice.tradeoffHint}</em>
        </button>
      `).join('')}
    </div>
    <button class="text-button" data-back="advisers">← Back to advisers</button>
  `;

  const renderPolicy = (): string => {
    const choice = COMMUNICATION_CHOICES.find((item) => item.id === communicationChoiceId);
    const views = getAdviserViews(simulation.getState());
    const sorted = views.map((view) => view.preferredAction).sort((a, b) => a - b);
    const median = sorted[1] ?? 0;
    return `
      <div class="meeting-kicker">MEETING 1 · POLICY DECISION</div>
      <h1 class="debug-title">Set the federal funds rate</h1>
      <div class="selected-guidance"><strong>Your draft guidance:</strong><br>“${choice?.statement ?? ''}”</div>
      <p class="meeting-copy">The three adviser recommendations center on <strong>${recommendationLabel(median)}</strong>. For this prototype, that median is also the market-expectation proxy; markets react to both the decision and your guidance.</p>
      <div class="policy-grid">
        ${([-50, -25, 0, 25, 50] as PolicyAction[]).map((action) => `<button data-policy="${action}">${actionLabel(action)}</button>`).join('')}
      </div>
      <button class="text-button" data-back="communication">← Rewrite guidance</button>
    `;
  };

  const renderResult = (): string => {
    if (!result) return '';
    const before = result.preMeetingState.visible;
    const after = result.postMeetingState.visible;
    return `
      <div class="meeting-kicker">MEETING 1 · AFTERMATH</div>
      <h1 class="debug-title">The decision is out.</h1>
      <div class="result-banner">
        <strong>${actionLabel(result.policyAction)}</strong>
        <span>${result.communicationChoice.label}</span>
      </div>
      <div class="reaction-box">
        <div><strong>Market reaction</strong></div>
        <p>${result.marketReaction.summary}</p>
        <div class="mini-grid">
          <span>10Y yield move</span><strong>${result.marketReaction.treasuryYieldDeltaBp > 0 ? '+' : ''}${result.marketReaction.treasuryYieldDeltaBp}bp</strong>
          <span>Policy surprise</span><strong>${result.marketReaction.policySurpriseBp > 0 ? '+' : ''}${result.marketReaction.policySurpriseBp}bp</strong>
          <span>Inflation-expectations impulse</span><strong>${result.communicationExpectationsDeltaBp > 0 ? '+' : ''}${result.communicationExpectationsDeltaBp}bp</strong>
          <span>Credibility impulse</span><strong>${result.credibilityDeltaPoints > 0 ? '+' : ''}${result.credibilityDeltaPoints.toFixed(1)}pt</strong>
          <span>Likely adviser support</span><strong>${result.likelySupport}/3</strong>
        </div>
      </div>
      <h2 class="debug-subtitle">One intermeeting interval later</h2>
      <div class="comparison-table">
        <div></div><strong>Before</strong><strong>After</strong>
        <span>Core inflation</span><span>${before.coreInflation.toFixed(2)}%</span><span>${after.coreInflation.toFixed(2)}%</span>
        <span>Unemployment</span><span>${before.unemployment.toFixed(2)}%</span><span>${after.unemployment.toFixed(2)}%</span>
        <span>Payrolls</span><span>${before.payrollGrowth.toFixed(0)}k</span><span>${after.payrollGrowth.toFixed(0)}k</span>
        <span>GDP growth</span><span>${before.gdpGrowth.toFixed(2)}%</span><span>${after.gdpGrowth.toFixed(2)}%</span>
        <span>10Y Treasury</span><span>${before.treasuryYield10y.toFixed(2)}%</span><span>${after.treasuryYield10y.toFixed(2)}%</span>
      </div>
      <div class="explanation-list">
        ${result.explanation.map((line) => `<p>▸ ${line}</p>`).join('')}
      </div>
      <div class="uncertainty-box"><strong>Important:</strong> this screen explains what happened over one interval; it does not claim your decision was optimal. Monetary-policy effects are still working through the pipeline.</div>
      <button class="advance" data-reset>REPLAY THIS MEETING</button>
      <a class="text-link" href="?debug=1">Open developer sandbox →</a>
    `;
  };

  const render = (): void => {
    root.classList.add('meeting-panel');
    root.innerHTML = stage === 'briefing'
      ? renderBriefing()
      : stage === 'advisers'
        ? renderAdvisers()
        : stage === 'communication'
          ? renderCommunication()
          : stage === 'policy'
            ? renderPolicy()
            : renderResult();

    root.querySelectorAll<HTMLButtonElement>('[data-next]').forEach((button) => {
      button.addEventListener('click', () => {
        stage = button.dataset.next as typeof stage;
        render();
      });
    });
    root.querySelectorAll<HTMLButtonElement>('[data-back]').forEach((button) => {
      button.addEventListener('click', () => {
        stage = button.dataset.back as typeof stage;
        render();
      });
    });
    root.querySelectorAll<HTMLButtonElement>('[data-communication]').forEach((button) => {
      button.addEventListener('click', () => {
        communicationChoiceId = button.dataset.communication as CommunicationChoiceId;
        stage = 'policy';
        render();
      });
    });
    root.querySelectorAll<HTMLButtonElement>('[data-policy]').forEach((button) => {
      button.addEventListener('click', () => {
        if (!communicationChoiceId) return;
        const policyAction = Number(button.dataset.policy) as PolicyAction;
        result = resolvePrototypeMeeting(simulation, communicationChoiceId, policyAction);
        stage = 'result';
        render();
      });
    });
    root.querySelector<HTMLButtonElement>('[data-reset]')?.addEventListener('click', reset);
  };

  render();
}
