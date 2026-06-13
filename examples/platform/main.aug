// augur-platform: a deliberately over-built social platform API where the
// persistence and almost all the logic are DIVINED. The database is the amnesiac
// journal; auth, validation, search, moderation, and analytics are all the
// oracle's opinion. Routing and dispatch are kept native (certain) so requests
// actually reach a handler. ~45 routes across auth, users, posts, comments,
// tags, logs, and reports.
//
// Run it from this directory (needs a real oracle for sane answers):
//   cd examples/platform
//   ../../aug main.aug --oracle openrouter --model openai/gpt-4o-mini --remember
//
// A joke about LLM-driven software. Do not deploy it.

include "lib/store.aug"
include "lib/auth.aug"
include "routes/auth.aug"
include "routes/users.aug"
include "routes/posts.aug"
include "routes/comments.aug"
include "routes/tags.aug"
include "routes/logs.aug"
include "routes/reports.aug"

ritual handle(req) {
    certain {
        when req["method"] == "GET" and req["path"] == "/" ->
            give {status: 200, body: {name: "augur-platform", routes: 45, motto: "everything is divined"}}
        when req["method"] == "GET" and req["path"] == "/health" ->
            give {status: 200, body: {ok: yes}}
    }

    summon r = handleAuth(req)
    certain { when r != naught -> give r }
    r = handleUsers(req)
    certain { when r != naught -> give r }
    r = handlePosts(req)
    certain { when r != naught -> give r }
    r = handleComments(req)
    certain { when r != naught -> give r }
    r = handleTags(req)
    certain { when r != naught -> give r }
    r = handleLogs(req)
    certain { when r != naught -> give r }
    r = handleReports(req)
    certain { when r != naught -> give r }

    give {status: 404, body: {error: "not found", path: req["path"]}}
}

serve 8799 with handle
