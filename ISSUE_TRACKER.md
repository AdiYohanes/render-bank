# RenderBank Foundation Issue Tracker

GitHub Issues is the source of truth for issue status. [Parent #1](https://github.com/AdiYohanes/render-bank/issues/1) owns the foundation; [Slice 0 PR #9](https://github.com/AdiYohanes/render-bank/pull/9) established its reviewed contract. All seven native sub-issues are accepted, merged, and closed. This snapshot is updated on 3 October 2026.

| Sub-issue | Depends on | Merged implementation | GitHub state |
|---|---|---|---|
| [#2 RenderBank shell](https://github.com/AdiYohanes/render-bank/issues/2) | Slice 0 | [PR #10](https://github.com/AdiYohanes/render-bank/pull/10) | Closed |
| [#3 Free Prompt boundary](https://github.com/AdiYohanes/render-bank/issues/3) | #2 | [PR #11](https://github.com/AdiYohanes/render-bank/pull/11) | Closed |
| [#4 Premium Prompt/Pack](https://github.com/AdiYohanes/render-bank/issues/4) | #3 | [PR #12](https://github.com/AdiYohanes/render-bank/pull/12) | Closed |
| [#5 Admin/artwork](https://github.com/AdiYohanes/render-bank/issues/5) | #4 | [PR #13](https://github.com/AdiYohanes/render-bank/pull/13) | Closed |
| [#6 Buyer persistence](https://github.com/AdiYohanes/render-bank/issues/6) | #4 | [PR #14](https://github.com/AdiYohanes/render-bank/pull/14) | Closed |
| [#7 Atomic paid completion](https://github.com/AdiYohanes/render-bank/issues/7) | #6 | [PR #15](https://github.com/AdiYohanes/render-bank/pull/15) | Closed |
| [#8 Clean-checkout gate](https://github.com/AdiYohanes/render-bank/issues/8) | #5, #7 | [PR #16](https://github.com/AdiYohanes/render-bank/pull/16) | Closed |

[Parent correction PR #17](https://github.com/AdiYohanes/render-bank/pull/17) merged as `f6db98a`: completed the 25-table baseline (`admin_audit_logs`), protected and atomically recorded Admin publication changes, required suspension reasons, blocked trusted credentials before client compilation, and strengthened real-role Admin tests.

**Parent #1: closed on 3 October 2026 after acceptance documentation [PR #18](https://github.com/AdiYohanes/render-bank/pull/18) merged and all Definition of Done checks passed.** A fresh clone of merged `main` at `f6db98a6e4ad1acbaf21f85814e63e35037c407e` passed `npm run foundation:check` on 3 October 2026: locked install, typecheck, local reset/seed, 28 real-role database tests, generated-type drift, 15 application tests, production build without trusted credentials, public-output secret scan, root smoke, and unchanged working tree. Lint reported 0 errors/1,414 warnings (mostly Windows CRLF formatting). `npm ci` also reported five high-severity dependency advisories; the gate does not include an audit check. The [Definition of Done](docs/engineering/FOUNDATION_IMPLEMENTATION_PLAN.md#parent-issue-1-definition-of-done) and [GitHub progress comment](https://github.com/AdiYohanes/render-bank/issues/1#issuecomment-5928415948) record the acceptance evidence. GitHub is the source of truth for live issue state.
