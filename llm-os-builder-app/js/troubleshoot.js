// ================================
// TROUBLESHOOTING — Common issues + fixes
// ================================

const TROUBLESHOOT_ISSUES = [
  {
    id: "voice-mismatch",
    icon: "🎭",
    title: "Outputs Don't Sound Like Me",
    symptoms: "LLM outputs feel generic, not your voice. You edit heavily (50%+ of content). Voice score consistently <7/10.",
    fixes: [
      "Add 5 of your best outputs to True Name as voice examples",
      "Rewrite anti-voice section with specific phrases you use/avoid",
      "Add explicit voice checklist (5-10 specific rules)",
      "Use Claude Sonnet for voice-critical content (not cheaper models)",
      "Run 'voice audit' — score 10 outputs vs True Name, identify patterns"
    ]
  },

  {
    id: "cost-overrun",
    icon: "💸",
    title: "Costs Are Higher Than Expected",
    symptoms: "Monthly LLM bill exceeds budget. ROI is questionable.",
    fixes: [
      "Audit routing — bulk content should use DeepSeek (not Claude)",
      "Batch operations — 1 Claude call for 10 posts (not 10 separate)",
      "Set hard cost ceiling in API account",
      "Use free tiers — Ollama local, Hugging Face free models",
      "Track cost per piece, identify waste"
    ]
  },

  {
    id: "inconsistent-quality",
    icon: "🎲",
    title: "Content Quality Is Inconsistent",
    symptoms: "Some outputs great, some terrible. Quality varies day-to-day.",
    fixes: [
      "Standardise invocation template (same structure every time)",
      "Add quality gates before delivery (voice, format, banned phrases)",
      "Log all outputs + scores (track patterns over time)",
      "Build prompt library (reuse what works)"
    ]
  },

  {
    id: "operator-overwhelm",
    icon: "😵",
    title: "I'm Overwhelmed By All This",
    symptoms: "Used for 1 week, then abandoned. 'Too many tools, too many steps.' Reverts to old manual way.",
    fixes: [
      "Strip down to 1-2 True Process files (just Content + 1 other)",
      "Use single tool (no Notion + Drive + Slack + ...)",
      "Set 'weekly ritual' — 30 min Friday review (not daily)",
      "Hand-hold first month (weekly check-ins)",
      "Cut features that aren't used (audit monthly)"
    ]
  },

  {
    id: "compliance-risk",
    icon: "⚖️",
    title: "Compliance / Legal Risk",
    symptoms: "Worried about regulations. Content might violate industry rules. Legal/medical/financial claims at risk.",
    fixes: [
      "Add explicit disclaimer templates to True Process",
      "Add banned phrases specific to industry",
      "Require human review for high-risk content (medical, legal, financial)",
      "Consult lawyer/accountant for specific risks",
      "Document the compliance approach (so you can defend choices)"
    ]
  },

  {
    id: "negative-reactions",
    icon: "😞",
    title: "Customer Reactions Are Negative",
    symptoms: "Customers complain about automated responses. Engagement drops after LLM-generated content. Brand feels 'off'.",
    fixes: [
      "Always have human review before customer-facing",
      "Use AI for first draft, human for final",
      "Add personal touches (your name, specific customer details)",
      "Get customer feedback (small sample first)",
      "A/B test AI vs human content (measure which performs)"
    ]
  },

  {
    id: "no-improvement",
    icon: "😐",
    title: "The System Doesn't Improve",
    symptoms: "Same outputs quality month after month. No learnings captured. True Process files never updated.",
    fixes: [
      "Set recurring calendar reminder (Friday review)",
      "Use template for monthly review (what worked, what didn't, what to change)",
      "Track specific metrics (voice score, edit rate, conversion)",
      "Celebrate improvements (show before/after)"
    ]
  },

  {
    id: "no-roi",
    icon: "📉",
    title: "I'm Not Getting ROI",
    symptoms: "Time spent on LLM OS = same as before. No measurable improvement. Questioning why you're doing this.",
    fixes: [
      "Track specific metrics from day 1 (hours saved, voice score, satisfaction)",
      "Set 90-day checkpoint (if no ROI by then, revisit approach)",
      "Reduce system complexity (cut features not used)",
      "Focus on 1-2 high-impact use cases (not everything at once)"
    ]
  },

  {
    id: "multi-brand",
    icon: "🌐",
    title: "Adding More Brands / Services",
    symptoms: "Adding new brands/services. True Name files need to scale. Quality starts slipping.",
    fixes: [
      "Build separate True Name per brand (don't reuse)",
      "Prioritise 1-2 brands (not all at once)",
      "Build brand relationship matrix (similar vs different)",
      "Use shared infrastructure (Drive, tools) but separate voice files"
    ]
  },

  {
    id: "technical-issues",
    icon: "🔧",
    title: "Technical / Integration Problems",
    symptoms: "Tools not talking to each other. API errors. File sync issues.",
    fixes: [
      "Document integration setup (screenshot each step)",
      "Test integrations before relying on them",
      "Have fallback (manual process if integration fails)",
      "Use no-code tools (Zapier, Make) for integrations",
      "Escalate to specific tool support when stuck"
    ]
  }
];

// Make available globally
if (typeof window !== 'undefined') {
  window.TROUBLESHOOT_ISSUES = TROUBLESHOOT_ISSUES;
}