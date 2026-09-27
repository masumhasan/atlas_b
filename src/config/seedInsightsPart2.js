/**
 * Canonical seed data for Atlas insights (Part 2: Insights 5 - 8).
 */
const SEED_INSIGHTS_PART_2 = [
  {
    slug: 'the-psychology-of-subjective-optimism',
    tag: 'Forensic Analysis',
    date: 'Aug 30, 2024',
    readTime: '11 min read',
    breadcrumb: 'Archive / Forensic Analysis',
    title: 'The Psychology of Subjective Optimism',
    excerpt: 'An examination of how confirmation bias and subjective optimism infect executive dashboards, leading to systemic delivery failures in multi-year infrastructure rollouts.',
    image: '/images/insight/5insight.png',
    intro: 'An examination of how confirmation bias and subjective optimism infect executive dashboards, leading to systemic delivery failures in multi-year infrastructure rollouts.',
    status: 'published',
    author: 'Atlas Admin',
    order: 5,
    body: [
      {
        heading: 'How Optimism Enters the Dashboard',
        content: [
          {
            type: 'paragraph',
            text: 'Executive dashboards are designed to simplify complexity. That simplicity becomes a risk when important uncertainty is removed from the picture.',
          },
          {
            type: 'quote',
            quote: 'The dashboard can be accurate and still produce a misleading picture of project reality.',
            attribution: 'LMCS Forensic Analysis',
          },
        ],
      },
      {
        heading: 'Confirmation Bias in Delivery Reporting',
        content: [
          {
            type: 'paragraph',
            text: 'Confirmation bias can influence which metrics receive attention, how exceptions are explained, and which risks are considered temporary rather than structural.',
          },
          {
            type: 'image',
            src: '/images/insight/5insight.png',
            caption: 'Fig 1: The gap between dashboard narrative and underlying delivery evidence.',
          },
        ],
      },
    ],
  },
  {
    slug: 'architecting-the-immutable-baseline',
    tag: 'Governance',
    date: 'Aug 16, 2024',
    readTime: '12 min read',
    breadcrumb: 'Archive / Governance',
    title: 'Architecting the Immutable Baseline',
    excerpt: 'Defining the parameters for a scope baseline that resists political dilution and enforces accountability across siloed engineering teams.',
    image: '/images/insight/6insight.png',
    intro: 'Defining the parameters for a scope baseline that resists political dilution and enforces accountability across siloed engineering teams.',
    status: 'published',
    author: 'Atlas Admin',
    order: 6,
    body: [
      {
        heading: 'Why Baselines Drift',
        content: [
          {
            type: 'paragraph',
            text: 'A baseline is intended to establish the reference point against which delivery performance can be evaluated. In practice, baselines can gradually change as assumptions are revised, scope is informally adjusted, and exceptions become normalized.',
          },
          {
            type: 'quote',
            quote: 'If the baseline moves every time performance is questioned, it stops being a baseline.',
            attribution: 'LMCS Governance Review',
          },
        ],
      },
      {
        heading: 'Building an Immutable Reference',
        content: [
          {
            type: 'paragraph',
            text: 'An effective baseline should have clear ownership, explicit assumptions, controlled change mechanisms, and a documented rationale for material revisions.',
          },
          {
            type: 'image',
            src: '/images/insight/6insight.png',
            caption: 'Fig 1: A controlled baseline provides a stable reference for delivery assessment.',
          },
        ],
      },
    ],
  },
  {
    slug: 'the-vulnerable-transition',
    tag: 'Readiness',
    date: 'Jul 28, 2024',
    readTime: '9 min read',
    breadcrumb: 'Archive / Readiness',
    title: 'The Vulnerable Transition',
    excerpt: 'Navigating the critical juncture between project completion and full operational capability, mitigating risks during handover.',
    image: '/images/insight/1insight.png',
    intro: 'Navigating the critical juncture between project completion and full operational capability, mitigating risks during handover.',
    status: 'published',
    author: 'Atlas Admin',
    order: 7,
    body: [
      {
        heading: 'Completion Is Not Operational Readiness',
        content: [
          {
            type: 'paragraph',
            text: 'Projects often treat technical completion as the natural endpoint of delivery. Operational readiness, however, requires more than the completion of planned development work.',
          },
          {
            type: 'quote',
            quote: 'The final mile of delivery is often where technical completion meets operational reality.',
            attribution: 'LMCS Readiness Assessment',
          },
          {
            type: 'image',
            src: '/images/insight/1insight.png',
            caption: 'Fig 1: The transition from project completion to operational capability.',
          },
        ],
      },
    ],
  },
  {
    slug: 'identifying-micro-deviations',
    tag: 'Analysis',
    date: 'Jul 12, 2024',
    readTime: '7 min read',
    breadcrumb: 'Archive / Analysis',
    title: 'Identifying Micro-Deviations',
    excerpt: 'An examination of how imperceptible scope changes compound over time, leading to systemic project failure.',
    image: '/images/insight/2insight.png',
    intro: 'An examination of how imperceptible scope changes compound over time, leading to systemic project failure.',
    status: 'published',
    author: 'Atlas Admin',
    order: 8,
    body: [
      {
        heading: 'Small Changes Create Large Consequences',
        content: [
          {
            type: 'paragraph',
            text: 'Large project failures rarely originate from one dramatic decision. More commonly, a series of small deviations accumulates until the initiative is operating under conditions materially different from the original plan.',
          },
          {
            type: 'quote',
            quote: 'The significance of a deviation is not always visible when the deviation occurs.',
            attribution: 'LMCS Analysis',
          },
          {
            type: 'image',
            src: '/images/insight/2insight.png',
            caption: 'Fig 1: Individual micro-deviations can combine into material delivery drift.',
          },
        ],
      },
    ],
  },
];

module.exports = { SEED_INSIGHTS_PART_2 };
