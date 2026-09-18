import type { CommitteeMemberDefinition, CommitteeState } from './types.ts';

export const COMMITTEE_MEMBERS: readonly CommitteeMemberDefinition[] = [
  {
    id: 'price',
    name: 'Ada Price',
    role: 'Governor · inflation-risk hawk',
    portraitGlyph: 'AP',
    policyBias: 0.05,
    inflationSensitivity: 1.20,
    employmentSensitivity: 0.50,
    financialStabilitySensitivity: 0.30,
    stubbornness: 0.78,
    consensusSeeking: 0.25,
    initialRelationshipWithChair: 0.55,
    communicationStyle: 'Precise, unsentimental, and suspicious of the phrase “transitory-ish.”'
  },
  {
    id: 'fields',
    name: 'Maya Fields',
    role: 'Governor · labor economist',
    portraitGlyph: 'MF',
    policyBias: -0.05,
    inflationSensitivity: 0.55,
    employmentSensitivity: 1.20,
    financialStabilitySensitivity: 0.30,
    stubbornness: 0.55,
    consensusSeeking: 0.55,
    initialRelationshipWithChair: 0.65,
    communicationStyle: 'Asks who is losing a job before asking what the median forecast says.'
  },
  {
    id: 'stone',
    name: 'Elias Stone',
    role: 'Governor · financial-stability specialist',
    portraitGlyph: 'ES',
    policyBias: 0.15,
    inflationSensitivity: 0.80,
    employmentSensitivity: 0.40,
    financialStabilitySensitivity: 1.00,
    stubbornness: 0.62,
    consensusSeeking: 0.45,
    initialRelationshipWithChair: 0.60,
    communicationStyle: 'Can turn any conversation into a discussion of leverage within ninety seconds.'
  },
  {
    id: 'reed',
    name: 'Nora Reed',
    role: 'Regional president · Main Street listener',
    portraitGlyph: 'NR',
    policyBias: -0.05,
    inflationSensitivity: 0.70,
    employmentSensitivity: 1.00,
    financialStabilitySensitivity: 0.40,
    stubbornness: 0.48,
    consensusSeeking: 0.60,
    initialRelationshipWithChair: 0.52,
    communicationStyle: 'Carries regional anecdotes in a binder thick enough to alter the yield curve.'
  },
  {
    id: 'quill',
    name: 'Theo Quill',
    role: 'Governor · data obsessive',
    portraitGlyph: 'TQ',
    policyBias: 0.20,
    inflationSensitivity: 1.00,
    employmentSensitivity: 0.50,
    financialStabilitySensitivity: 0.30,
    stubbornness: 0.58,
    consensusSeeking: 0.45,
    initialRelationshipWithChair: 0.60,
    communicationStyle: 'Has a preferred seasonal-adjustment method and will tell you about it.'
  },
  {
    id: 'harbor',
    name: 'June Harbor',
    role: 'Vice Chair · consensus builder',
    portraitGlyph: 'JH',
    policyBias: 0,
    inflationSensitivity: 0.75,
    employmentSensitivity: 0.75,
    financialStabilitySensitivity: 0.50,
    stubbornness: 0.25,
    consensusSeeking: 0.90,
    initialRelationshipWithChair: 0.75,
    communicationStyle: 'Can make three incompatible sentences sound like one committee statement.'
  },
  {
    id: 'vega',
    name: 'Martin Vega',
    role: 'Regional president · banking-system worrier',
    portraitGlyph: 'MV',
    policyBias: 0.10,
    inflationSensitivity: 0.70,
    employmentSensitivity: 0.50,
    financialStabilitySensitivity: 0.80,
    stubbornness: 0.50,
    consensusSeeking: 0.55,
    initialRelationshipWithChair: 0.58,
    communicationStyle: 'Reads bank call reports for recreation, which is why no one borrows his tablet.'
  },
  {
    id: 'vale',
    name: 'Serena Vale',
    role: 'Governor · swing voter',
    portraitGlyph: 'SV',
    policyBias: 0.05,
    inflationSensitivity: 1.00,
    employmentSensitivity: 0.70,
    financialStabilitySensitivity: 0.50,
    stubbornness: 0.42,
    consensusSeeking: 0.72,
    initialRelationshipWithChair: 0.62,
    communicationStyle: 'Likes optionality almost as much as reporters dislike hearing the word optionality.'
  }
] as const;

export function createInitialCommitteeState(): CommitteeState {
  return {
    members: COMMITTEE_MEMBERS.map((member) => ({
      id: member.id,
      relationshipWithChair: member.initialRelationshipWithChair
    }))
  };
}
