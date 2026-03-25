# Product Manager's Journey with GitHub Copilot: From Business Analysis to Product Definition

## Phase 1: Discovery & Business Analysis

### 1.1 Market & Competitive Research
Use `/research` to investigate the competitive landscape. Ask Copilot to scan public repositories, documentation, and APIs of competitors to identify feature gaps and opportunities.

> **Prompt example:** "Research how competitor X implements their authentication flow. Summarize strengths, weaknesses, and what we could do differently."

### 1.2 Customer Feedback Analysis
Paste raw customer data — support tickets, NPS surveys, sales call transcripts — and ask Copilot to extract patterns.

> **Prompt example:** "Categorize these 50 support tickets by theme, severity, and frequency. Identify the top 5 pain points with supporting quotes."

### 1.3 Data-Driven Insights
Ask Copilot to write SQL queries against your analytics database to validate hypotheses before committing to a direction.

> **Prompt example:** "Write a SQL query to find the drop-off rate at each step of our onboarding funnel over the last 90 days."

---

## Phase 2: Ideation & Opportunity Framing

### 2.1 Problem Statement Drafting
Describe the raw problem space and have Copilot structure it into a clear problem statement with target persona, current pain, and desired outcome.

> **Prompt example:** "Turn these customer complaints into a structured problem statement using the 'Jobs to Be Done' framework."

### 2.2 Solution Brainstorming
Use Copilot as a brainstorming partner. Provide constraints (budget, timeline, tech stack) and ask for multiple solution approaches ranked by effort and impact.

> **Prompt example:** "Given our React + Node stack and a 6-week timeline, propose 3 approaches to solve the notification overload problem. Compare trade-offs."

### 2.3 User Journey Mapping
Ask Copilot to generate Mermaid diagrams that visualize the current-state and future-state user flows, highlighting friction points and improvement areas.

> **Prompt example:** "Create a Mermaid flowchart of our current checkout flow, then create an optimized version that reduces steps from 5 to 3."

---

## Phase 3: Product Definition

### 3.1 PRD Generation
Turn rough notes and decisions from previous phases into a structured Product Requirements Document.

> **Prompt example:** "Write a PRD for the 'Smart Notifications' feature. Include: overview, user stories, acceptance criteria, out-of-scope items, success metrics, and rollout plan."

### 3.2 User Story Breakdown
Have Copilot decompose high-level epics into granular, estimable user stories with clear acceptance criteria.

> **Prompt example:** "Break the 'Smart Notifications' epic into user stories. Each story should follow the format: As a [persona], I want [action], so that [benefit]. Include acceptance criteria and edge cases."

### 3.3 API & Data Contract Design
For data-heavy features, ask Copilot to draft API contracts and data models that align with your requirements.

> **Prompt example:** "Design a REST API for the notification preferences system. Include endpoints, request/response schemas, and error handling."

---

## Phase 4: Validation & Alignment

### 4.1 Technical Feasibility Check
Point Copilot at your codebase and ask it to assess how a proposed feature fits into the existing architecture.

> **Prompt example:** "Analyze our current notification system in @src/notifications/. How much refactoring is needed to support per-channel user preferences?"

### 4.2 Effort Estimation Support
Have Copilot scan the codebase and break down implementation into tasks with rough complexity signals.

> **Prompt example:** "Based on the user stories in @docs/prd-smart-notifications.md and the current codebase, identify the major implementation tasks and flag any high-risk areas."

### 4.3 Stakeholder Communication
Generate executive summaries, slide outlines, or RFC documents from your detailed specs.

> **Prompt example:** "Summarize this PRD into a 1-page executive brief suitable for a VP-level audience. Focus on business impact, timeline, and resource needs."

---

## Phase 5: Handoff & Execution Support

### 5.1 GitHub Issues & Project Board Setup
Have Copilot create structured GitHub Issues from your user stories, complete with labels, milestones, and dependency links.

> **Prompt example:** "Create GitHub Issues for each user story in the Smart Notifications PRD. Add labels for priority and component. Group them under a milestone."

### 5.2 Acceptance Test Drafting
Generate test scenarios that QA and engineering can use to validate the implementation matches the spec.

> **Prompt example:** "Write acceptance test scenarios for the 'notification preferences' user story. Cover happy path, edge cases, and error states."

### 5.3 Prototype Scaffolding
Ask Copilot to build a quick functional prototype to share with stakeholders for early feedback before full development begins.

> **Prompt example:** "Scaffold a React prototype of the notification preferences UI. Include toggles for email, push, and in-app channels with a save button."

---

## Phase 6: Monitoring & Iteration

### 6.1 Release Notes & Changelog
After features ship, have Copilot scan merged PRs and generate customer-facing release notes.

> **Prompt example:** "Scan all PRs merged to main this sprint and generate release notes grouped by feature, bug fix, and improvement."

### 6.2 PR Impact Summaries
Use `/review` to understand what shipped without reading code. Ask Copilot to explain changes in product terms.

> **Prompt example:** "Summarize PR #142 in plain language. What does it change from the user's perspective?"

### 6.3 Post-Launch Metrics Review
Ask Copilot to write analytics queries that measure whether the feature hit its success metrics.

> **Prompt example:** "Write SQL queries to measure: 1) notification opt-out rate before vs. after launch, 2) click-through rate on notifications by channel, 3) user satisfaction score delta."

### 6.4 Retrospective & Iteration Planning
Feed outcomes back in and have Copilot draft the next iteration plan based on what the data shows.

> **Prompt example:** "Given these post-launch metrics, draft a proposal for v2 improvements. Prioritize by impact and effort."

---

## Summary: The PM × Copilot Loop

```
Discovery → Ideation → Definition → Validation → Handoff → Monitor → Iterate
    ↑                                                                    |
    └────────────────────────────────────────────────────────────────────┘
```

At every phase, Copilot acts as your **analyst, writer, reviewer, and prototyper** — letting you move faster from "we have a business problem" to "we shipped a solution and measured the result."
