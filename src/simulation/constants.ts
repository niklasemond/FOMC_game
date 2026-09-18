/**
 * One simulation period represents roughly one scheduled FOMC intermeeting interval.
 * Eight periods therefore approximate one campaign year.
 */
export const SIMULATION_PERIOD_WEEKS = 6.5;

/**
 * Policy transmission is distributed across five intermeeting intervals.
 * The weights intentionally peak after several periods rather than on impact.
 */
export const POLICY_LAG_WEIGHTS = [0.08, 0.17, 0.27, 0.28, 0.20] as const;
