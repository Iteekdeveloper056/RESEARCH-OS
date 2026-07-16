// ================================
// PROFILE BUILDER — Track operator discovery answers
// ================================

const ProfileBuilder = {
  // Field definitions (what to capture during Discovery)
  fields: {
    // Section 1: Business Basics
    "business-description": { section: "Business Basics", label: "Business Description", order: 1 },
    "industry-niche": { section: "Business Basics", label: "Industry / Niche", order: 2 },
    "operating-duration": { section: "Business Basics", label: "Operating Duration", order: 3 },
    "geographic-reach": { section: "Business Basics", label: "Geographic Reach", order: 4 },
    "team-size": { section: "Business Basics", label: "Team Size", order: 5 },

    // Section 2: Current State
    "current-tools": { section: "Current State", label: "Current Tools", order: 6 },
    "voice-management": { section: "Current State", label: "Voice Management", order: 7 },
    "asset-storage": { section: "Current State", label: "Asset Storage", order: 8 },
    "support-handling": { section: "Current State", label: "Customer Support", order: 9 },
    "existing-automations": { section: "Current State", label: "Existing Automations", order: 10 },
    "biggest-pain-point": { section: "Current State", label: "Biggest Pain Point", order: 11 },

    // Section 3: Goals
    "six-month-goal": { section: "Goals", label: "6-Month Goal", order: 12 },
    "voice-success": { section: "Goals", label: "Voice Success Definition", order: 13 },
    "primary-goal": { section: "Goals", label: "Primary Goal", order: 14 },
    "north-star-metric": { section: "Goals", label: "North Star Metric", order: 15 },
    "upcoming-deadlines": { section: "Goals", label: "Upcoming Deadlines", order: 16 },

    // Section 4: Constraints
    "monthly-budget": { section: "Constraints", label: "Monthly Budget", order: 17 },
    "time-per-week": { section: "Constraints", label: "Time Per Week", order: 18 },
    "tech-skill-level": { section: "Constraints", label: "Tech Skill Level", order: 19 },
    "compliance-constraints": { section: "Constraints", label: "Compliance Constraints", order: 20 },
    "decision-makers": { section: "Constraints", label: "Decision Makers", order: 21 },

    // Section 5: Audience
    "ideal-customer": { section: "Audience", label: "Ideal Customer", order: 22 },
    "customer-problem": { section: "Audience", label: "Customer Problem", order: 23 },
    "customer-discovery": { section: "Audience", label: "How Customers Find You", order: 24 },
    "customer-testimonials": { section: "Audience", label: "Customer Words About You", order: 25 },

    // Section 6: Voice
    "voice-three-words": { section: "Voice", label: "Voice (3 Words)", order: 26 },
    "never-say": { section: "Voice", label: "Phrases You'd Never Say", order: 27 },
    "voice-references": { section: "Voice", label: "Voice References", order: 28 },
    "desired-feeling": { section: "Voice", label: "Desired Reader Feeling", order: 29 },
    "overused-phrases": { section: "Voice", label: "Phrases You Overuse/Hate", order: 30 },

    // Section 7: Readiness
    "brand-clarity": { section: "Readiness", label: "Brand Clarity (1-5)", order: 31 },
    "voice-consistency": { section: "Readiness", label: "Voice Consistency (1-5)", order: 32 },
    "content-volume": { section: "Readiness", label: "Content Volume (1-5)", order: 33 },
    "tech-comfort": { section: "Readiness", label: "Tech Comfort (1-5)", order: 34 },
    "process-documentation": { section: "Readiness", label: "Process Documentation (1-5)", order: 35 },

    // Wrap-Up
    "additional-context": { section: "Wrap-Up", label: "Additional Context", order: 36 },
    "preferred-comms": { section: "Wrap-Up", label: "Preferred Communication", order: 37 },
    "start-timing": { section: "Wrap-Up", label: "Start Timing", order: 38 }
  },

  // Parse the hidden structured profile block returned by the agent.
  // Example: <!-- PROFILE_UPDATES: {"industry-niche":"Wellness"} -->
  parseAgentMessage: function(message, currentProfile) {
    const marker = /<!--\s*PROFILE_UPDATES\s*:\s*(\{[\s\S]*?\})\s*-->/gi;
    const profile = { ...currentProfile };
    const updatedFields = [];
    let match;

    while ((match = marker.exec(message)) !== null) {
      try {
        const updates = JSON.parse(match[1]);
        Object.entries(updates).forEach(([fieldId, value]) => {
          if (!this.fields[fieldId] || value === null || value === undefined) return;

          const cleanValue = String(value).trim().slice(0, 5000);
          if (!cleanValue) return;

          profile[fieldId] = cleanValue;
          updatedFields.push(fieldId);
        });
      } catch (err) {
        console.warn('Ignored invalid profile update from agent:', err);
      }
    }

    if (updatedFields.length > 0) {
      profile.lastUpdated = new Date().toISOString();
    }

    return {
      profile,
      updatedFields: [...new Set(updatedFields)],
      cleanMessage: message.replace(marker, '').trim()
    };
  },

  // Manually update profile field (called when user explicitly provides info)
  updateField: function(profile, fieldId, value) {
    profile[fieldId] = value;
    profile.lastUpdated = new Date().toISOString();
    return profile;
  },

  // Get readiness score
  getReadinessScore: function(profile) {
    const scores = [
      profile["brand-clarity"],
      profile["voice-consistency"],
      profile["content-volume"],
      profile["tech-comfort"],
      profile["process-documentation"]
    ].filter(s => s !== undefined && s !== null).map(Number);

    if (scores.length === 0) return null;

    const total = scores.reduce((a, b) => a + b, 0);
    return {
      total,
      average: (total / scores.length).toFixed(1),
      max: 25,
      percentage: ((total / 25) * 100).toFixed(0)
    };
  },

  // Get completed fields count
  getProgress: function(profile) {
    const totalFields = Object.keys(this.fields).length;
    const completedFields = Object.keys(profile).filter(k =>
      this.fields[k] && profile[k] && profile[k].toString().trim()
    ).length;

    return {
      completed: completedFields,
      total: totalFields,
      percentage: Math.round((completedFields / totalFields) * 100)
    };
  },

  // Export profile as Markdown
  exportMarkdown: function(profile, operator) {
    let md = `# Operator Profile: ${operator.name}\n`;
    md += `**Business:** ${operator.business}\n`;
    md += `**Type:** ${operator.businessType}\n`;
    md += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;

    // Group fields by section
    const sections = {};
    Object.entries(this.fields).forEach(([fieldId, fieldInfo]) => {
      if (!sections[fieldInfo.section]) {
        sections[fieldInfo.section] = [];
      }
      const value = profile[fieldId];
      sections[fieldInfo.section].push({
        label: fieldInfo.label,
        value: value || "_Not captured_",
        order: fieldInfo.order
      });
    });

    // Render sections
    Object.entries(sections).forEach(([sectionName, fields]) => {
      md += `\n## ${sectionName}\n\n`;
      fields
        .sort((a, b) => a.order - b.order)
        .forEach(f => {
          md += `- **${f.label}:** ${f.value}\n`;
        });
    });

    // Add readiness score
    const readiness = this.getReadinessScore(profile);
    if (readiness) {
      md += `\n## Readiness Score\n\n`;
      md += `- **Total:** ${readiness.total} / ${readiness.max} (${readiness.percentage}%)\n`;
      md += `- **Average:** ${readiness.average} / 5\n`;
    }

    return md;
  },

  // Render profile sections as HTML
  renderHTML: function(profile) {
    const sections = {};

    Object.entries(this.fields).forEach(([fieldId, fieldInfo]) => {
      if (!sections[fieldInfo.section]) {
        sections[fieldInfo.section] = [];
      }
      sections[fieldInfo.section].push({
        id: fieldId,
        label: fieldInfo.label,
        value: profile[fieldId],
        order: fieldInfo.order
      });
    });

    let html = '';

    // Add readiness score at top
    const readiness = this.getReadinessScore(profile);
    if (readiness) {
      html += `
        <div class="profile-section">
          <div class="profile-section-header">📊 Readiness Score</div>
          <div class="profile-field">
            <div class="profile-field-label">Total Score</div>
            <div class="profile-field-value">
              <strong>${readiness.total} / ${readiness.max}</strong>
              (${readiness.percentage}%) — Average ${readiness.average} / 5
            </div>
          </div>
        </div>
      `;
    }

    Object.entries(sections).forEach(([sectionName, fields]) => {
      const sectionFields = fields.filter(f => f.value && f.value.toString().trim());

      if (sectionFields.length === 0) return;

      html += `
        <div class="profile-section">
          <div class="profile-section-header">${sectionName}</div>
      `;

      sectionFields
        .sort((a, b) => a.order - b.order)
        .forEach(f => {
          html += `
            <div class="profile-field">
              <div class="profile-field-label">${f.label}</div>
              <div class="profile-field-value">${this.escapeHTML(f.value.toString())}</div>
            </div>
          `;
        });

      html += `</div>`;
    });

    return html || '<div class="profile-empty"><p>👋 Start a Discovery conversation to build your operator profile.</p></div>';
  },

  escapeHTML: function(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML.replace(/\n/g, '<br>');
  }
};

if (typeof window !== 'undefined') {
  window.ProfileBuilder = ProfileBuilder;
}