# RenderBank Agent Guide

## Documentation routing

Use [`docs/README.md`](docs/README.md) as the map for broad or ambiguous documentation work. For a focused task, read the smallest relevant document set: start from the primary document below, search for the relevant heading, then follow only dependencies or ambiguities that block the work. Do not preload every product document.

| Task branch | Read first | Add only when needed |
|---|---|---|
| Product scope, priorities, acceptance criteria, or out-of-scope decisions | `docs/product/PRD.md` | `docs/experience/USER_FLOWS.md` for journey behavior; `docs/experience/SCREEN_REQUIREMENTS.md` for screen-level acceptance |
| Route, navigation, URL, indexing, or screen inventory | `docs/product/SITEMAP.md` | `docs/experience/USER_FLOWS.md` for transitions; `docs/experience/SCREEN_REQUIREMENTS.md` for page states |
| User journey, payment/access sequence, error recovery, or admin workflow | `docs/experience/USER_FLOWS.md` | `docs/product/PRD.md` for intent; `docs/engineering/TECHNICAL_ARCHITECTURE.md` for system boundaries |
| Screen behavior, content, states, responsive rules, accessibility, SEO, or analytics | `docs/experience/SCREEN_REQUIREMENTS.md` | `docs/design/HIGH_FIDELITY_UI.md` for exact UI behavior; `docs/experience/USER_FLOWS.md` for transitions |
| Visual language, tokens, components, or design-system implementation | `docs/design/DESIGN.md` | `docs/design/HIGH_FIDELITY_UI.md` for screen composition; relevant `docs/experience/SCREEN_REQUIREMENTS.md` section for behavior |
| Building or reviewing a concrete page/component | Relevant section of `docs/design/HIGH_FIDELITY_UI.md` | Matching `docs/experience/SCREEN_REQUIREMENTS.md` section, `docs/design/DESIGN.md` component/token rules, and `docs/product/SITEMAP.md` only for route metadata |
| Server/client boundaries, rendering, caching, auth, payment, storage, integrations, testing, or deployment | `docs/engineering/TECHNICAL_ARCHITECTURE.md` | `docs/engineering/DATABASE_SCHEMA_DRAFT.md` for persistence; `docs/experience/USER_FLOWS.md` for sequence semantics |
| Tables, constraints, RLS, transactions, indexes, migrations, or data lifecycle | `docs/engineering/DATABASE_SCHEMA_DRAFT.md` | `docs/engineering/TECHNICAL_ARCHITECTURE.md` for trust boundaries; relevant flow for lifecycle semantics |

For a cross-cutting feature, read one relevant section from each affected layer rather than each whole file:

```text
product intent → route/flow → screen behavior → visual spec → architecture/schema
```

Read a full document only when the task is broad enough that most sections affect the result.

## Authority and conflicts

Documents evolve during implementation. Treat the current files on disk as authoritative; never rely on a remembered earlier version. Before changing behavior, re-read the relevant sections.

Use this precedence when documents disagree:

1. `docs/product/PRD.md` owns product scope, goals, and MVP acceptance.
2. `docs/product/SITEMAP.md` owns routes and navigation structure.
3. `docs/experience/USER_FLOWS.md` owns journey and state-transition semantics.
4. `docs/experience/SCREEN_REQUIREMENTS.md` owns required screen content, behavior, and states.
5. `docs/design/HIGH_FIDELITY_UI.md` owns exact screen composition and interaction presentation.
6. `docs/design/DESIGN.md` owns shared visual tokens and component language.
7. `docs/engineering/TECHNICAL_ARCHITECTURE.md` owns system boundaries and runtime decisions.
8. `docs/engineering/DATABASE_SCHEMA_DRAFT.md` owns persistence design and database invariants.

Precedence resolves ownership, not permission to silently override another layer. If a change creates a real contradiction, update every affected document in the same task or surface the conflict before implementation.

## Documentation maintenance

When implementation changes a locked decision, invariant, route, flow, screen contract, or schema rule, update its owning document alongside the code. Keep cross-document references accurate and preserve each fact in one owning document rather than copying its full definition into `CLAUDE.md`, `docs/README.md`, or another specification.

`docs/engineering/DATABASE_SCHEMA_DRAFT.md` remains a draft until promoted or replaced by a final schema document. If a final successor is added, update both this routing table and `docs/README.md`.

## Agent skills

### Issue tracker

Issues and specs are tracked in GitHub Issues using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

This repository uses the canonical triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This repository uses a single-context domain-doc layout. See `docs/agents/domain.md`.
