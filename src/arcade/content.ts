export interface ArcadeBeat {
  id: string;
  label: string;
  headline: string;
  copy: string;
  pressure: string;
  staffWhisper: string;
}

export const ARCADE_BEATS: readonly ArcadeBeat[] = [
  {
    id: 'fog',
    label: 'MEETING 1',
    headline: 'THE DATA DISAGREE',
    copy: 'Inflation is sticky. Hiring is cooling. Everyone has a chart. None of the charts agree.',
    pressure: 'Markets want clarity before lunch.',
    staffWhisper: 'One weak payroll print is not a recession. One hot inflation print is not victory either.'
  },
  {
    id: 'president-tv',
    label: 'MEETING 2',
    headline: 'THE PRESIDENT IS ON TV',
    copy: 'The morning has produced three interviews, two all-caps posts, and one request for cheaper money by yesterday.',
    pressure: 'Political temperature: unnecessarily high.',
    staffWhisper: 'The dual mandate does not come with a mute button.'
  },
  {
    id: 'jobs-friday',
    label: 'MEETING 3',
    headline: 'JOBS FRIDAY',
    copy: 'Payrolls wobble. Unemployment inches higher. Cable television rediscovers the phrase “soft landing.”',
    pressure: 'Labor risks are getting harder to ignore.',
    staffWhisper: 'Policy works with lags. Unfortunately, television works instantly.'
  },
  {
    id: 'bank-phone',
    label: 'MEETING 4',
    headline: 'THE RED PHONE RINGS',
    copy: 'Funding stress is rising in institutions whose press releases continue to describe conditions as “solid.”',
    pressure: 'Financial stability wants a seat at the table.',
    staffWhisper: 'A rate move can calm one risk while worsening another.'
  },
  {
    id: 'cpi-loud',
    label: 'MEETING 5',
    headline: 'CPI, BUT LOUDER',
    copy: 'Inflation arrives with the subtlety of a cymbal crash. Bond traders begin typing in capital letters.',
    pressure: 'Credibility is now a live issue.',
    staffWhisper: 'The public notices prices. Markets notice whether you look surprised by prices.'
  },
  {
    id: 'tape-fight',
    label: 'MEETING 6',
    headline: 'FIGHT THE TAPE',
    copy: 'Stocks dislike your ambiguity. Bonds dislike your certainty. Everyone agrees you should have been clearer earlier.',
    pressure: 'Communication is becoming policy.',
    staffWhisper: 'The sentence after the rate decision may move markets almost as much as the decision.'
  },
  {
    id: 'white-house-static',
    label: 'MEETING 7',
    headline: 'WHITE HOUSE STATIC',
    copy: 'Growth is slowing, the political volume is rising, and someone has once again described the Fed as “very unfair.”',
    pressure: 'Independence is easy in textbooks.',
    staffWhisper: 'You cannot control the noise. You can control whether the noise controls you.'
  },
  {
    id: 'last-call',
    label: 'MEETING 8',
    headline: 'THE LAST CALL',
    copy: 'One meeting remains. Tomorrow, everyone will explain that today was obvious.',
    pressure: 'Your legacy is mostly lagged effects and badly timed screenshots.',
    staffWhisper: 'There is no clean win condition. There is only the economy you leave behind.'
  }
] as const;

export function presidentialReaction(policyAction: number): string {
  if (policyAction <= -50) return '“BIG CUT. Finally. Beautiful. Should have been 100. Everybody knows rates are too high.”';
  if (policyAction < 0) return '“Tiny cut. Very tiny. Better than nothing. I would have gone MUCH BIGGER. Everybody knows.”';
  if (policyAction === 0) return '“NO CUT. Can you believe it? Rates are WAY too high. Everybody knows. Very unfair.”';
  if (policyAction <= 25) return '“They RAISED rates. Terrible. Really terrible. Very unfair to American business.”';
  return '“FIFTY POINTS UP. A total disaster. Maybe the worst rate move ever. We need LOW rates.”';
}
