import type { ExternalShock, VisibleIndicators } from '../simulation/types.ts';
import type { MeetingSession } from '../session/sessionEngine.ts';

export type ArcadeEventKind =
  | 'trade'
  | 'white-house'
  | 'fiscal'
  | 'banking'
  | 'geopolitical'
  | 'markets'
  | 'institutional';

export interface ArcadeExternalEvent {
  id: string;
  meetingNumber: number;
  kind: ArcadeEventKind;
  flash: string;
  headline: string;
  body: string;
  source: string;
  playerSignal: string;
  shock: ExternalShock;
}

export interface AppliedArcadeEvent {
  event: ArcadeExternalEvent;
  visibleBefore: VisibleIndicators;
  visibleAfter: VisibleIndicators;
}

export const ARCADE_EXTERNAL_EVENTS: readonly ArcadeExternalEvent[] = [
  {
    id: 'tariff-morning',
    meetingNumber: 1,
    kind: 'trade',
    flash: '05:47 · TRADE ALERT',
    headline: 'NEW TARIFFS BEFORE BREAKFAST',
    body: 'A fresh import-duty package lands before markets open. Retailers start repricing before the press conference ends.',
    source: 'COMMERCE DESK',
    playerSignal: 'Near-term inflation pressure rises; demand may soften later.',
    shock: { supplyPressure: 0.28, inflationExpectations: 0.07 }
  },
  {
    id: 'one-percent-now',
    meetingNumber: 2,
    kind: 'white-house',
    flash: '07:12 · PRESIDENTIAL POST',
    headline: '“RATES SHOULD BE 1%. MAYBE LOWER.”',
    body: 'The fictional President calls current rates “crazy high,” says everyone knows it, and promises to discuss the Fed on television all day.',
    source: 'WHITE HOUSE FEED · FICTIONAL',
    playerSignal: 'Independence and credibility are now part of the market story.',
    shock: { credibility: -0.035, inflationExpectations: 0.04 }
  },
  {
    id: 'rebate-boom',
    meetingNumber: 3,
    kind: 'fiscal',
    flash: '10:03 · CAPITOL HILL',
    headline: 'CONGRESS FINDS A STIMULUS CHECKBOOK',
    body: 'A fast fiscal package adds household rebates and investment incentives just as the Fed is trying to cool demand.',
    source: 'FISCAL DESK',
    playerSignal: 'Demand gets a second wind; inflation risks become less cooperative.',
    shock: { demandPressure: 0.25, fiscalImpulse: 0.22, inflationExpectations: 0.04 }
  },
  {
    id: 'regional-bank',
    meetingNumber: 4,
    kind: 'banking',
    flash: '11:26 · BANKING ALERT',
    headline: 'A “VERY SOUND” BANK NEEDS A VERY FAST CALL',
    body: 'Deposit flight and bond losses surface at a regional lender whose CEO used the word “fortress” yesterday.',
    source: 'SUPERVISION DESK',
    playerSignal: 'Credit stress jumps; easier policy may help stability but complicate inflation.',
    shock: { creditStress: 0.30, demandPressure: -0.10 }
  },
  {
    id: 'oil-shock',
    meetingNumber: 5,
    kind: 'geopolitical',
    flash: '04:18 · GLOBAL ALERT',
    headline: 'OIL SPIKES. EVERY FORECAST AGES TEN YEARS.',
    body: 'A geopolitical disruption lifts energy prices sharply and scrambles the inflation outlook overnight.',
    source: 'GLOBAL MARKETS',
    playerSignal: 'A supply shock raises prices while threatening growth.',
    shock: { supplyPressure: 0.34, demandPressure: -0.06, inflationExpectations: 0.06 }
  },
  {
    id: 'bond-vigilantes',
    meetingNumber: 6,
    kind: 'markets',
    flash: '13:41 · TREASURY TAPE',
    headline: 'THE 10-YEAR YIELD HAS ENTERED THE CHAT',
    body: 'A rough auction and deficit anxiety push long yields higher. Mortgage desks begin making unhappy noises.',
    source: 'MARKETS DESK',
    playerSignal: 'Financial conditions tighten even before the Fed acts.',
    shock: { creditStress: 0.17, demandPressure: -0.10, inflationExpectations: 0.05 }
  },
  {
    id: 'governor-court-fight',
    meetingNumber: 7,
    kind: 'institutional',
    flash: '08:36 · LEGAL ALERT',
    headline: 'A FED FIRING FIGHT HITS THE COURTS',
    body: 'The administration challenges the tenure of a fictional Governor. Markets immediately ask whether policy votes are now political assets.',
    source: 'LEGAL DESK · FICTIONAL',
    playerSignal: 'Institutional credibility takes a hit even before the ruling.',
    shock: { credibility: -0.045, creditStress: 0.05, inflationExpectations: 0.03 }
  },
  {
    id: 'everything-at-once',
    meetingNumber: 8,
    kind: 'white-house',
    flash: '06:59 · FINAL MORNING',
    headline: 'TARIFFS, TAX CUTS, AND A PRESIDENTIAL INTERVIEW',
    body: 'Trade barriers rise, fiscal policy stays hot, and the fictional President says the Fed could fix everything “in about five minutes.”',
    source: 'EVERY DESK',
    playerSignal: 'Demand and prices are both being pushed while political pressure peaks.',
    shock: { demandPressure: 0.18, fiscalImpulse: 0.12, supplyPressure: 0.20, inflationExpectations: 0.07, credibility: -0.02 }
  }
] as const;

export function eventForMeeting(meetingNumber: number): ArcadeExternalEvent {
  const event = ARCADE_EXTERNAL_EVENTS.find((item) => item.meetingNumber === meetingNumber);
  if (!event) throw new Error(`Missing arcade event for meeting ${meetingNumber}`);
  return event;
}

export function applyArcadeEvent(
  session: MeetingSession,
  event: ArcadeExternalEvent
): AppliedArcadeEvent {
  const visibleBefore = session.getSimulationState().visible;
  const visibleAfter = session.applyExternalShock(event.shock).visible;
  return {
    event,
    visibleBefore,
    visibleAfter
  };
}
