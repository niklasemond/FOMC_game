import type { PolicyAction, SimulationState } from '../simulation/types.ts';
import { COMMITTEE_MEMBERS } from './members.ts';
import type {
  CommitteeMemberDefinition,
  CommitteeMemberId,
  CommitteeMemberView,
  CommitteeState,
  CommitteeVote,
  CommitteeVoteLine,
  PersuasionArgument,
  PersuasionAttempt,
  PersuasionOutcome
} from './types.ts';

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const round = (value: number, digits = 2): number => Number(value.toFixed(digits));

function actionFromScore(score: number): PolicyAction {
  if (score >= 0.80) return 50;
  if (score >= 0.20) return 25;
  if (score <= -0.80) return -50;
  if (score <= -0.20) return -25;
  return 0;
}

function actionPhrase(action: PolicyAction): string {
  if (action === 50) return 'raise 50bp';
  if (action === 25) return 'raise 25bp';
  if (action === -25) return 'cut 25bp';
  if (action === -50) return 'cut 50bp';
  return 'hold';
}

function committeeSignals(state: SimulationState): {
  inflation: number;
  employment: number;
  stability: number;
} {
  const v = state.visible;
  return {
    inflation:
      0.75 * (v.coreInflation - 2.5) +
      0.50 * (v.inflationExpectations - 2.3) +
      0.25 * (v.wageGrowth - 3.5),
    employment:
      -0.65 * (v.unemployment - 4.2) +
      0.40 * ((v.payrollGrowth - 120) / 200) +
      0.15 * (v.gdpGrowth - 1.5),
    stability:
      -0.45 * Math.max(0, v.financialConditions - 0.7) -
      0.60 * Math.max(0, v.marketStress - 0.2)
  };
}

function relationshipFor(state: CommitteeState, id: CommitteeMemberId): number {
  return state.members.find((member) => member.id === id)?.relationshipWithChair ?? 0.5;
}

function confidenceFromScore(score: number): number {
  return round(clamp(0.50 + Math.abs(score) * 0.30, 0.50, 0.92));
}

function rationaleFor(member: CommitteeMemberDefinition, state: SimulationState, action: PolicyAction): string {
  const v = state.visible;
  const dominant = [
    ['inflation', member.inflationSensitivity],
    ['employment', member.employmentSensitivity],
    ['financial stability', member.financialStabilitySensitivity]
  ] as const;
  const focus = [...dominant].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'incoming data';
  return `${member.name} leans to ${actionPhrase(action)}. Their model puts the most weight on ${focus}; they see core inflation at ${v.coreInflation.toFixed(1)}%, unemployment at ${v.unemployment.toFixed(1)}%, and financial conditions at ${v.financialConditions.toFixed(2)}.`;
}

export function evaluateCommittee(state: SimulationState, committeeState: CommitteeState): CommitteeMemberView[] {
  const signals = committeeSignals(state);

  return COMMITTEE_MEMBERS.map((member) => {
    const score =
      member.policyBias +
      member.inflationSensitivity * signals.inflation +
      member.employmentSensitivity * signals.employment +
      member.financialStabilitySensitivity * signals.stability;
    const preferredAction = actionFromScore(score);
    const confidence = confidenceFromScore(score);

    return {
      id: member.id,
      name: member.name,
      role: member.role,
      portraitGlyph: member.portraitGlyph,
      preferredAction,
      score: round(score, 3),
      confidence,
      uncertainty: round(1 - confidence),
      relationshipWithChair: relationshipFor(committeeState, member.id),
      stubbornness: member.stubbornness,
      consensusSeeking: member.consensusSeeking,
      inflationSensitivity: member.inflationSensitivity,
      employmentSensitivity: member.employmentSensitivity,
      financialStabilitySensitivity: member.financialStabilitySensitivity,
      rationale: rationaleFor(member, state, preferredAction)
    };
  });
}

export function expectedCommitteeAction(views: readonly CommitteeMemberView[]): PolicyAction {
  if (views.length === 0) return 0;
  const average = views.reduce((sum, view) => sum + view.preferredAction, 0) / views.length;
  const actions: readonly PolicyAction[] = [-50, -25, 0, 25, 50];
  return actions.reduce((best, action) =>
    Math.abs(action - average) < Math.abs(best - average) ? action : best, 0 as PolicyAction);
}

function compromiseWillingness(view: CommitteeMemberView): number {
  return clamp(
    0.45 * view.consensusSeeking +
      0.30 * view.relationshipWithChair +
      0.25 * (1 - view.stubbornness) +
      0.15 * (1 - view.confidence),
    0,
    1
  );
}

export function wouldSupportPolicy(view: CommitteeMemberView, policyAction: PolicyAction): boolean {
  const distance = Math.abs(view.preferredAction - policyAction);
  if (distance === 0) return true;

  const willingness = compromiseWillingness(view);
  if (distance === 25) return willingness >= 0.52;
  if (distance === 50) return willingness >= 0.82 && view.confidence < 0.62;
  return false;
}

function argumentFit(view: CommitteeMemberView, argument: PersuasionArgument): number {
  const sensitivities = {
    inflation: view.inflationSensitivity,
    employment: view.employmentSensitivity,
    stability: view.financialStabilitySensitivity
  };
  const maximum = Math.max(...Object.values(sensitivities));
  return maximum === 0 ? 0 : sensitivities[argument] / maximum;
}

export function attemptPersuasion(
  views: readonly CommitteeMemberView[],
  committeeState: CommitteeState,
  policyAction: PolicyAction,
  attempt?: PersuasionAttempt
): { committeeState: CommitteeState; outcome: PersuasionOutcome } {
  if (!attempt) {
    return {
      committeeState: structuredClone(committeeState),
      outcome: {
        attempted: false,
        targetId: null,
        targetName: null,
        argument: null,
        success: false,
        relationshipDelta: 0,
        reason: 'No persuasion attempt was made.'
      }
    };
  }

  const view = views.find((member) => member.id === attempt.targetId);
  if (!view) throw new Error(`Unknown committee member: ${attempt.targetId}`);

  if (wouldSupportPolicy(view, policyAction)) {
    return {
      committeeState: structuredClone(committeeState),
      outcome: {
        attempted: true,
        targetId: view.id,
        targetName: view.name,
        argument: attempt.argument,
        success: false,
        relationshipDelta: 0,
        reason: `${view.name} was already prepared to support the Chair's proposal.`
      }
    };
  }

  const distance = Math.abs(view.preferredAction - policyAction);
  if (distance > 50) {
    return {
      committeeState: structuredClone(committeeState),
      outcome: {
        attempted: true,
        targetId: view.id,
        targetName: view.name,
        argument: attempt.argument,
        success: false,
        relationshipDelta: -0.01,
        reason: `${view.name}'s preferred policy is too far from the proposal for one conversation to bridge.`
      }
    };
  }

  const fit = argumentFit(view, attempt.argument);
  const persuasionPower =
    0.38 * fit +
    0.30 * view.relationshipWithChair +
    0.20 * view.consensusSeeking +
    0.12 * (1 - view.stubbornness);
  const resistance =
    0.34 +
    0.18 * view.confidence +
    0.12 * Math.max(0, distance / 25 - 1) +
    0.18 * view.stubbornness;
  const success = persuasionPower >= resistance;
  const relationshipDelta = success ? 0.03 : -0.02;

  const nextState = structuredClone(committeeState);
  const targetState = nextState.members.find((member) => member.id === view.id);
  if (targetState) {
    targetState.relationshipWithChair = round(clamp(targetState.relationshipWithChair + relationshipDelta, 0, 1));
  }

  return {
    committeeState: nextState,
    outcome: {
      attempted: true,
      targetId: view.id,
      targetName: view.name,
      argument: attempt.argument,
      success,
      relationshipDelta,
      reason: success
        ? `${view.name} still prefers ${actionPhrase(view.preferredAction)}, but agrees to support the Chair after the argument addresses their main concern.`
        : `${view.name} is unconvinced. The argument did not outweigh their confidence in ${actionPhrase(view.preferredAction)}.`
    }
  };
}

export function tallyCommitteeVote(
  views: readonly CommitteeMemberView[],
  policyAction: PolicyAction,
  persuasion?: PersuasionOutcome
): CommitteeVote {
  const lines: CommitteeVoteLine[] = views.map((view) => {
    const baselineSupport = wouldSupportPolicy(view, policyAction);
    const persuaded = Boolean(
      persuasion?.attempted &&
      persuasion.success &&
      persuasion.targetId === view.id &&
      !baselineSupport
    );
    const supportsChair = baselineSupport || persuaded;
    return {
      memberId: view.id,
      memberName: view.name,
      preferredAction: view.preferredAction,
      supportsChair,
      persuaded,
      reason: persuaded
        ? 'Supports after persuasion despite preferring a different policy.'
        : supportsChair
          ? view.preferredAction === policyAction
            ? 'Policy matches preferred action.'
            : 'Supports the committee compromise.'
          : `Dissents in favor of ${actionPhrase(view.preferredAction)}.`
    };
  });

  const npcSupport = lines.filter((line) => line.supportsChair).length;
  const supportCount = npcSupport + 1; // The player/Chair votes for the chosen action.
  const totalVotes = lines.length + 1;
  const dissentCount = totalVotes - supportCount;
  const fragmentation: CommitteeVote['fragmentation'] = dissentCount === 0
    ? 'unanimous'
    : dissentCount <= 2
      ? 'minor dissent'
      : dissentCount <= 4
        ? 'divided'
        : 'deeply divided';

  return {
    policyAction,
    supportCount,
    dissentCount,
    totalVotes,
    lines,
    fragmentation
  };
}

export function committeeCredibilityImpulse(vote: CommitteeVote): number {
  if (vote.dissentCount === 0) return 0.006;
  if (vote.dissentCount <= 2) return 0;
  if (vote.dissentCount <= 4) return -0.004;
  return -0.012;
}
