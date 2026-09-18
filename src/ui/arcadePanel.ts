import type { PolicyAction } from '../simulation/types.ts';
import { COMMUNICATION_CHOICES } from '../meeting/content.ts';
import { evaluateCommittee, expectedCommitteeAction } from '../committee/committeeEngine.ts';
import { MeetingSession } from '../session/sessionEngine.ts';
import { ARCADE_BEATS, presidentialReaction } from '../arcade/content.ts';
import {
  applyArcadeEvent,
  eventForMeeting,
  type AppliedArcadeEvent
} from '../arcade/events.ts';

const actionLabel = (action: PolicyAction): string => {
  if (action > 0) return `+${action}bp`;
  if (action < 0) return `${action}bp`;
  return 'HOLD';
};

export function mountArcadePrototype(): void {
  const root = document.querySelector<HTMLElement>('#debug-panel');
  if (!root) throw new Error('Missing #debug-panel');

  let session = new MeetingSession({ maxMeetings: 8 });
  let stage: 'headline' | 'decision' | 'result' | 'final' = 'headline';
  let selectedPolicy: PolicyAction | null = null;
  let selectedCommunication = COMMUNICATION_CHOICES[1]!.id;
  let lastResult: ReturnType<MeetingSession['resolve']> | null = null;
  let appliedEvent: AppliedArcadeEvent | null = null;
  let appliedEventMeetingNumber = 0;

  const currentBeat = () => ARCADE_BEATS[Math.min(session.getCompletedMeetingCount(), ARCADE_BEATS.length - 1)]!;

  const ensureCurrentEvent = (): AppliedArcadeEvent => {
    const meetingNumber = session.getNextMeetingNumber();
    if (appliedEvent && appliedEventMeetingNumber === meetingNumber) return appliedEvent;
    const event = eventForMeeting(meetingNumber);
    appliedEvent = applyArcadeEvent(session, event);
    appliedEventMeetingNumber = meetingNumber;
    return appliedEvent;
  };

  const renderHeadline = (): string => {
    const beat = currentBeat();
    const eventImpact = ensureCurrentEvent();
    const event = eventImpact.event;
    const v = eventImpact.visibleAfter;
    return `
      <div class="arcade-kicker">${beat.label} · ~10 MINUTE MODE</div>
      <div class="arcade-flash">${event.flash}</div>
      <h1 class="arcade-headline">${event.headline}</h1>
      <p class="arcade-copy">${event.body}</p>
      <div class="arcade-source">${event.source}</div>
      <div class="arcade-tape">
        <span>CORE <strong>${v.coreInflation.toFixed(1)}%</strong></span>
        <span>UNEMP <strong>${v.unemployment.toFixed(1)}%</strong></span>
        <span>FUNDS <strong>${v.federalFundsRate.toFixed(2)}%</strong></span>
      </div>
      <div class="arcade-pressure">${event.playerSignal}</div>
      <div class="arcade-whisper">STAFF: “${beat.staffWhisper}”</div>
      <button class="advance" data-go-decision>MAKE THE CALL</button>
    `;
  };

  const renderDecision = (): string => {
    const views = evaluateCommittee(session.getSimulationState(), session.getCommitteeState());
    const center = expectedCommitteeAction(views);
    return `
      <div class="arcade-kicker">${currentBeat().label} · DECISION</div>
      <h1 class="arcade-headline">ONE RATE. ONE MESSAGE.</h1>
      <div class="arcade-room-temp">ROOM TEMPERATURE: <strong>${actionLabel(center)}</strong></div>

      <div class="arcade-section-label">RATE</div>
      <div class="arcade-policy-grid">
        ${([-50,-25,0,25,50] as PolicyAction[]).map((action) => `
          <button data-arcade-policy="${action}" class="${selectedPolicy === action ? 'selected' : ''}">${actionLabel(action)}</button>
        `).join('')}
      </div>

      <div class="arcade-section-label">MESSAGE</div>
      <div class="arcade-message-grid">
        ${COMMUNICATION_CHOICES.map((choice) => `
          <button data-arcade-message="${choice.id}" class="${selectedCommunication === choice.id ? 'selected' : ''}">
            <strong>${choice.label}</strong>
            <span>${choice.statement}</span>
          </button>
        `).join('')}
      </div>

      <button class="advance" data-arcade-finalize ${selectedPolicy === null ? 'disabled' : ''}>RELEASE THE STATEMENT</button>
      <button class="text-button" data-back-headline>← One more look</button>
    `;
  };

  const renderResult = (): string => {
    if (!lastResult) return '';
    const v = lastResult.postMeetingState.visible;
    const dissenter = lastResult.committeeVote.lines.find((line) => !line.supportsChair);
    return `
      <div class="arcade-kicker">MEETING ${lastResult.postMeetingState.period} · AFTERMATH</div>
      <h1 class="arcade-headline">${actionLabel(lastResult.policyAction)} · ${lastResult.committeeVote.supportCount}-${lastResult.committeeVote.dissentCount}</h1>
      <div class="arcade-market">${lastResult.marketReaction.summary}</div>
      <div class="arcade-reaction-card">
        <strong>PRESIDENTIAL POST · FICTIONAL</strong>
        <p>${presidentialReaction(lastResult.policyAction)}</p>
      </div>
      ${dissenter ? `
        <div class="arcade-reaction-card">
          <strong>ONE DISSENTER, BECAUSE THAT IS ENOUGH TEXT</strong>
          <p>${dissenter.memberName}: prefers ${actionLabel(dissenter.preferredAction)}.</p>
        </div>
      ` : ''}
      <div class="arcade-tape">
        <span>CORE <strong>${v.coreInflation.toFixed(1)}%</strong></span>
        <span>UNEMP <strong>${v.unemployment.toFixed(1)}%</strong></span>
        <span>10Y <strong>${v.treasuryYield10y.toFixed(2)}%</strong></span>
      </div>
      <button class="advance" data-next-beat>${session.isComplete() ? 'SEE THE DAMAGE' : 'NEXT CRISIS →'}</button>
    `;
  };

  const renderFinal = (): string => {
    const v = session.getSimulationState().visible;
    const history = session.getHistory();
    return `
      <div class="arcade-kicker">END OF YEAR · FIRST ARCADE PROTOTYPE</div>
      <h1 class="arcade-headline">YOU SURVIVED THE CALENDAR.</h1>
      <p class="arcade-copy">Eight meetings. ${history.reduce((sum, item) => sum + item.committeeVote.dissentCount, 0)} recorded dissents. Several television segments. No clean victory screen.</p>
      <div class="arcade-tape">
        <span>CORE <strong>${v.coreInflation.toFixed(1)}%</strong></span>
        <span>UNEMP <strong>${v.unemployment.toFixed(1)}%</strong></span>
        <span>CRED <strong>${v.fedCredibility.toFixed(0)}</strong></span>
      </div>
      <div class="arcade-history">
        ${history.map((record) => `<span>M${record.meetingNumber}: ${actionLabel(record.policyAction)} · ${record.committeeVote.supportCount}-${record.committeeVote.dissentCount}</span>`).join('')}
      </div>
      <button class="advance" data-restart-arcade>PLAY AGAIN</button>
      <a class="text-link" href="?classic=1">Open classic simulation-heavy version →</a>
    `;
  };

  const render = (): void => {
    root.className = 'meeting-panel arcade-panel';
    root.innerHTML =
      stage === 'headline' ? renderHeadline() :
      stage === 'decision' ? renderDecision() :
      stage === 'result' ? renderResult() :
      renderFinal();

    root.querySelector<HTMLButtonElement>('[data-go-decision]')?.addEventListener('click', () => {
      stage = 'decision';
      render();
    });
    root.querySelector<HTMLButtonElement>('[data-back-headline]')?.addEventListener('click', () => {
      stage = 'headline';
      render();
    });
    root.querySelectorAll<HTMLButtonElement>('[data-arcade-policy]').forEach((button) => {
      button.addEventListener('click', () => {
        selectedPolicy = Number(button.dataset.arcadePolicy) as PolicyAction;
        render();
      });
    });
    root.querySelectorAll<HTMLButtonElement>('[data-arcade-message]').forEach((button) => {
      button.addEventListener('click', () => {
        selectedCommunication = button.dataset.arcadeMessage as typeof selectedCommunication;
        render();
      });
    });
    root.querySelector<HTMLButtonElement>('[data-arcade-finalize]')?.addEventListener('click', () => {
      if (selectedPolicy === null) return;
      lastResult = session.resolve({
        communicationChoiceId: selectedCommunication,
        policyAction: selectedPolicy
      });
      stage = 'result';
      render();
    });
    root.querySelector<HTMLButtonElement>('[data-next-beat]')?.addEventListener('click', () => {
      if (session.isComplete()) {
        stage = 'final';
      } else {
        selectedPolicy = null;
        selectedCommunication = COMMUNICATION_CHOICES[1]!.id;
        lastResult = null;
        appliedEvent = null;
        stage = 'headline';
      }
      render();
    });
    root.querySelector<HTMLButtonElement>('[data-restart-arcade]')?.addEventListener('click', () => {
      session = new MeetingSession({ maxMeetings: 8 });
      selectedPolicy = null;
      selectedCommunication = COMMUNICATION_CHOICES[1]!.id;
      lastResult = null;
      appliedEvent = null;
      appliedEventMeetingNumber = 0;
      stage = 'headline';
      render();
    });
  };

  render();
}
