/**
 * Canonical seed data for Atlas insights (Part 1: Insights 1 - 4).
 */
const SEED_INSIGHTS_PART_1 = [
  {
    slug: 'the-cost-of-consensus-in-crisis',
    tag: 'Leadership',
    date: 'Published Q4 2023',
    readTime: '15 min read',
    breadcrumb: 'Archive / Leadership / Crisis Governance',
    title: 'The Cost of Consensus in Crisis',
    excerpt: 'Why collaborative decision-making models fail during critical path disruptions, and the case for authoritative intervention structures.',
    image: '/images/insight/1insight.png',
    intro: 'Why collaborative decision-making models fail during critical path disruptions, and the case for authoritative intervention structures.',
    status: 'published',
    author: 'Atlas Admin',
    order: 1,
    body: [
      {
        heading: 'The Paradox of Collaborative Paralysis',
        content: [
          {
            type: 'paragraph',
            text: 'In stable environments, consensus-building is a virtue. It fosters inclusion, mitigates extreme risks, and builds collective ownership over strategic direction. However, when an organization encounters an acute, existential disruption, the very mechanics of consensus can become a liability.',
          },
          {
            type: 'paragraph',
            text: 'Executive teams conditioned by peacetime governance models instinctively convene to deliberate. They seek alignment, request more data, and attempt to synthesize competing viewpoints into a unified response. In doing so, they can sacrifice the most critical asset in any crisis: time.',
          },
          {
            type: 'quote',
            quote: 'In a mission-critical failure, the search for consensus can become the final symptom of a collapsing governance structure.',
            attribution: 'LMCS Internal Analysis, 2023',
          },
          {
            type: 'paragraph',
            text: 'The dilution of accountability is another major casualty of consensus during a crisis. When decisions are made collectively, responsibility can become distributed so broadly that no individual feels fully accountable for the outcome.',
          },
          {
            type: 'image',
            src: '/images/insight/1insight.png',
            caption: 'Fig 1: A decentralized command environment exhibiting symptoms of informational overload and delayed decision-making.',
          },
        ],
      },
      {
        heading: 'Authoritative Intervention',
        content: [
          {
            type: 'paragraph',
            text: 'Overcoming collaborative paralysis requires a structural shift, not merely a cultural one. At LMCS, this shift can be understood as moving toward commanded clarity: a governance model where responsibility, authority, and execution are explicitly connected.',
          },
          {
            type: 'paragraph',
            text: 'The intervention structure may be led by a single accountable executive or a tightly constrained decision group. Information flows inward, decisions are made quickly, and directives flow outward with clear ownership.',
          },
          {
            type: 'quote',
            quote: 'The objective is not to eliminate collaboration. It is to prevent collaboration from becoming an excuse for delayed accountability.',
            attribution: 'LMCS Governance Review',
          },
        ],
      },
    ],
  },
  {
    slug: 'the-anatomy-of-silent-failure',
    tag: 'Project Drift',
    date: 'Oct 13, 2024',
    readTime: '10 min read',
    breadcrumb: 'Archive / Project Drift',
    title: 'The Anatomy of Silent Failure: Identifying Micro-Drift Before Macro-Collapse',
    excerpt: 'Traditional status reporting often masks the insidious accumulation of technical and operational debt. Our latest empirical study examines the leading indicators.',
    image: '/images/insight/2insight.png',
    intro: 'Traditional status reporting often masks the insidious accumulation of technical and operational debt. Our latest empirical study examines the leading indicators executives consistently miss.',
    status: 'published',
    author: 'Atlas Admin',
    order: 2,
    body: [
      {
        heading: 'Status Reports Hide the Slope, Not the Point',
        content: [
          {
            type: 'paragraph',
            text: 'A single status update is a snapshot; drift is a slope. Reviewed in isolation, a project can look green for months while the underlying trend line points toward failure.',
          },
          {
            type: 'paragraph',
            text: 'Schedule compression, deferred defects, quietly shifting scope, incomplete dependencies, and unresolved decisions often accumulate beneath apparently healthy reporting.',
          },
          {
            type: 'quote',
            quote: 'A project rarely fails at the moment the organization first discovers the problem. The failure usually began much earlier.',
            attribution: 'LMCS Project Drift Analysis',
          },
        ],
      },
      {
        heading: 'Recognizing Micro-Drift',
        content: [
          {
            type: 'paragraph',
            text: 'Micro-drift is rarely dramatic. It appears as small deviations that individually seem manageable but collectively change the condition of the project.',
          },
          {
            type: 'paragraph',
            text: 'The most effective assessment approach therefore looks beyond reported status and examines the evidence supporting that status: decisions, dependencies, readiness indicators, defects, milestones, and delivery artifacts.',
          },
          {
            type: 'image',
            src: '/images/insight/2insight.png',
            caption: 'Fig 1: Small deviations accumulating across multiple project dimensions.',
          },
        ],
      },
    ],
  },
  {
    slug: 'subjective-optimism-vs-objective-reality',
    tag: 'Delivery Confidence',
    date: 'Sep 26, 2024',
    readTime: '8 min read',
    breadcrumb: 'Archive / Delivery Confidence',
    title: 'Subjective Optimism vs. Objective Reality in Mega-Projects',
    excerpt: 'Why deeply experienced project directors often fall victim to optimism bias, and how to institute empirical delivery confidence.',
    image: '/images/insight/3insight.png',
    intro: 'Why deeply experienced project directors often fall victim to optimism bias, and how to institute empirical delivery confidence in its place.',
    status: 'published',
    author: 'Atlas Admin',
    order: 3,
    body: [
      {
        heading: 'Experience Is Not Immunity',
        content: [
          {
            type: 'paragraph',
            text: 'Seasoned leaders are not exempt from optimism bias. They are often better at constructing a plausible narrative around incomplete evidence.',
          },
          {
            type: 'quote',
            quote: 'Confidence becomes dangerous when it is disconnected from the evidence that should justify it.',
            attribution: 'LMCS Delivery Confidence Review',
          },
        ],
      },
      {
        heading: 'The Evidence Gap',
        content: [
          {
            type: 'paragraph',
            text: 'The difference between subjective optimism and objective confidence is the quality of evidence supporting the conclusion. A confident forecast should be traceable to measurable conditions, validated dependencies, and observable delivery artifacts.',
          },
          {
            type: 'image',
            src: '/images/insight/3insight.png',
            caption: 'Fig 1: The relationship between reported confidence and evidence-supported delivery condition.',
          },
        ],
      },
    ],
  },
  {
    slug: 'the-illusion-of-control',
    tag: 'Governance',
    date: 'Sep 15, 2024',
    readTime: '9 min read',
    breadcrumb: 'Archive / Governance',
    title: 'The Illusion of Control: Re-evaluating Steering Committees',
    excerpt: 'Governance structures designed for BAU operations are routinely misapplied to high-complexity transformations. Examining the failure modes.',
    image: '/images/insight/4insight.png',
    intro: 'Governance structures designed for business-as-usual operations are routinely misapplied to high-complexity transformations. We examine where steering committees quietly stop steering.',
    status: 'published',
    author: 'Atlas Admin',
    order: 4,
    body: [
      {
        heading: 'When Oversight Becomes Theatre',
        content: [
          {
            type: 'paragraph',
            text: 'A steering committee built for routine change can lack the cadence and authority that mission-critical delivery demands. The result is an illusion of control: meetings are held, minutes are filed, and risks are discussed, while the underlying condition continues to deteriorate.',
          },
          {
            type: 'paragraph',
            text: 'Governance only creates value when it changes decisions and outcomes. A committee that observes without intervening may provide visibility without control.',
          },
          {
            type: 'quote',
            quote: 'Governance is not the existence of oversight. Governance is the ability to act on what oversight reveals.',
            attribution: 'LMCS Governance Analysis',
          },
        ],
      },
      {
        heading: 'Authority Must Match Accountability',
        content: [
          {
            type: 'paragraph',
            text: 'Effective governance requires a clear relationship between decision rights and accountability. If leaders are held responsible for outcomes but lack authority over the decisions that shape those outcomes, governance becomes structurally weak.',
          },
          {
            type: 'image',
            src: '/images/insight/4insight.png',
            caption: 'Fig 1: Governance structures must connect oversight, authority, and accountability.',
          },
        ],
      },
    ],
  },
];

module.exports = { SEED_INSIGHTS_PART_1 };
