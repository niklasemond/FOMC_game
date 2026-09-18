import { EconomicSimulation } from '../simulation/engine.ts';
import type { PolicyAction } from '../simulation/types.ts';
import { getAdviserViews } from '../meeting/advisers.ts';
import { COMMUNICATION_CHOICES, PHASE_2_SCENARIO } from '../meeting/content.ts';
import { createStaffBriefing, resolvePrototypeMeeting } from '../meeting/meetingEngine.ts';
import type { CommunicationChoiceId, MeetingResult } from '../meeting/types.ts';
import { createInitialCommitteeState } from '../committee/members.ts';
import { evaluateCommittee, expectedCommitteeAction, tallyCommitteeVote } from '../committee/committeeEngine.ts';
import type {
  CommitteeMemberId,
  CommitteeState,
  PersuasionArgument
} from '../committee/types.ts';

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

const argumentLabel: Record<PersuasionArgument, string> = {
  inflation: 'Stress inflation credibility',
  employment: 'Stress employment insurance',
  stability: 'Stress financial-stability risk'
};

export function mountMeetingPrototype(initialSimulation?: EconomicSimulation): void {
  const root = document.querySelector<HTMLElement>('#debug-panel');
  if (!root) throw new Error('Missing #debug-panel');

  let simulation = initialSimulation ?? new EconomicSimulation(PHASE_2_SCENARIO);
  let committeeState: CommitteeState = createInitialCommitteeState();
  let stage: 'briefing' | 'advisers' | 'committee' | 'communication' | 'policy' | 'consensus' | 'result' = 'briefing';
  let communicationChoiceId: CommunicationChoiceId | null = null;
  let policyAction: PolicyAction | null = null;
  let persuasionTargetId: CommitteeMemberId | null = null;
  let persuasionArgument: PersuasionArgument | null = null;
  let result: MeetingResult | null = null;

  const reset = (): void => {
    simulation = new EconomicSimulation(PHASE_2_SCENARIO);
    committeeState = createInitialCommitteeState();
    stage = 'briefing';
    communicationChoiceId = null;
    policyAction = null;
    persuasionTargetId = null;
    persuasionArgument = null;
    result = null;
    render();
  };

  const renderBriefing = (): string => {
    const briefing = createStaffBriefing(simulation.getState());
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
      <div class="meeting-kicker">MEETING 1 · STAFF ADVICE</div>
      <h1 class="debug-title">Three people. One data set.</h1>
      <p class="meeting-copy">These are three early conversations: two voting members and one markets liaison. Their views are not the vote; the full committee comes next.</p>
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
      <button class="advance" data-next="committee">READ THE ROOM</button>
      <button class="text-button" data-back="briefing">← Back to briefing</button>
    `;
  };

  const renderCommittee = (): string => {
    const views = evaluateCommittee(simulation.getState(), committeeState);
    return `
      <div class="meeting-kicker">MEETING 1 · COMMITTEE ROOM</div>
      <h1 class="debug-title">Eight voters. Four different models.</h1>
      <p class="meeting-copy">These are preliminary policy preferences, not binding votes. Members may still support a committee compromise even when it is not their first choice.</p>
      <div class="committee-grid">
        ${views.map((view) => `
          <article class="committee-card">
            <div class="adviser-avatar">${view.portraitGlyph}</div>
            <div>
              <div class="adviser-name">${view.name}</div>
              <div class="adviser-role">${view.role}</div>
              <div class="committee-lean">Leans <strong>${recommendationLabel(view.preferredAction)}</strong> · ${Math.round(view.confidence * 100)}% confidence</div>
              <p>${view.rationale}</p>
            </div>
          </article>
        `).join('')}
      </div>
      <button class="advance" data-next="communication">DRAFT THE STATEMENT</button>
      <button class="text-button" data-back="advisers">← Back to advisers</button>
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
    <button class="text-button" data-back="committee">← Back to committee</button>
  `;

  const renderPolicy = (): string => {
    const choice = COMMUNICATION_CHOICES.find((item) => item.id === communicationChoiceId);
    const views = evaluateCommittee(simulation.getState(), committeeState);
    const marketCenter = expectedCommitteeAction(views);
    return `
      <div class="meeting-kicker">MEETING 1 · POLICY DECISION</div>
      <h1 class="debug-title">Set the federal funds rate</h1>
      <div class="selected-guidance"><strong>Your draft guidance:</strong><br>“${choice?.statement ?? ''}”</div>
      <p class="meeting-copy">The committee's preliminary preferences center near <strong>${recommendationLabel(marketCenter)}</strong>. Markets use the committee, not your staff advisers, as the policy-expectation proxy.</p>
      <div class="policy-grid">
        ${([-50, -25, 0, 25, 50] as PolicyAction[]).map((action) => `<button data-policy="${action}">${actionLabel(action)}</button>`).join('')}
      </div>
      <button class="text-button" data-back="communication">← Rewrite guidance</button>
    `;
  };

  const renderConsensus = (): string => {
    if (policyAction === null) return '';
    const views = evaluateCommittee(simulation.getState(), committeeState);
    const projection = tallyCommitteeVote(views, policyAction);
    const dissenters = projection.lines.filter((line) => !line.supportsChair);
    return `
      <div class="meeting-kicker">MEETING 1 · CONSENSUS</div>
      <h1 class="debug-title">Whip the vote — once.</h1>
      <p class="meeting-copy">Your proposal is <strong>${actionLabel(policyAction)}</strong>. Before any persuasion, the vote projects <strong>${projection.supportCount}-${projection.dissentCount}</strong>, including your own vote. You may make one targeted case; persuasion can change willingness to support a compromise, not a member's economic beliefs.</p>
      <div class="vote-list">
        ${projection.lines.map((line) => `
          <button class="vote-line ${line.supportsChair ? 'support' : 'dissent'}" ${line.supportsChair ? 'disabled' : `data-target="${line.memberId}"`}>
            <span>${line.memberName}</span>
            <strong>${line.supportsChair ? 'SUPPORT' : 'DISSENT'}</strong>
            <em>prefers ${recommendationLabel(line.preferredAction)}</em>
          </button>
        `).join('')}
      </div>
      ${dissenters.length === 0 ? '<div class="uncertainty-box">No persuasion is needed for this projection.</div>' : `
        <div class="selected-guidance"><strong>Target:</strong> ${persuasionTargetId ? views.find((view) => view.id === persuasionTargetId)?.name ?? 'None' : 'None selected'}</div>
        <div class="persuasion-grid">
          ${(Object.keys(argumentLabel) as PersuasionArgument[]).map((argument) => `<button data-argument="${argument}" ${persuasionTargetId ? '' : 'disabled'}>${argumentLabel[argument]}</button>`).join('')}
        </div>
        <div class="uncertainty-box"><strong>Selected case:</strong> ${persuasionArgument ? argumentLabel[persuasionArgument] : 'None. You can also skip persuasion.'}</div>
      `}
      <button class="advance" data-finalize>FINALIZE VOTE</button>
      <button class="text-button" data-back="policy">← Change policy proposal</button>
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
        <div><strong>Committee vote: ${result.committeeVote.supportCount}-${result.committeeVote.dissentCount}</strong> · ${result.committeeVote.fragmentation}</div>
        ${result.persuasionOutcome.attempted ? `<p>${result.persuasionOutcome.reason}</p>` : '<p>No persuasion attempt was used.</p>'}
        <div class="vote-result-grid">
          ${result.committeeVote.lines.map((line) => `<span>${line.memberName}</span><strong>${line.supportsChair ? 'AYE' : 'DISSENT'}${line.persuaded ? ' *' : ''}</strong>`).join('')}
        </div>
      </div>
      <div class="reaction-box">
        <div><strong>Market reaction</strong></div>
        <p>${result.marketReaction.summary}</p>
        <div class="mini-grid">
          <span>10Y yield move</span><strong>${result.marketReaction.treasuryYieldDeltaBp > 0 ? '+' : ''}${result.marketReaction.treasuryYieldDeltaBp}bp</strong>
          <span>Policy surprise</span><strong>${result.marketReaction.policySurpriseBp > 0 ? '+' : ''}${result.marketReaction.policySurpriseBp}bp</strong>
          <span>Inflation-expectations impulse</span><strong>${result.communicationExpectationsDeltaBp > 0 ? '+' : ''}${result.communicationExpectationsDeltaBp}bp</strong>
          <span>Communication credibility</span><strong>${result.communicationCredibilityDeltaPoints > 0 ? '+' : ''}${result.communicationCredibilityDeltaPoints.toFixed(1)}pt</strong>
          <span>Committee credibility</span><strong>${result.committeeCredibilityDeltaPoints > 0 ? '+' : ''}${result.committeeCredibilityDeltaPoints.toFixed(1)}pt</strong>
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
      <div class="explanation-list">${result.explanation.map((line) => `<p>▸ ${line}</p>`).join('')}</div>
      <div class="uncertainty-box"><strong>Important:</strong> dissent is not automatically failure. This screen reports committee cohesion and economic consequences without grading the policy philosophy.</div>
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
        : stage === 'committee'
          ? renderCommittee()
          : stage === 'communication'
            ? renderCommunication()
            : stage === 'policy'
              ? renderPolicy()
              : stage === 'consensus'
                ? renderConsensus()
                : renderResult();

    root.querySelectorAll<HTMLButtonElement>('[data-next]').forEach((button) => button.addEventListener('click', () => {
      stage = button.dataset.next as typeof stage;
      render();
    }));
    root.querySelectorAll<HTMLButtonElement>('[data-back]').forEach((button) => button.addEventListener('click', () => {
      stage = button.dataset.back as typeof stage;
      if (stage === 'policy') {
        persuasionTargetId = null;
        persuasionArgument = null;
      }
      render();
    }));
    root.querySelectorAll<HTMLButtonElement>('[data-communication]').forEach((button) => button.addEventListener('click', () => {
      communicationChoiceId = button.dataset.communication as CommunicationChoiceId;
      stage = 'policy';
      render();
    }));
    root.querySelectorAll<HTMLButtonElement>('[data-policy]').forEach((button) => button.addEventListener('click', () => {
      policyAction = Number(button.dataset.policy) as PolicyAction;
      persuasionTargetId = null;
      persuasionArgument = null;
      stage = 'consensus';
      render();
    }));
    root.querySelectorAll<HTMLButtonElement>('[data-target]').forEach((button) => button.addEventListener('click', () => {
      persuasionTargetId = button.dataset.target as CommitteeMemberId;
      persuasionArgument = null;
      render();
    }));
    root.querySelectorAll<HTMLButtonElement>('[data-argument]').forEach((button) => button.addEventListener('click', () => {
      persuasionArgument = button.dataset.argument as PersuasionArgument;
      render();
    }));
    root.querySelector<HTMLButtonElement>('[data-finalize]')?.addEventListener('click', () => {
      if (!communicationChoiceId || policyAction === null) return;
      result = resolvePrototypeMeeting(simulation, communicationChoiceId, policyAction, {
        committeeState,
        persuasionAttempt: persuasionTargetId && persuasionArgument
          ? { targetId: persuasionTargetId, argument: persuasionArgument }
          : undefined
      });
      committeeState = result.committeeState;
      stage = 'result';
      render();
    });
    root.querySelector<HTMLButtonElement>('[data-reset]')?.addEventListener('click', reset);
  };

  render();
}
