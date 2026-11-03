// The measurement backbone for the pilot: the author's Leadership Behaviour
// Assessment (LBA v2) domains and subdomains, by name only. No item text from
// the assessment is in this repository (CLAUDE.md). The Northbound branch for
// each subdomain is carried for the remake (CONCEPT.md section 8).
//
// The subdomain-to-domain mapping below is the agent's reading of the LBA
// standard, which lists subdomains by module and value but not by domain. The
// author should confirm or correct it; nothing else changes if he does.

export const DOMAINS = {
  SA: { label: 'Self-Awareness', short: 'SA' },
  SM: { label: 'Self-Management', short: 'SM' },
  SOC: { label: 'Social Awareness', short: 'SOC' },
  RM: { label: 'Relationship Management', short: 'RM' },
};

export const SUBDOMAINS = {
  'Emotional Awareness': { domain: 'SA', branch: 'Decision Quality' },
  'Impulse Control': { domain: 'SM', branch: 'Execution Discipline' },
  'Basic Empathy': { domain: 'SOC', branch: 'Engagement & Ownership' },
  'Respect & Professionalism': { domain: 'RM', branch: 'Behavioral Norms' },
  'Openness to Improvement': { domain: 'SM', branch: 'Learning Systems' },
  'Constructive Influence': { domain: 'RM', branch: 'Influence & Accountability' },
  'Peer Conflict Prevention': { domain: 'SOC', branch: 'Cross-Functional Communication' },
  'Tone-Setting': { domain: 'SM', branch: 'Values in Action' },
  'Early Coaching & Guidance': { domain: 'RM', branch: 'People Development' },
  'Accountability Management': { domain: 'RM', branch: 'Influence & Accountability' },
  'Recurring Conflict Resolution': { domain: 'RM', branch: 'Feedback Loops' },
  'Cross-Functional Awareness': { domain: 'SOC', branch: 'Cross-Functional Communication' },
  'Culture & Organizational Influence': { domain: 'RM', branch: 'Role Clarity' },
};

// Supervisor-tier weights, from the LBA standard's tier table.
export const WEIGHTS = { SA: 0.15, SM: 0.15, SOC: 0.3, RM: 0.4 };

export const BANDS = [
  { min: 21, label: 'Exceptional' },
  { min: 17, label: 'Strong' },
  { min: 12, label: 'Solid' },
  { min: 8, label: 'Development area' },
  { min: 0, label: 'Development priority' },
];
