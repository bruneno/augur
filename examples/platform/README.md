# augur-platform

A deliberately over-built social-platform API where **persistence and almost all
the logic are divined**. The database is the amnesiac journal (no `certain`), so
every insert, read, update, delete, and batch goes through the oracle — and so do
auth, validation, enrichment, moderation, search, and analytics. Only the
router/dispatch is native (`certain`), so requests actually reach a handler.

~45 routes, split across files with `include`. A joke about LLM-driven software.
**Do not deploy it.** The auth is the oracle's opinion and is prompt-injectable;
the store forgets its oldest records when the journal overflows.

## Run

```sh
cd examples/platform
../../aug main.aug --oracle openrouter --model openai/gpt-4o-mini --remember
# (build ../../aug first with `bun run build` in the repo root, or use
#  `bun run ../../src/index.ts main.aug ...`)
```

Auth-protected routes read the session token from the `Authorization` header
(returned by `/auth/login`). The `fake` oracle runs it offline but can't produce
structured JSON, so typed routes return 500 there — use a real oracle.

## Layout

```
main.aug              # includes everything, native dispatch, serve 8799
lib/store.aug         # commune + audit(), newId(), paginate()
lib/auth.aug          # hashPw, mintToken, currentUser, requireAuth, isAdmin
routes/auth.aug       # register, login, logout, me, refresh, reset, sessions
routes/users.aug      # list, get, search, role, update, promote, batch, delete
routes/posts.aug      # create, list, get, search, feed, trending, update,
                      #   publish, moderate, batch create/delete, delete
routes/comments.aug   # create, list, flagged, update, batch, delete
routes/tags.aug       # create, list, suggest, delete
routes/logs.aug       # list, summary, query
routes/reports.aug    # overview, users cohort, ask
```

## Routes

| Method | Path | Divined work |
|---|---|---|
| GET | `/` · `/health` | native — index + health |
| POST | `/auth/register` | validate payload, hash password, welcome line |
| POST | `/auth/login` | credential check, mint session token |
| POST | `/auth/logout` | revoke the current session |
| GET | `/auth/me` | the current user, hash omitted |
| POST | `/auth/refresh` | rotate the session token |
| POST | `/auth/password/reset` | re-hash and revise the user |
| GET | `/auth/sessions` | list the caller's session tokens |
| DELETE | `/auth/sessions` | revoke all the caller's sessions |
| GET | `/users` | list (paginated) |
| GET | `/users/get?id=` | one user |
| GET | `/users/search?q=` | semantic search |
| GET | `/users/role?role=` | filter by role |
| PATCH | `/users` | divined profile merge |
| POST | `/users/promote` | admin + divined policy check |
| POST | `/users/batch` | normalize + bulk insert |
| DELETE | `/users?id=` | admin delete |
| POST | `/posts` | enrich: slug, tags, summary, reading time, moderation |
| GET | `/posts` · `/posts/get?id=` | list / one |
| GET | `/posts/search?q=` | semantic search |
| GET | `/posts/feed` | personalized ranking |
| GET | `/posts/trending` | trending score ranking |
| PATCH | `/posts?id=` | divined edit |
| POST | `/posts/publish?id=` | state change |
| POST | `/posts/moderate?id=` | admin + divined verdict (auto-banish) |
| POST | `/posts/batch` | bulk insert |
| DELETE | `/posts/batch?criterion=` | divined bulk delete |
| DELETE | `/posts?id=` | delete |
| POST | `/comments` | toxicity check + insert |
| GET | `/comments?post=` | comments for a post |
| GET | `/comments/flagged` | divined moderation queue |
| PATCH | `/comments?id=` | edit |
| POST | `/comments/batch` | bulk insert |
| DELETE | `/comments?id=` | delete |
| POST | `/tags` · `GET /tags` | create (normalized) / list |
| GET | `/tags/suggest?text=` | divined tag suggestions |
| DELETE | `/tags?id=` | delete |
| GET | `/logs` | admin audit log (paginated) |
| GET | `/logs/summary` | divined anomaly summary |
| POST | `/logs/query` | natural-language audit query |
| GET | `/reports/overview` | divined dashboard |
| GET | `/reports/users` | divined cohort analysis |
| POST | `/reports/ask` | natural-language analytics |
