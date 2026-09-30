# Domain Docs

How engineering skills consume this repository's domain documentation.

## Before exploring, read these

- `GLOSSARY.md` at the repository root.
- Relevant ADRs under `docs/adr/`.

If these files do not exist, proceed silently. Do not suggest creating them preemptively. The `/domain-modeling` skill creates them when terminology or architectural decisions are actually resolved.

## File structure

This is a single-context repository:

```text
/
├── GLOSSARY.md
├── docs/
│   └── adr/
└── src/
```

## Use the glossary's vocabulary

When output names a domain concept—in an issue title, proposal, hypothesis, or test—use the term defined in `GLOSSARY.md`. Do not drift to synonyms that the glossary explicitly avoids.

If a required concept is absent, reconsider whether the term belongs to the project or note the gap for `/domain-modeling`.

## Flag ADR conflicts

If a proposed change contradicts an existing ADR, surface the conflict explicitly rather than silently overriding it.
