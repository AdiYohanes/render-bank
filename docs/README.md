# RenderBank Documentation

This directory is the canonical map for RenderBank product, experience, design, and engineering specifications.

## Read efficiently

For a focused task, open the primary document in the table below, search for the relevant heading, and follow only the dependencies needed to resolve ambiguity. Do not preload every specification.

For cross-cutting work, follow the relevant sections through this chain:

```text
product intent → route/flow → screen behavior → visual specification → architecture/schema
```

## Documentation groups

### Product

| Document | Owns | Status |
|---|---|---|
| [`product/PRD.md`](product/PRD.md) | Product scope, goals, priorities, MVP acceptance, and non-goals | Final Draft |
| [`product/SITEMAP.md`](product/SITEMAP.md) | Routes, navigation, URL strategy, indexing, and screen inventory | Approved for MVP |

### Experience

| Document | Owns | Status |
|---|---|---|
| [`experience/USER_FLOWS.md`](experience/USER_FLOWS.md) | User journeys, state transitions, payment/access sequences, recovery, and admin workflows | Approved for MVP |
| [`experience/SCREEN_REQUIREMENTS.md`](experience/SCREEN_REQUIREMENTS.md) | Required screen content, behavior, states, responsive rules, accessibility, SEO, and analytics | Approved for MVP |

### Design

| Document | Owns | Status |
|---|---|---|
| [`design/DESIGN.md`](design/DESIGN.md) | Shared visual language, tokens, components, and design-system rules | Approved for MVP |
| [`design/HIGH_FIDELITY_UI.md`](design/HIGH_FIDELITY_UI.md) | Exact screen composition, responsive presentation, and interaction details | Revised Draft for Review |

### Engineering

| Document | Owns | Status |
|---|---|---|
| [`engineering/TECHNICAL_ARCHITECTURE.md`](engineering/TECHNICAL_ARCHITECTURE.md) | System boundaries, runtime decisions, security, integrations, testing, and deployment | Approved MVP Baseline |
| [`engineering/DATABASE_SCHEMA.md`](engineering/DATABASE_SCHEMA.md) | Persistence model, constraints, RLS, transactions, indexes, and data lifecycle | Proposed MVP Baseline — Slice 0 review pending |
| [`engineering/FOUNDATION_IMPLEMENTATION_PLAN.md`](engineering/FOUNDATION_IMPLEMENTATION_PLAN.md) | Issue #1 foundation slices, dependencies, acceptance, and verification | Implementation plan |

## Task routing

| Task | Read first | Add only when needed |
|---|---|---|
| Product scope or acceptance | [`product/PRD.md`](product/PRD.md) | User flows and matching screen requirements |
| Routes, navigation, URLs, or indexing | [`product/SITEMAP.md`](product/SITEMAP.md) | User flows and matching screen requirements |
| User journeys or state transitions | [`experience/USER_FLOWS.md`](experience/USER_FLOWS.md) | Product intent and architecture boundaries |
| Screen behavior or content | [`experience/SCREEN_REQUIREMENTS.md`](experience/SCREEN_REQUIREMENTS.md) | High-fidelity composition and relevant user flow |
| Visual tokens or shared components | [`design/DESIGN.md`](design/DESIGN.md) | High-fidelity composition and matching screen contract |
| Concrete page or component | Relevant section of [`design/HIGH_FIDELITY_UI.md`](design/HIGH_FIDELITY_UI.md) | Matching screen, design-system, and route sections |
| Runtime, auth, payment, storage, or deployment | [`engineering/TECHNICAL_ARCHITECTURE.md`](engineering/TECHNICAL_ARCHITECTURE.md) | Database rules and relevant flow semantics |
| Schema, RLS, migrations, or data lifecycle | [`engineering/DATABASE_SCHEMA.md`](engineering/DATABASE_SCHEMA.md) | Architecture trust boundaries and relevant flows |

Repository-specific agent workflows live in [`agents/`](agents/). They guide how agents work; they do not override the canonical product specifications above. Root [`CLAUDE.md`](../CLAUDE.md) defines document authority and conflict handling.
