# Game Design Notes

## Current playable question

Can conflicting visible evidence, competing interpretations, communication, and a rate decision create an understandable but non-obvious policy choice?

The normal Phase 2 prototype now hides the true economy. Hidden state remains available only through the `?debug=1` developer sandbox.

## Deliberately excluded

The current vertical slice does not implement the full committee-agent system, persuasion, formal FOMC voting, press-conference Q&A, political pressure, modular events, exploration, campaign progression, cutscenes, audio, or legacy scoring.

## Evaluation principle

Before adding content, verify that rate paths produce understandable trade-offs rather than one universally dominant move.

## Phase 1 timing decision

One economic simulation period maps to roughly one FOMC intermeeting interval (~6.5 weeks). This makes the eight-meeting campaign approximately one year long and lets policy effects become visible within a campaign without making them instantaneous. The direct policy pipeline peaks several meetings after a decision.

## Phase 2 single-meeting design

The prototype starts from a deliberately ambiguous economy: core inflation is around 3%, unemployment around 4.7%, payroll growth around 65k, and financial conditions are restrictive. The visible evidence therefore points in different directions.

The meeting flow is:

1. staff briefing;
2. three adviser interpretations;
3. one forward-guidance choice;
4. one policy-rate decision;
5. immediate market reaction;
6. one-intermeeting-interval consequence summary.

The communication choices are phrased naturally rather than labeled hawkish/neutral/dovish. Communication can move inflation expectations and credibility, while a direct contradiction between guidance and the policy move imposes an additional credibility cost.

The result screen explains observed consequences without rating the player's choice as good or bad. First-interval real-economy outcomes remain heavily lagged, while yields react immediately.

### Temporary simplification (superseded in Phase 3)

The original Phase 2 prototype used the median of three adviser recommendations as a temporary policy-expectation proxy. Phase 3 replaced this with the eight-member committee preference distribution. A true market expectations distribution is still deferred.

## Phase 3 committee mechanics

The player now sees eight preliminary committee preferences before choosing communication and policy. A member's preferred action is distinct from their final vote: members with a nearby preference may support a committee compromise depending on stubbornness, consensus tendency, confidence, and relationship with the Chair.

The player receives one persuasion attempt per meeting prototype. They choose a dissenting member and one argument focused on inflation credibility, employment insurance, or financial stability. Argument fit matters. Success can convert that member's vote but does not alter the member's preferred policy.

The Chair's own vote is included, making nine total votes in the current prototype. Dissent is descriptive rather than an automatic loss condition. Ordinary +/-25bp moves in the current cross-current scenario produce limited dissent, while extreme +/-50bp moves can deeply divide the committee.

Severe fragmentation produces a small credibility penalty; unanimity produces a small positive institutional signal. These effects are intentionally modest relative to communication and macroeconomic transmission.

## Two-meeting continuity prototype

The meeting loop can now advance once rather than resetting immediately. Meeting 2 starts from the exact post-Meeting-1 economy and committee state.

This creates three types of continuity:

1. **Economic continuity:** the previous rate move is in the lag pipeline and the next release tape has changed.
2. **Institutional continuity:** prior dissents and support are remembered, so a repeated dissenter becomes modestly less willing to compromise.
3. **Relationship continuity:** successful and failed persuasion changes the Chair relationship and the number of prior persuasion attempts is retained.

The two-meeting gate succeeded and has now been superseded by the capped session prototype below.

## Four-meeting session prototype

The playable loop can now continue for four meetings through a dedicated session layer. Four is deliberately long enough for policy lags and committee memory to begin interacting, but short enough to avoid prematurely declaring the complete campaign architecture finished.

Each completed meeting becomes an inspectable history record. Later staff briefings show compact previous-decision summaries, while the underlying session retains enough structured detail for deterministic restore and debugging.

The critical design rule remains that history is not a scorecard. A meeting record captures what the Chair chose, how the committee voted, what markets did immediately, and what visible releases followed. It does not retroactively label the choice correct or incorrect.

The current session has no endogenous events, revisions, press conference, political pressure, or legacy score. Those systems should be layered only after multi-meeting persistence proves stable.
