import type { RawMemeNode } from '@/graph/TreeBuilder'

/**
 * A deterministic 2-level meme tree fixture for testing and development.
 * Represents the concept "consciousness" broken into 3 primary memes,
 * each with 2 sub-memes.
 */
export const FIXTURE_RAW: RawMemeNode = {
  id: 'consciousness',
  label: 'Consciousness',
  content: "The state of being aware of and able to think about one's own existence.",
  children: [
    {
      id: 'qualia',
      label: 'Qualia',
      content: 'The subjective, felt qualities of experience — redness, pain, joy.',
      children: [
        {
          id: 'qualia-hard',
          label: 'Hard Problem',
          content: 'Why does physical process give rise to subjective experience?',
          children: [],
        },
        {
          id: 'qualia-inverted',
          label: 'Inverted Spectrum',
          content: 'Could your red look like my blue, yet we both call it red?',
          children: [],
        },
      ],
    },
    {
      id: 'self-awareness',
      label: 'Self-Awareness',
      content: 'The capacity to recognise oneself as an individual distinct from environment.',
      children: [
        {
          id: 'mirror-test',
          label: 'Mirror Test',
          content: 'Animals that recognise themselves in mirrors show a form of self-awareness.',
          children: [],
        },
        {
          id: 'metacognition',
          label: 'Metacognition',
          content: "Thinking about one's own thinking — the mind examining itself.",
          children: [],
        },
      ],
    },
    {
      id: 'emergence',
      label: 'Emergence',
      content:
        'Consciousness as a property that arises from, but is not reducible to, neural activity.',
      children: [
        {
          id: 'iit',
          label: 'Integrated Information',
          content: "Tononi's IIT: consciousness correlates with integrated information (Φ).",
          children: [],
        },
        {
          id: 'global-workspace',
          label: 'Global Workspace',
          content: 'Baars: consciousness is information broadcast widely across the brain.',
          children: [],
        },
      ],
    },
  ],
}
