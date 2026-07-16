// ================================
// FILE GENERATOR — Generate True Name + True Process + SKILL.md
// ================================

const FileGenerator = {

  // Generate True Name master file from operator profile
  generateTrueName: function(operator, profile, industryTemplate) {
    const now = new Date().toLocaleDateString();

    let md = `# ${operator.business} — TRUE NAME
**Operator:** ${operator.name}
**Business Type:** ${this.formatBusinessType(operator.businessType)}
**Stage:** ${operator.stage || '_Not specified_'}
**Generated:** ${now}
**Version:** 1.0

---

## 1. Business Identity

**What we do:** ${profile['business-description'] || '_To be filled_'}
**Who we serve:** ${profile['ideal-customer'] || '_To be filled_'}
**Where we operate:** ${profile['geographic-reach'] || '_To be filled_'}

---

## 2. Brand Voice

**3 words that describe our voice:** ${profile['voice-three-words'] || '_To be filled_'}

**Voice characteristics:**
- Calm, capable, and results-focused
- Not preachy, not corporate
- Specific over generic

**Phrases we never say:**
${profile['never-say'] || '_To be filled_'}

**Phrases we overuse (to avoid):**
${profile['overused-phrases'] || '_To be filled_'}

**Desired feeling after reading our content:**
${profile['desired-feeling'] || '_To be filled_'}

**Voice references (who we sound like):**
${profile['voice-references'] || '_To be filled_'}

---

## 3. Frameworks & Methodology

${profile['additional-context'] || '_To be filled in based on operator methodology_'}

---

## 4. Audience

**Ideal customer profile:**
${profile['ideal-customer'] || '_To be filled_'}

**Their biggest problem:**
${profile['customer-problem'] || '_To be filled_'}

**How they find us:**
${profile['customer-discovery'] || '_To be filled_'}

**What they say about us (real quotes):**
${profile['customer-testimonials'] || '_To be filled_'}

---

## 5. Goals & Metrics

**6-month vision:**
${profile['six-month-goal'] || '_To be filled_'}

**North star metric:**
${profile['north-star-metric'] || '_To be filled_'}

**Primary goal (ranked):**
${profile['primary-goal'] || '_To be filled_'}

**Upcoming deadlines:**
${profile['upcoming-deadlines'] || '_None specified_'}

---

## 6. Constraints

**Monthly budget:** ${profile['monthly-budget'] || '_To be filled_'}
**Time per week:** ${profile['time-per-week'] || '_To be filled_'}
**Tech skill level:** ${profile['tech-skill-level'] || '_To be filled_'}

---

## 7. Compliance

**Regulatory constraints:**
${profile['compliance-constraints'] || '_None specified_'}

**Industry-specific rules:** _To be researched per industry_

---

## 8. Banned Phrases (Industry-Specific)

${industryTemplate ? this.extractBannedPhrases(industryTemplate) : '_To be customised per industry_'}

---

## 9. Required Elements

${industryTemplate ? this.extractRequiredElements(industryTemplate) : '_To be customised per industry_'}

---

## 10. Content Patterns

${industryTemplate ? this.extractContentPatterns(industryTemplate) : '_To be defined per operator_'}

---

## 11. Architecture Decision

**Primary LLM:** Claude Sonnet 4.6 (via OpenRouter)
**Bulk LLM:** DeepSeek V4 Flash (via OpenRouter)
**Local LLM:** Ollama Llama 3.1 8B (free, offline)
**Variations:** Llama 3.3 70B (via OpenRouter)

**Why this stack:**
- Claude Sonnet for voice-critical content (highest quality)
- DeepSeek for bulk drafts (cost-optimized, ~25x cheaper)
- Ollama for template filling (free, local)
- OpenRouter for vendor neutrality (can switch models anytime)

---

## 12. Next Steps

- [ ] Complete Discovery (${this.getDiscoveryProgress(profile)} complete)
- [ ] Generate True Process files (per sub-domain)
- [ ] Create SKILL.md (portable skill)
- [ ] Set up infrastructure (Drive, funnels, email)
- [ ] Test with first content piece
- [ ] Monthly review cadence

---

**END OF TRUE NAME**
`;

    return md;
  },

  // Generate True Process file for Content Production
  generateContentProcess: function(operator, profile) {
    const now = new Date().toLocaleDateString();

    return `# ${operator.business} — TRUE PROCESS: Content Production
**Generated:** ${now}
**Version:** 1.0

---

## Purpose

Produce content that:
- Sounds like ${operator.name} (not generic AI)
- Resolves customer's problem
- Moves them toward next step
- Passes quality gates

---

## Voice Check (Before Writing)

- [ ] Read True Name → Voice section
- [ ] Read 3 banned phrases → avoid them
- [ ] Read desired feeling → aim for it
- [ ] Read voice references → match their style

---

## Content Quality Gates (5)

### Gate 1: Voice Match
Score 1-10. Must be ≥8.
- Does it sound like ${operator.name} wrote it?
- Are banned phrases avoided?
- Does it have the desired feeling?

### Gate 2: Specificity
Score 1-10. Must be ≥7.
- Are examples concrete (not generic)?
- Are numbers/figures used where applicable?
- Are quotes/testimonials included when relevant?

### Gate 3: Customer-Centric
Score 1-10. Must be ≥8.
- Does it address the customer's problem?
- Does it move them toward action?
- Is it useful to them (not just to us)?

### Gate 4: Compliance
Pass/fail. Must pass.
- No unsubstantiated claims
- No banned industry phrases
- Disclaimers included where needed
- Privacy/consent respected

### Gate 5: Format
Pass/fail. Must pass.
- Margins use Mm() not Cm() (if DOCX)
- Inline bullets (\`•  \` not List Bullet style)
- Brand fonts + colors applied
- A4 page size (if document)

---

## Process (8 Steps)

### Step 1: Define the Piece
- What type? (blog post / social / email / doc)
- Who's it for?
- What's the one thing they should remember?

### Step 2: Research (5-10 min)
- Look up facts/figures
- Find 1-2 examples
- Check for industry trends

### Step 3: Draft (15-30 min)
- Hook → Problem → Insight → Action
- Or: Question → Answer → Next step
- Write messy, refine later

### Step 4: Apply Voice
- Read aloud — does it sound like ${operator.name}?
- Cut filler words ("just", "really", "very")
- Replace generic with specific

### Step 5: Quality Gates
- Run all 5 gates
- If any fail, revise before next step
- Get human review if voice score <8

### Step 6: Format
- Apply brand styling
- Add visuals if appropriate
- Optimise for distribution channel

### Step 7: Final Review
- Read top-to-bottom
- Check links/CTAs work
- Spell check + grammar check

### Step 8: Publish + Track
- Publish to channel
- Log: date, channel, piece type, voice score
- Set reminder to check performance (7 days)

---

## Routing Logic (Which LLM)

- **Voice-critical** (thought leadership, sales pages) → Claude Sonnet 4.6
- **Bulk drafts** (social posts, emails) → DeepSeek V4 Flash
- **Template fill** (variations of same piece) → Ollama local
- **Premium quality** (hero content) → Claude Opus 4.1
- **Variations** (A/B test alternatives) → Llama 3.3 70B

---

## Improvement Loop

**Weekly:**
- Review last week's content
- Note any patterns in edits
- Update True Name if voice shifted

**Monthly:**
- Calculate average voice score across pieces
- Identify low-scoring patterns
- Update True Process if needed

**Quarterly:**
- Review goals (still aligned?)
- Refresh banned phrases (new AI tells?)
- Update architecture if better models available

---

**END OF TRUE PROCESS: Content Production**
`;
  },

  // Generate SKILL.md (portable LLM skill)
  generateSkill: function(operator, profile) {
    const voiceWords = profile['voice-three-words'] || 'specific, helpful, authentic';
    const neverSay = profile['never-say'] || 'generic AI phrases';
    const industryType = this.formatBusinessType(operator.businessType);

    return `---
name: ${operator.business.toLowerCase().replace(/[^a-z0-9]/g, '-')}-voice
description: Generate content in ${operator.business}'s authentic voice for ${industryType} use cases.
version: 1.0
author: ${operator.name}
created: ${new Date().toISOString().split('T')[0]}
tags: [${operator.businessType}, content, voice]
---

# ${operator.business} Voice Skill

> Portable skill for any LLM. Drop into Claude, ChatGPT, or any compatible LLM.

---

## What This Skill Does

Generates content that sounds like **${operator.name}** wrote it, for **${industryType}** use cases.

---

## Voice Definition

**3 words:** ${voiceWords}

**Banned phrases:** ${neverSay}

**Desired reader feeling:** ${profile['desired-feeling'] || 'informed, motivated, ready to act'}

**Voice references:** ${profile['voice-references'] || 'Operator to fill'}

---

## When to Use This Skill

Activate when:
- Writing content for ${operator.business}
- Responding to customers in operator's voice
- Creating marketing/sales material
- Building True Process files

Don't activate when:
- Content is for other brands
- Highly technical/legal/medical (escalate to expert)
- Out of operator's domain expertise

---

## Invocation

To activate this skill in an LLM session:

\`\`\`
You are writing content for ${operator.business}.

Voice rules:
- Sound like ${operator.name} wrote it (calm, capable, specific)
- Avoid these phrases: ${neverSay}
- Aim for feeling: ${profile['desired-feeling'] || 'informed + motivated'}
- Reference style: ${profile['voice-references'] || 'see True Name file'}

Always:
- Be specific (not generic)
- Include examples
- Move reader toward action

[Your specific request here]
\`\`\`

---

## Quality Gates

Every output must pass:

1. **Voice match** — Sounds like ${operator.name} (8/10+)
2. **Specificity** — Concrete examples, not vague claims
3. **Customer-centric** — Useful to the reader
4. **Compliance** — No banned phrases, no false claims
5. **Format** — Proper styling, no AI tells

---

## Content Patterns

### Pattern 1: Hook → Problem → Insight → Action
Use for: Blog posts, thought leadership

### Pattern 2: Question → Answer → Next Step
Use for: FAQs, customer support

### Pattern 3: Story → Lesson → Application
Use for: Personal brand content, case studies

### Pattern 4: Problem → Solution → Result
Use for: Product pages, case studies

---

## Examples

[Operator to add 5 examples of content that nailed the voice]

---

## Limitations

This skill does NOT:
- Replace operator's domain expertise
- Guarantee business success
- Work for content outside this brand
- Handle legal/medical/financial advice

This skill DOES:
- Maintain consistent voice
- Save time on first drafts
- Apply operator's style automatically
- Support multiple content types

---

## Updates

Update this skill when:
- Voice evolves
- New banned phrases identified
- New patterns emerge
- Goals change

**Update cadence:** Quarterly review minimum

---

**END OF SKILL**
`;
  },

  // Helper: Format business type for display
  formatBusinessType: function(type) {
    const map = {
      'coach': 'Coach / Consultant',
      'ecommerce': 'E-Commerce',
      'saas': 'SaaS Product',
      'creator': 'Content Creator',
      'agency': 'Service Business',
      'nonprofit': 'Nonprofit / Community',
      'education': 'Education / Training',
      'healthcare': 'Healthcare / Wellness',
      'realestate': 'Real Estate',
      'local': 'Local Small Business',
      'other': 'Other'
    };
    return map[type] || type;
  },

  // Helper: Extract banned phrases from template
  extractBannedPhrases: function(template) {
    const match = template.trueNameTemplate.match(/## Banned Phrases\n([\s\S]*?)(?=\n## |\n---)/);
    return match ? match[1].trim() : '_To be filled_';
  },

  // Helper: Extract required elements
  extractRequiredElements: function(template) {
    const match = template.trueNameTemplate.match(/## Required Elements\n([\s\S]*?)(?=\n## |\n---)/);
    return match ? match[1].trim() : '_To be filled_';
  },

  // Helper: Extract content patterns
  extractContentPatterns: function(template) {
    const match = template.trueNameTemplate.match(/## Content Patterns\n([\s\S]*?)(?=\n## |\n---)/);
    return match ? match[1].trim() : '_To be filled_';
  },

  // Helper: Get discovery progress
  getDiscoveryProgress: function(profile) {
    const fields = Object.keys(ProfileBuilder.fields);
    const completed = fields.filter(f => profile[f] && profile[f].toString().trim()).length;
    return `${completed} / ${fields.length}`;
  },

  // Download file as text
  downloadFile: function(filename, content, mimeType = 'text/markdown') {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Download all deliverables as separate files (one at a time)
  downloadAllDeliverables: function(operator, profile, industryTemplate) {
    const trueName = this.generateTrueName(operator, profile, industryTemplate);
    const contentProcess = this.generateContentProcess(operator, profile);
    const skill = this.generateSkill(operator, profile);

    const safeName = operator.business.replace(/[^a-z0-9]/gi, '_');

    this.downloadFile(`${safeName}_TRUE_NAME.md`, trueName);
    setTimeout(() => this.downloadFile(`${safeName}_TRUE_PROCESS_CONTENT.md`, contentProcess), 500);
    setTimeout(() => this.downloadFile(`${safeName}_SKILL.md`, skill), 1000);
  }
};

if (typeof window !== 'undefined') {
  window.FileGenerator = FileGenerator;
}