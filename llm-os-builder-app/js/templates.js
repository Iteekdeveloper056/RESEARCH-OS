// ================================
// INDUSTRY TEMPLATES — Browse + apply
// ================================

const INDUSTRY_TEMPLATES = [
  {
    id: "coach",
    name: "Coach / Consultant",
    icon: "🎯",
    description: "Coaches, consultants, service-based experts",
    trueNameTemplate: `# [OPERATOR_NAME] — True Name
**Business:** [BUSINESS_NAME]
**Niche:** [SPECIFIC_COACHING_FOCUS]

## Voice
- Calm, capable, results-focused
- Not preachy, not guru
- Practical over theoretical

## Banned Phrases
- "Life-changing transformation"
- "Guaranteed results"
- "Make $X in 30 days"
- Generic motivational clichés

## Required Elements
- Specific outcomes (with context)
- Action steps in every piece
- Honest about limitations

## Compliance
- NO income guarantees
- Real testimonials only
- Clear terms + boundaries

## Content Patterns
- Hook → Problem → Insight → Action
- Personal story → Lesson → Application
- Question → Answer → Next step`
  },

  {
    id: "ecommerce",
    name: "E-Commerce",
    icon: "🛒",
    description: "Product brands, online stores",
    trueNameTemplate: `# [OPERATOR_NAME] — True Name
**Business:** [BUSINESS_NAME]
**Niche:** [WHAT_THEY_SELL]

## Voice
- Confident, friendly, product-focused
- Benefits-driven
- Not pushy, not sleazy

## Banned Phrases
- "Miracle cure"
- "Limited time only" (unless actually limited)
- Fake urgency
- Exaggerated before/after

## Required Elements
- Honest product description
- Clear pricing
- Real customer photos (when available)
- Shipping/returns info

## Compliance
- No health claims without evidence
- Honest about limitations
- Refund policy clear

## Content Patterns
- Product → Features → Benefits → Use case
- Problem → Solution → Customer result
- Behind-the-scenes → Craft story`
  },

  {
    id: "saas",
    name: "SaaS Product",
    icon: "💻",
    description: "Software products, apps, digital tools",
    trueNameTemplate: `# [OPERATOR_NAME] — True Name
**Business:** [BUSINESS_NAME]
**Niche:** [PROBLEM_SOLVED]

## Voice
- Clear, technical-when-needed, jargon-aware
- Helpful, not salesy
- Educational

## Banned Phrases
- "10x your productivity"
- "Replace your entire team"
- Vague ROI claims
- Fake testimonials

## Required Elements
- Specific use cases
- Clear pricing tiers
- Honest about limitations
- Comparison vs alternatives (when appropriate)

## Compliance
- No unsubstantiated claims
- Real metrics only
- Privacy + data handling clear

## Content Patterns
- Problem → Solution → Outcome
- Feature → Benefit → Use case
- Customer story → Insight → How to replicate`
  },

  {
    id: "creator",
    name: "Content Creator",
    icon: "🎬",
    description: "Influencers, YouTubers, social creators",
    trueNameTemplate: `# [OPERATOR_NAME] — True Name
**Business:** [PERSONAL_BRAND]
**Niche:** [CONTENT_TOPIC]

## Voice
- Personal, authentic, conversational
- Their actual voice (not corporate)
- Opinion-driven where appropriate

## Banned Phrases
- Fake vulnerability
- "You NEED to do this"
- Engagement bait ("Comment YES if...")
- Manufactured controversy

## Required Elements
- Authentic personal voice
- Specific examples (not generic)
- Clear value per piece

## Compliance
- Disclose sponsorships
- Real claims only
- Cultural sensitivity

## Content Patterns
- Hook → Story → Lesson
- Personal experience → Insight → Application
- Question → Answer → Take action`
  },

  {
    id: "agency",
    name: "Service Business",
    icon: "🏢",
    description: "Agencies, consultancies, professional services",
    trueNameTemplate: `# [OPERATOR_NAME] — True Name
**Business:** [AGENCY_NAME]
**Niche:** [SPECIALISM]

## Voice
- Professional, results-oriented
- Specific, not vague
- Confident without arrogance

## Banned Phrases
- "Guaranteed results"
- "Best agency ever" (self-praise without substance)
- Vague deliverables
- Hidden pricing

## Required Elements
- Clear service description
- Specific deliverables
- Honest timeline
- Real case studies

## Compliance
- Contracts + legal review
- Real testimonials (with permission)
- Clear pricing

## Content Patterns
- Diagnosis → Plan → Execute → Measure
- Process transparency
- Case study → Insight → Application`
  },

  {
    id: "nonprofit",
    name: "Nonprofit / Community",
    icon: "🤝",
    description: "Charities, community organisations, missions",
    trueNameTemplate: `# [OPERATOR_NAME] — True Name
**Business:** [ORG_NAME]
**Mission:** [WHAT_THEY_EXIST_TO_DO]

## Voice
- Mission-driven, warm, authentic
- Story-focused
- Hopeful without being naive

## Banned Phrases
- Guilt-tripping
- "Save the children" without specifics
- Vague impact claims
- Manipulative urgency

## Required Elements
- Specific impact metrics
- Real beneficiary stories (with consent)
- Clear donation/use of funds
- Transparent operations

## Compliance
- Charity regulations
- Tax-exempt status claims
- Privacy + consent

## Content Patterns
- Problem → Mission → Impact → How you help
- Story → Lesson → Action
- Thank you → Update → Next step`
  },

  {
    id: "education",
    name: "Education / Training",
    icon: "📚",
    description: "Courses, coaches, learning programs",
    trueNameTemplate: `# [OPERATOR_NAME] — True Name
**Business:** [COURSE_PROGRAM]
**Niche:** [WHAT_THEY_TEACH]

## Voice
- Expert teacher, patient, encouraging
- Clear over clever
- Scaffolded learning

## Banned Phrases
- "Master this in 5 minutes"
- "Easy money"
- "Anyone can do this"
- Unsubstantiated learning claims

## Required Elements
- Specific outcomes (what they'll be able to do)
- Honest time/effort estimates
- Curriculum structure
- Prerequisites

## Compliance
- Education regulations (varies by country)
- Refund policy
- Real outcomes (not inflated)

## Content Patterns
- Concept → Example → Practice
- Beginner → Intermediate → Advanced
- Lesson → Action → Result`
  },

  {
    id: "healthcare",
    name: "Healthcare / Wellness",
    icon: "⚕️",
    description: "Practitioners, wellness brands, health services",
    trueNameTemplate: `# [OPERATOR_NAME] — True Name
**Business:** [PRACTICE_BRAND]
**Niche:** [SPECIALTY]

## Voice
- Professional, caring, evidence-based
- Calm authority
- Not alarmist, not dismissive

## Banned Phrases
- "Cure" (for non-curable conditions)
- "Guaranteed results"
- Miracle claims
- Anti-science positioning
- Body-shaming

## Required Elements
- Disclaimer (not medical advice)
- Evidence citations when applicable
- Refer to professionals when needed
- Cultural sensitivity

## Compliance
- Medical/legal review required
- Practitioner credentials
- Privacy + consent

## Content Patterns
- Symptom → Cause → Solution → Outcome
- Evidence-based recommendations
- When to seek help`
  },

  {
    id: "realestate",
    name: "Real Estate / Property",
    icon: "🏘️",
    description: "Agents, property managers, real estate services",
    trueNameTemplate: `# [OPERATOR_NAME] — True Name
**Business:** [AGENT_NAME]
**Niche:** [PROPERTY_TYPE_MARKET]

## Voice
- Professional, knowledgeable, approachable
- Market-aware
- Trust-building

## Banned Phrases
- "Must sell now"
- "Best time to buy"
- Investment guarantees
- Pressure tactics

## Required Elements
- Accurate property details
- Market context
- Honest about challenges
- Local expertise

## Compliance
- Real estate regulations
- Licensing disclosures
- Fair housing laws

## Content Patterns
- Property → Features → Benefits → Lifestyle
- Market trends → Opportunities → Action
- Neighborhood → Schools → Community`
  },

  {
    id: "local",
    name: "Local Small Business",
    icon: "🏪",
    description: "Local shops, services, NZ/AU small businesses",
    trueNameTemplate: `# [OPERATOR_NAME] — True Name
**Business:** [BUSINESS_NAME]
**Local Area:** [REGION_TOWN]
**Service:** [WHAT_THEY_DO]

## Voice
- Friendly, local, personal
- Community-oriented
- Practical

## Banned Phrases
- Generic corporate speak
- Pretending to be bigger than you are
- "World-class" / "Industry-leading" (unless true)
- Cultural appropriation

## Required Elements
- Genuine local connection
- Real community involvement
- Honest pricing
- Local references

## Compliance
- NZ/AU consumer law (or local equivalent)
- Real claims only
- Privacy + consent

## Content Patterns
- Local problem → Local solution → How to book
- Community connection
- Behind-the-scenes → Story → Personal touch`
  }
];

// Make available globally
if (typeof window !== 'undefined') {
  window.INDUSTRY_TEMPLATES = INDUSTRY_TEMPLATES;
}